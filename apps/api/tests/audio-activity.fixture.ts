import { randomUUID } from "node:crypto";
import { readFile } from "node:fs/promises";
import request from "supertest";
import { expect, vi } from "vitest";
import * as processor from "../src/services/practice-audio.js";
import { prisma } from "../src/lib/prisma.js";
type Agent = ReturnType<typeof request.agent>;

export async function verifyAudioActivity(
  admin: Agent,
  user: Agent,
  other: Agent,
  lessonId: string,
  wordId: string,
) {
  const id = randomUUID(),
    manage = "/api/v1/admin/lessons/" + lessonId + "/activities",
    edit = "/api/v1/admin/activities/" + id;
  const start = "/api/v1/activities/" + id + "/attempts";
  const recording = await readFile("tests/fixtures/lesson-silence.wav");
  async function upload(bytes: Buffer) {
    return (
      await admin
        .post("/api/v1/admin/media")
        .attach("file", bytes, {
          filename: "solucion-privada.wav",
          contentType: "audio/wav",
        })
        .expect(201)
    ).body.data.media.id as string;
  }
  const a = await upload(recording),
    b = await upload(recording);
  const damaged = await upload(Buffer.from("RIFF0000WAVE"));
  const transcript = "ä, ë, ï, ö, ü, tz’, ch’, k’, q’, b’, t’";
  const draft = (
    audioMediaId: string | null,
    audioTranscript: string | null,
  ) => ({
    type: "AUDIO_RECOGNITION",
    title: "Audio de prueba",
    instructions: "Escucha.",
    questions: [
      {
        prompt: "Selecciona una opción.",
        feedback: "Fin de la pregunta.",
        vocabularyId: wordId,
        audioMediaId,
        audioTranscript,
        options: [
          { label: "A", correct: true },
          { label: "B", correct: false },
        ],
      },
    ],
  });
  for (const bad of [
    draft(null, transcript),
    draft(a, null),
    draft(damaged, transcript),
  ]) {
    await admin
      .post(manage)
      .send({ position: 2, requestId: randomUUID(), definition: bad })
      .expect(400);
  }
  const convert = vi.spyOn(processor, "practiceAudio");
  try {
    const saves = await Promise.all(
      [1, 2].map(() =>
        admin
          .post(manage)
          .send({
            position: 2,
            requestId: id,
            definition: draft(a, transcript),
          }),
      ),
    );
    expect(saves.map((s) => s.status).sort()).toEqual([201, 409]);
    expect(convert).toHaveBeenCalledTimes(1);
  } finally {
    convert.mockRestore();
  }
  const preview = (
    await admin
      .post(edit + "/preview")
      .send({ choices: [] })
      .expect(200)
  ).body.data;
  const p = preview.state.question;
  expect(JSON.stringify(preview)).not.toContain(transcript);
  const previewLink = edit + "/questions/" + p.id + "/audio";
  await user.get(previewLink).expect(403);
  await admin.get(previewLink).expect(200);
  expect(
    await prisma.activityAttempt.count({
      where: { version: { activityId: id } },
    }),
  ).toBe(0);
  const publish = (revision: number) =>
    admin
      .put(edit)
      .send({ revision, isVisible: true, position: 2 })
      .expect(200);
  await publish(1);
  const begin = async () =>
    (await user.post(start).send({ requestId: randomUUID() }).expect(200)).body
      .data;
  const old = await begin(),
    q = old.question;
  expect(Object.keys(q).sort()).toEqual([
    "hasAudio",
    "id",
    "options",
    "prompt",
  ]);
  expect(q.options[0]).toEqual({ id: expect.any(String), label: "A" });
  const access = (attempt: string, question: string) =>
    "/api/v1/activity-attempts/" +
    attempt +
    "/questions/" +
    question +
    "/audio";
  const path = access(old.attemptId, q.id);
  await other.get(path).expect(404);
  await prisma.lesson.update({
    where: { id: lessonId },
    data: { status: "DRAFT" },
  });
  await user.get(path).expect(404);
  await prisma.lesson.update({
    where: { id: lessonId },
    data: { status: "PUBLISHED" },
  });
  await user.get("/api/v1/media/" + a + "/access").expect(404);
  const signed = async (url: string) => {
    const { data } = (await user.get(url).expect(200)).body;
    expect(Object.keys(data).sort()).toEqual(["expiresInMinutes", "url"]);
    expect(data.url).not.toContain("solucion");
    const response = await fetch(data.url);
    expect(response.status).toBe(200);
    const bytes = Buffer.from(await response.arrayBuffer());
    expect(bytes.subarray(8, 12).toString()).toBe("WAVE");
    return new URL(data.url).pathname;
  };
  const original = await signed(path);
  await admin
    .put(edit)
    .send({
      revision: 2,
      position: 2,
      isVisible: true,
      definition: draft(b, "Texto revisado"),
    })
    .expect(200);
  await user.get(path).expect(404);
  await publish(3);
  expect((await begin()).versionId).toBe(old.versionId);
  expect(await signed(path)).toBe(original);
  await admin.delete("/api/v1/admin/media/" + a).expect(409);
  await expect(prisma.mediaFile.delete({ where: { id: a } })).rejects.toThrow(
    /activity_questions_audio_media_id_fkey/,
  );
  const reply = "/api/v1/activity-attempts/" + old.attemptId + "/answers",
    choice = { questionId: q.id, optionId: q.options[0].id };
  await other.post(reply).send(choice).expect(404);
  await user
    .post(reply)
    .send({ ...choice, optionId: randomUUID() })
    .expect(400);
  for (let i = 0; i < 2; i++) {
    const data = (await user.post(reply).send(choice).expect(200)).body.data;
    expect(data.feedback.audioTranscript).toBe(transcript);
    expect(data.state.result.percentage).toBe(100);
  }
  expect(
    await prisma.activityAnswer.count({ where: { attemptId: old.attemptId } }),
  ).toBe(1);
  await user
    .post(reply)
    .send({ ...choice, optionId: q.options[1].id })
    .expect(409);
  const fresh = await begin();
  await user.get(access(fresh.attemptId, q.id)).expect(404);
  expect(await signed(access(fresh.attemptId, fresh.question.id))).not.toBe(
    original,
  );
  const latest = (
    await user
      .post("/api/v1/activity-attempts/" + fresh.attemptId + "/answers")
      .send({
        questionId: fresh.question.id,
        optionId: fresh.question.options[1].id,
      })
      .expect(200)
  ).body.data;
  expect(latest.feedback.audioTranscript).toBe("Texto revisado");
  expect(latest.state.result.percentage).toBe(0);
}
