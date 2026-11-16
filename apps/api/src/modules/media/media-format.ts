import { extname } from "node:path";
import { open } from "node:fs/promises";
import { AppError } from "../../errors/app-error.js";

const formats: Record<
  string,
  { extensions: string[]; matches: (header: Buffer) => boolean }
> = {
  "image/jpeg": {
    extensions: ["jpg", "jpeg", "jfif"],
    matches: (b) => b.subarray(0, 3).equals(Buffer.from([255, 216, 255])),
  },
  "image/png": {
    extensions: ["png"],
    matches: (b) =>
      b.subarray(0, 8).equals(Buffer.from("89504e470d0a1a0a", "hex")),
  },
  "image/gif": {
    extensions: ["gif"],
    matches: (b) => /^GIF8[79]a/.test(b.toString("ascii", 0, 6)),
  },
  "image/webp": { extensions: ["webp"], matches: (b) => riff(b, "WEBP") },
  "audio/mpeg": {
    extensions: ["mp3", "mp2", "mpeg", "mpga"],
    matches: (b) =>
      b.toString("ascii", 0, 3) === "ID3" ||
      (b[0] === 255 && ((b[1] ?? 0) & 224) === 224),
  },
  "audio/wav": { extensions: ["wav"], matches: (b) => riff(b, "WAVE") },
  "audio/x-wav": { extensions: ["wav"], matches: (b) => riff(b, "WAVE") },
  "audio/ogg": {
    extensions: ["ogg", "oga", "opus"],
    matches: (b) => b.toString("ascii", 0, 4) === "OggS",
  },
  "audio/mp4": { extensions: ["m4a", "mp4"], matches: mp4 },
  "video/mp4": { extensions: ["mp4"], matches: mp4 },
  "video/webm": {
    extensions: ["webm"],
    matches: (b) =>
      b.subarray(0, 4).equals(Buffer.from("1a45dfa3", "hex")) &&
      b.includes(Buffer.from("webm")),
  },
};
function riff(b: Buffer, type: string) {
  return (
    b.toString("ascii", 0, 4) === "RIFF" && b.toString("ascii", 8, 12) === type
  );
}
function mp4(b: Buffer) {
  return b.length >= 12 && b.toString("ascii", 4, 8) === "ftyp";
}

export async function validateUploadFormat(file: Express.Multer.File) {
  const format = formats[file.mimetype];
  if (!format) return; // Other accepted resources retain their existing upload validation.
  const handle = await open(file.path, "r");
  try {
    const header = Buffer.alloc(1024);
    const { bytesRead } = await handle.read(header, 0, header.length, 0);
    if (
      !format.extensions.includes(
        extname(file.originalname).slice(1).toLowerCase(),
      ) ||
      !format.matches(header.subarray(0, bytesRead))
    )
      throw new AppError(
        400,
        "INVALID_MEDIA_FORMAT",
        "La extensión, el tipo declarado y el formato del archivo deben coincidir.",
      );
  } finally {
    await handle.close();
  }
}
