import { randomUUID } from "node:crypto";
import sharp from "sharp";
import request from "supertest";
import { expect } from "vitest";
import { prisma } from "../src/lib/prisma.js";

export async function verifyVisualActivity(
  admin: ReturnType<typeof request.agent>,
  user: ReturnType<typeof request.agent>,
  other: ReturnType<typeof request.agent>,
  lessonId: string,
  wordId: string,
  courseId: string,
) {
  const manage = "/api/v1/admin/lessons/" + lessonId + "/activities";
  const id = randomUUID(),
    edit = "/api/v1/admin/activities/" + id;
  const start = "/api/v1/activities/" + id + "/attempts";
  const upload = async (color: string) => {
    const bytes = await sharp({
      create: { width: 12, height: 8, channels: 3, background: color },
    })
      .withExif({ IFD0: { ImageDescription: "secreto-respuesta" } })
      .png()
      .toBuffer();
    const result = await admin
      .post("/api/v1/admin/media")
      .attach("file", bytes, {
        filename: "secreto-respuesta.png",
        contentType: "image/png",
      })
      .expect(201);
    return result.body.data.media.id as string;
  };
  const a = await upload("red"),
    b = await upload("blue");
  const wav = await admin
    .post("/api/v1/admin/media")
    .attach("file", "tests/fixtures/lesson-silence.wav", {
      filename: "audio.wav",
      contentType: "audio/wav",
    })
    .expect(201);
  const damaged = await admin
    .post("/api/v1/admin/media")
    .attach("file", Buffer.from("89504e470d0a1a0a", "hex"), {
      filename: "incompleta.png",
      contentType: "image/png",
    })
    .expect(201);
  const deleted = await upload("green");
  await admin.delete("/api/v1/admin/media/" + deleted).expect(200);
  const clue = "Fíjate en el color y la forma.";
  const visual = (
    imageMediaId: string | null,
    imageDescription: string | null = clue,
  ) => ({
    type: "IMAGE_RECOGNITION",
    title: "Prueba visual",
    instructions: "Observa la imagen.",
    questions: [
      {
        prompt: "Elige una opción.",
        feedback: "Después de responder",
        imageDescription,
        imageMediaId,
        vocabularyId: wordId,
        options: [
          { label: "tz’ ä", correct: true },
          { label: "ë ï", correct: false },
        ],
      },
    ],
  });
  for (const bad of [
    visual(null),
    visual(deleted),
    visual(damaged.body.data.media.id),
    visual(a, "Prueba técnica"),
    visual(a, null),
    visual(randomUUID()),
    visual(wav.body.data.media.id),
    visual(a, "Contiene tz’ ä."),
    visual(a, "Término revisado"),
  ]) {
    await admin
      .post(manage)
      .send({ position: 1, requestId: randomUUID(), definition: bad })
      .expect(400);
  }
  await admin
    .post(manage)
    .send({ position: 1, requestId: id, definition: visual(a) })
    .expect(201);
  const preview = (
    await admin
      .post(edit + "/preview")
      .send({ choices: [] })
      .expect(200)
  ).body.data.state;
  const previewImage = edit + "/questions/" + preview.question.id + "/image";
  await user.get(previewImage).expect(403);
  await admin.get(previewImage).expect(200);
  expect(
    await prisma.activityAttempt.count({
      where: { version: { activityId: id } },
    }),
  ).toBe(0);
  const publish = (revision: number) =>
    admin
      .put(edit)
      .send({ position: 1, isVisible: true, revision })
      .expect(200);
  await publish(1);
  const begin = () =>
    user.post(start).send({ requestId: randomUUID() }).expect(200);
  const old = (await begin()).body.data;
  const question = old.question;
  expect(question.imageDescription).toBe(clue);
  expect(Object.keys(question).sort()).toEqual([
    "id",
    "imageDescription",
    "options",
    "prompt",
  ]);
  expect(question.options[0]).toEqual({
    id: expect.any(String),
    label: "tz’ ä",
  });
  const image = (attempt: string, q: string) =>
    "/api/v1/activity-attempts/" + attempt + "/questions/" + q + "/image";
  const access = image(old.attemptId, question.id);
  await other.get(access).expect(404);
  await admin.get(access).expect(403);
  await user.get("/api/v1/media/" + a + "/access").expect(404);
  const link = (await user.get(access).expect(200)).body.data;
  expect(Object.keys(link).sort()).toEqual(["expiresInMinutes", "url"]);
  expect(link.url).not.toContain(a);
  expect(link.url).not.toContain("secreto");
  async function pixels(url: string) {
    const result = await fetch(url);
    expect(result.status).toBe(200);
    const bytes = Buffer.from(await result.arrayBuffer());
    const meta = await sharp(bytes).metadata();
    expect(meta.exif).toBeUndefined();
    expect(meta.xmp).toBeUndefined();
    expect([meta.width, meta.height]).toEqual([12, 8]);
    return sharp(bytes).raw().toBuffer();
  }
  const original = await pixels(link.url);
  await admin
    .put(edit)
    .send({ revision: 2, position: 1, isVisible: true, definition: visual(b) })
    .expect(200);
  await user.get(access).expect(404);
  await publish(3);
  await prisma.course.update({
    where: { id: courseId },
    data: { status: "DRAFT" },
  });
  await user.get(access).expect(404);
  await prisma.course.update({
    where: { id: courseId },
    data: { status: "PUBLISHED" },
  });
  expect((await begin()).body.data.versionId).toBe(old.versionId);
  expect(
    await pixels((await user.get(access).expect(200)).body.data.url),
  ).toEqual(original);
  await admin.delete("/api/v1/admin/media/" + a).expect(409);
  await expect(prisma.mediaFile.delete({ where: { id: a } })).rejects.toThrow(
    /activity_questions_image_media_id_fkey/,
  );
  const answer = { questionId: question.id, optionId: question.options[0].id };
  const end = await user
    .post("/api/v1/activity-attempts/" + old.attemptId + "/answers")
    .send(answer)
    .expect(200);
  expect(end.body.data.state.result.percentage).toBe(100);
  const fresh = (await begin()).body.data;
  expect(fresh.versionId).not.toBe(old.versionId);
  await user.get(image(fresh.attemptId, question.id)).expect(404);
  const newLink = (
    await user.get(image(fresh.attemptId, fresh.question.id)).expect(200)
  ).body.data.url;
  expect(await pixels(newLink)).not.toEqual(original);
}
