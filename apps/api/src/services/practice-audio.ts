import { spawn, execFile } from "node:child_process";
import { mkdtemp, open, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { env } from "../config/env.js";
import { AppError } from "../errors/app-error.js";

const demuxers: Record<string, string> = {
  "audio/mpeg": "mp3",
  "audio/wav": "wav",
  "audio/x-wav": "wav",
  "audio/ogg": "ogg",
  "audio/mp4": "mov",
};
const rate = 32000;
const maxSamples = rate * 300;
const invalid = () =>
  new AppError(
    400,
    "INVALID_PRACTICE_AUDIO",
    "Comprueba el formato y la duración de la grabación (máximo cinco minutos).",
  );

// RSS total además del límite de asignación individual impuesto a libav.
async function workingSet(pid: number): Promise<number> {
  if (process.platform === "linux") {
    const status = await readFile("/proc/" + pid + "/status", "utf8");
    return Number(/^VmRSS:\s+(\d+)/m.exec(status)?.[1] ?? 0) * 1024;
  }
  if (process.platform === "win32") {
    return new Promise((resolve, reject) =>
      execFile(
        "powershell.exe",
        [
          "-NoProfile",
          "-NonInteractive",
          "-Command",
          "(Get-Process -Id " + pid + " -ErrorAction Stop).WorkingSet64",
        ],
        { windowsHide: true, timeout: 4000 },
        (error, out) => (error ? reject(error) : resolve(Number(out.trim()))),
      ),
    );
  }
  throw new Error("Plataforma de procesamiento no configurada.");
}

async function run(
  executable: string,
  args: string[],
  input: string,
  limit: number,
  timeout: number,
) {
  const source = await open(input, "r");
  try {
    return await new Promise<Buffer>((resolve, reject) => {
      const child = spawn(executable, args, {
        shell: false,
        windowsHide: true,
        stdio: [source.fd, "pipe", "ignore"],
        env: {
          PATH: process.env.PATH,
          SystemRoot: process.env.SystemRoot,
          LANG: "C",
        },
      });
      const chunks: Buffer[] = [];
      let size = 0,
        exceeded = false,
        checking = false;
      function abort() {
        exceeded = true;
        child.kill("SIGKILL");
      }
      const timer = setTimeout(abort, timeout);
      const monitor = setInterval(async () => {
        if (checking || !child.pid) return;
        checking = true;
        try {
          if ((await workingSet(child.pid)) > 256 * 1024 * 1024) abort();
        } catch {
          if (child.exitCode === null && child.signalCode === null) abort();
        } finally {
          checking = false;
        }
      }, 1000);
      child.stdout!.on("data", (chunk: Buffer) => {
        size += chunk.length;
        if (size > limit) abort();
        else chunks.push(chunk);
      });
      child.once("error", () =>
        reject(
          new AppError(
            503,
            "AUDIO_TOOLS_UNAVAILABLE",
            "Verifica la instalación local de FFmpeg y FFprobe.",
          ),
        ),
      );
      child.once("close", (code) => {
        clearTimeout(timer);
        clearInterval(monitor);
        if (code === 0 && !exceeded && size)
          resolve(Buffer.concat(chunks, size));
        else reject(invalid());
      });
    });
  } finally {
    await source.close();
  }
}

export async function practiceAudio(bytes: Uint8Array, mime: string) {
  const format = demuxers[mime];
  if (!format || !bytes.length || bytes.length > 30 * 1024 * 1024)
    throw invalid();
  const dir = await mkdtemp(join(tmpdir(), "kaq-audio-"));
  try {
    const input = join(dir, "source"),
      output = join(dir, "practice.wav");
    await writeFile(input, bytes, { mode: 0o600 });
    // fd:0 es un descriptor regular con búsqueda, incluso para M4A con moov al final.
    const common = [
      "-v",
      "error",
      "-max_alloc",
      "33554432",
      "-protocol_whitelist",
      "fd,pipe",
    ];
    const pcm = await run(
      env.FFMPEG_PATH,
      [
        "-nostdin",
        "-xerror",
        ...common,
        "-format_whitelist",
        format,
        "-probesize",
        "1048576",
        "-analyzeduration",
        "5000000",
        "-threads",
        "1",
        "-f",
        format,
        "-i",
        "fd:",
        "-map",
        "0:a:0",
        "-map_metadata",
        "-1",
        "-map_chapters",
        "-1",
        "-vn",
        "-sn",
        "-dn",
        "-filter_threads",
        "1",
        "-ac",
        "1",
        "-ar",
        String(rate),
        "-threads",
        "1",
        "-t",
        "301",
        "-c:a",
        "pcm_s16le",
        "-f",
        "s16le",
        "pipe:1",
      ],
      input,
      maxSamples * 2,
      60000,
    );
    // Construir un WAV PCM únicamente con fmt/data excluye carátulas, capítulos e INFO.
    const header = Buffer.alloc(44);
    header.write("RIFF");
    header.writeUInt32LE(pcm.length + 36, 4);
    header.write("WAVEfmt ", 8);
    header.writeUInt32LE(16, 16);
    header.writeUInt16LE(1, 20);
    header.writeUInt16LE(1, 22);
    header.writeUInt32LE(rate, 24);
    header.writeUInt32LE(rate * 2, 28);
    header.writeUInt16LE(2, 32);
    header.writeUInt16LE(16, 34);
    header.write("data", 36);
    header.writeUInt32LE(pcm.length, 40);
    const wav = Buffer.concat([header, pcm]);
    await writeFile(output, wav, { mode: 0o600 });
    const report = JSON.parse(
      (
        await run(
          env.FFPROBE_PATH,
          [
            ...common,
            "-f",
            "wav",
            "-show_format",
            "-show_streams",
            "-show_chapters",
            "-of",
            "json",
            "fd:",
          ],
          output,
          65536,
          10000,
        )
      ).toString(),
    );
    const stream = report.streams?.[0];
    if (
      report.streams?.length !== 1 ||
      stream.codec_name !== "pcm_s16le" ||
      stream.channels !== 1 ||
      Number(stream.sample_rate) !== rate ||
      report.chapters?.length ||
      Object.keys(report.format.tags ?? {}).length ||
      Object.keys(stream.tags ?? {}).length
    )
      throw invalid();
    return wav;
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
}
