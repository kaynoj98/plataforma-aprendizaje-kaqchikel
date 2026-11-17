import { describe, expect, it } from "vitest";
import { execFileSync } from "node:child_process";
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { env } from "../src/config/env.js";
import { practiceAudio } from "../src/services/practice-audio.js";

describe.runIf(process.env.TEST_ACTIVITIES_DB === "1")(
  "Procesamiento local de grabaciones",
  () => {
    it.each([
      ["mp3", "audio/mpeg"],
      ["wav", "audio/wav"],
      ["ogg", "audio/ogg"],
      ["m4a", "audio/mp4"],
    ])("quita las etiquetas de %s", async (ext, mime) => {
      const dir = await mkdtemp(join(tmpdir(), "kaq-fixture-"));
      try {
        const path = join(dir, "input." + ext);
        execFileSync(
          env.FFMPEG_PATH,
          [
            "-v",
            "error",
            "-stream_loop",
            "30",
            "-i",
            "tests/fixtures/lesson-silence.wav",
            "-metadata",
            "title=respuesta-reservada",
            path,
          ],
          { windowsHide: true },
        );
        const original = await readFile(path);
        const safe = await practiceAudio(original, mime);
        expect(safe.subarray(0, 4).toString()).toBe("RIFF");
        expect(safe.includes(Buffer.from("respuesta-reservada"))).toBe(false);
        expect(safe.readUInt32LE(40)).toBe(safe.length - 44);
      } finally {
        await rm(dir, { recursive: true, force: true });
      }
    });
    it("descarta capítulos, etiquetas y pistas adicionales", async () => {
      const dir = await mkdtemp(join(tmpdir(), "kaq-multitrack-"));
      try {
        const path = join(dir, "multi.m4a"),
          metadata = join(dir, "chapter.txt");
        await writeFile(
          metadata,
          ";FFMETADATA1\n[CHAPTER]\nTIMEBASE=1/1000\nSTART=0\nEND=30\ntitle=capitulo-privado\n",
        );
        execFileSync(
          env.FFMPEG_PATH,
          [
            "-v",
            "error",
            "-stream_loop",
            "30",
            "-i",
            "tests/fixtures/lesson-silence.wav",
            "-i",
            metadata,
            "-map",
            "0:a",
            "-map",
            "0:a",
            "-map_chapters",
            "1",
            "-metadata",
            "title=titulo-privado",
            path,
          ],
          { windowsHide: true },
        );
        const probe = (file: string) =>
          JSON.parse(
            execFileSync(
              env.FFPROBE_PATH,
              [
                "-v",
                "error",
                "-show_streams",
                "-show_format",
                "-show_chapters",
                "-of",
                "json",
                file,
              ],
              { encoding: "utf8", windowsHide: true },
            ),
          );
        const source = probe(path);
        expect(
          source.streams.filter(
            (s: { codec_type: string }) => s.codec_type === "audio",
          ),
        ).toHaveLength(2);
        expect(source.chapters.length).toBeGreaterThan(0);
        const safe = join(dir, "safe.wav");
        await writeFile(
          safe,
          await practiceAudio(await readFile(path), "audio/mp4"),
        );
        const result = probe(safe);
        expect(result.streams).toHaveLength(1);
        expect(result.chapters).toHaveLength(0);
        expect(result.format.tags).toBeUndefined();
      } finally {
        await rm(dir, { recursive: true, force: true });
      }
    });
    it("rechaza archivos dañados o de más de cinco minutos", async () => {
      await expect(
        practiceAudio(Buffer.from("RIFF0000WAVE"), "audio/wav"),
      ).rejects.toThrow();
      const head = Buffer.from(
        await practiceAudio(
          await readFile("tests/fixtures/lesson-silence.wav"),
          "audio/wav",
        ),
      ).subarray(0, 44);
      // Silencio de prueba con duración real, sin contenido lingüístico.
      const size = 8000 * 2 * 301;
      head.writeUInt32LE(8000, 24);
      head.writeUInt32LE(16000, 28);
      head.writeUInt32LE(size + 36, 4);
      head.writeUInt32LE(size, 40);
      await expect(
        practiceAudio(Buffer.concat([head, Buffer.alloc(size)]), "audio/wav"),
      ).rejects.toThrow();
    });
  },
);
