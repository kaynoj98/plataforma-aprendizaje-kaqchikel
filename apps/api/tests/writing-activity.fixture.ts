import { randomUUID } from "node:crypto";
import { expect } from "vitest";
import request from "supertest";
import { prisma } from "../src/lib/prisma.js";

type Agent = ReturnType<typeof request.agent>;
export async function verifyWriting(
  admin: Agent,
  user: Agent,
  other: Agent,
  lessonId: string,
  wordId: string,
) {
  const id = randomUUID(),
    edit = "/api/v1/admin/activities/" + id,
    start = "/api/v1/activities/" + id + "/attempts";
  const principal = "ä ë ï ö ü tz’ ch’ k’ q’ b’ t’",
    alternative = "Variante autorizada ä";
  const options = [principal, alternative].map((label) => ({
    label,
    correct: true,
  }));
  const question = {
    prompt: "Indicación de prueba",
    feedback: "Comentario reservado",
    vocabularyId: wordId,
    options,
  };
  const definition = {
    type: "WRITING",
    title: "Práctica técnica",
    instructions: "Escribe la respuesta.",
    questions: [
      question,
      { ...question, prompt: "Segunda indicación", options: [options[0]] },
    ],
  };
  const manage = "/api/v1/admin/lessons/" + lessonId + "/activities";
  await admin
    .post(manage)
    .send({
      requestId: randomUUID(),
      position: 4,
      definition: {
        ...definition,
        questions: [
          {
            ...question,
            options: [
              options[0],
              { label: principal.normalize("NFD"), correct: true },
            ],
          },
        ],
      },
    })
    .expect(400);
  await admin
    .post(manage)
    .send({ requestId: id, position: 4, definition })
    .expect(201);
  const word = await prisma.vocabularyItem.findUniqueOrThrow({
    where: { id: wordId },
    include: { variant: true },
  });
  expect(word.variant).toBeTruthy();
  const stored = async () =>
    (await admin.get(edit).expect(200)).body.data.definition.questions[0];
  expect(await stored()).toMatchObject({
    term: word.termKaqchikel,
    variantSnapshot: word.variant!.name,
    options,
  });
  const preview = edit + "/preview";
  await user.post(preview).send({ choices: [] }).expect(403);
  const sample = (await admin.post(preview).send({ choices: [] }).expect(200))
    .body.data.state;
  expect(sample.question).toEqual({
    id: expect.any(String),
    prompt: question.prompt,
    writing: true,
  });
  const choice = {
    questionId: sample.question.id,
    requestId: randomUUID(),
    responseText: principal,
  };
  expect(
    (
      await admin
        .post(preview)
        .send({ versionId: sample.versionId, choices: [choice] })
        .expect(200)
    ).body.data.feedback,
  ).toMatchObject({ correct: true, accepted: [principal, alternative] });
  expect(
    await prisma.activityAttempt.count({
      where: { version: { activityId: id } },
    }),
  ).toBe(0);
  const begin = async (key = randomUUID()) =>
    (await user.post(start).send({ requestId: key }).expect(200)).body.data;
  const publish = (revision: number) =>
    admin
      .put(edit)
      .send({ revision, isVisible: true, position: 4 })
      .expect(200);
  await user.post(start).send({ requestId: randomUUID() }).expect(404);
  await publish(1);
  const old = await begin(),
    path = "/api/v1/activity-attempts/" + old.attemptId + "/answers";
  expect(old.question).toEqual(sample.question);
  for (const secret of [
    principal,
    alternative,
    wordId,
    word.termKaqchikel,
    word.variant!.name,
    question.feedback,
  ])
    expect(JSON.stringify(old)).not.toContain(secret);
  const raw = "  " + alternative.normalize("NFD") + " ";
  const body = { ...choice, responseText: raw };
  await other.post(path).send(body).expect(404);
  await user
    .post(path)
    .send({ ...body, percentage: 100 })
    .expect(400);
  await user
    .post(path)
    .send({ ...body, responseText: " " })
    .expect(400);
  await user
    .post(path)
    .send({ questionId: choice.questionId, optionId: randomUUID() })
    .expect(409);
  const post = (data: object) => user.post(path).send(data);
  const repeats = await Promise.all([
    post(body).expect(200),
    post(body).expect(200),
  ]);
  expect(repeats[0]!.body.data).toEqual(repeats[1]!.body.data);
  expect(repeats[0]!.body.data.feedback).toMatchObject({
    correct: true,
    accepted: [principal, alternative],
  });
  const row = await prisma.activityWritingSubmission.findUniqueOrThrow({
    where: {
      attemptId_questionId: {
        attemptId: old.attemptId,
        questionId: choice.questionId,
      },
    },
  });
  expect(row.responseText).toBe(raw);
  await post({ ...body, responseText: raw.trim() }).expect(409);
  const second = repeats[0]!.body.data.state.question.id;
  await post({ ...body, questionId: second }).expect(409);
  await prisma.vocabularyVariant.update({
    where: { id: word.variant!.id },
    data: { name: "Otra denominación técnica" },
  });
  await prisma.vocabularyItem.update({
    where: { id: wordId },
    data: { termKaqchikel: "Edición de prueba" },
  });
  expect(await stored()).toMatchObject({
    term: word.termKaqchikel,
    variantSnapshot: word.variant!.name,
  });
  const revised = {
    ...definition,
    questions: [
      { ...question, options: [{ label: "Nueva clave", correct: true }] },
    ],
  };
  await admin
    .put(edit)
    .send({ revision: 2, position: 4, isVisible: true, definition: revised })
    .expect(200);
  const wrong = {
    requestId: randomUUID(),
    questionId: second,
    responseText: principal.replace("ä", "a"),
  };
  await post(wrong).expect(404);
  await publish(3);
  expect((await begin()).versionId).toBe(old.versionId);
  const raced = await Promise.all([
    post(wrong),
    post({ ...wrong, requestId: randomUUID() }),
  ]);
  expect(raced.map((r) => r.status).sort()).toEqual([200, 409]);
  const end = raced.find((r) => r.status === 200)!.body.data;
  expect(end.feedback).toMatchObject({ correct: false, accepted: [principal] });
  expect(end.state.result).toEqual({
    total: 2,
    correct: 1,
    incorrect: 1,
    percentage: 50,
  });
  expect((await post(body).expect(200)).body.data).toEqual(
    repeats[0]!.body.data,
  );
  expect(
    await prisma.activityWritingSubmission.count({
      where: { attemptId: old.attemptId },
    }),
  ).toBe(2);
  const fresh = await begin(),
    freshPath = "/api/v1/activity-attempts/" + fresh.attemptId + "/answers";
  expect(fresh.versionId).not.toBe(old.versionId);
  await user.post(freshPath).send(body).expect(409);
  const last = (
    await user
      .post(freshPath)
      .send({
        requestId: randomUUID(),
        questionId: fresh.question.id,
        responseText: "Nueva clave",
      })
      .expect(200)
  ).body.data;
  expect(last.state.result.percentage).toBe(100);
}
