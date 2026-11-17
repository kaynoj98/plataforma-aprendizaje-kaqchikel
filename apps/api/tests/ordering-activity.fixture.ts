import { randomUUID } from "node:crypto";
import type request from "supertest";
import { expect } from "vitest";
import { prisma } from "../src/lib/prisma.js";

type Agent = ReturnType<typeof request.agent>;
type Card = { key: string; label: string };
function keysFor(cards: Card[], labels: string[]) {
  const remaining = [...cards];
  return labels.map((label) => {
    const index = remaining.findIndex((card) => card.label === label);
    expect(index).toBeGreaterThanOrEqual(0);
    return remaining.splice(index, 1)[0]!.key;
  });
}
export async function verifyOrdering(
  admin: Agent,
  user: Agent,
  other: Agent,
  lessonId: string,
) {
  const id = randomUUID();
  const manage = "/api/v1/admin/lessons/" + lessonId + "/activities";
  const edit = "/api/v1/admin/activities/" + id;
  const start = "/api/v1/activities/" + id + "/attempts";
  const labels = ["tz’", "ä ë ï ö ü", "tz’", "!"];
  const question = {
    prompt: "Ordena los segmentos de prueba.",
    sentenceText: "tz’ ä ë ï ö ü tz’!",
    options: labels.map((label) => ({ label, correct: false })),
    alternativeOrders: [[1, 0, 2, 3]],
    feedback: "Comentario reservado",
  };
  const definition = {
    type: "SENTENCE_ORDERING",
    title: "Prueba de segmentos",
    instructions: "Ordena los segmentos.",
    questions: [question, { ...question, prompt: "Segunda indicación" }],
  };
  for (const fields of [
    { alternativeOrders: [[0, 1, 2]] },
    { alternativeOrders: [[0, 1, 1, 3]] },
    { alternativeOrders: [[0, 1, 2, 4]] },
    { sentenceText: "Diferente" },
  ]) {
    await admin
      .post(manage)
      .send({
        requestId: randomUUID(),
        position: 5,
        definition: { ...definition, questions: [{ ...question, ...fields }] },
      })
      .expect(400);
  }
  await admin
    .post(manage)
    .send({ requestId: id, position: 5, definition })
    .expect(201);
  expect(
    (await admin.get(edit).expect(200)).body.data.definition.questions[0],
  ).toMatchObject(question);
  const preview = edit + "/preview";
  await user.post(preview).send({ choices: [] }).expect(403);
  const sample = (await admin.post(preview).send({ choices: [] }).expect(200))
    .body.data.state;
  const sampleKeys = keysFor(sample.question.segments, labels);
  const sampleChoice = {
    questionId: sample.question.id,
    requestId: randomUUID(),
    segmentKeys: sampleKeys,
  };
  expect(
    (
      await admin
        .post(preview)
        .send({ versionId: sample.versionId, choices: [sampleChoice] })
        .expect(200)
    ).body.data.feedback.correct,
  ).toBe(true);
  expect(
    await prisma.activityAttempt.count({
      where: { version: { activityId: id } },
    }),
  ).toBe(0);
  const publish = (revision: number) =>
    admin
      .put(edit)
      .send({ revision, isVisible: true, position: 5 })
      .expect(200);
  await user.post(start).send({ requestId: randomUUID() }).expect(404);
  await publish(1);
  const begin = async () =>
    (await user.post(start).send({ requestId: randomUUID() }).expect(200)).body
      .data;
  const attempt = await begin();
  const path = "/api/v1/activity-attempts/" + attempt.attemptId + "/answers";
  const post = (data: object) => user.post(path).send(data);
  expect((await begin()).question).toEqual(attempt.question);
  expect(Object.keys(attempt.question).sort()).toEqual([
    "id",
    "prompt",
    "segments",
  ]);
  const cards: Card[] = attempt.question.segments;
  expect(new Set(cards.map((c) => c.key)).size).toBe(4);
  for (const card of cards) {
    expect(Object.keys(card).sort()).toEqual(["key", "label"]);
    expect(sampleKeys).not.toContain(card.key);
  }
  for (const secret of [
    question.sentenceText,
    question.feedback,
    "alternativeOrders",
    "correctPosition",
    "sentenceText",
  ])
    expect(JSON.stringify(attempt)).not.toContain(secret);
  const alternative = keysFor(cards, [
    labels[1]!,
    labels[0]!,
    labels[2]!,
    labels[3]!,
  ]);
  const answer = {
    ...sampleChoice,
    questionId: attempt.question.id,
    segmentKeys: alternative,
  };
  await other.post(path).send(answer).expect(404);
  for (const invalid of [
    sampleKeys,
    alternative.slice(1),
    [...alternative, alternative[0]],
    [alternative[0], ...alternative.slice(0, -1)],
  ])
    await post({ ...answer, segmentKeys: invalid }).expect(400);
  const repeats = await Promise.all([
    post(answer).expect(200),
    post(answer).expect(200),
  ]);
  expect(repeats[0]!.body.data).toEqual(repeats[1]!.body.data);
  expect(repeats[0]!.body.data.feedback).toMatchObject({
    correct: true,
    sentenceText: question.sentenceText,
  });
  expect(
    await prisma.activityOrderingSubmission.count({
      where: { attemptId: attempt.attemptId },
    }),
  ).toBe(1);
  await post({ ...answer, segmentKeys: [...alternative].reverse() }).expect(
    409,
  );
  await post({ ...answer, requestId: randomUUID() }).expect(409);
  const second = repeats[0]!.body.data.state.question;
  const wrong = {
    questionId: second.id,
    requestId: randomUUID(),
    segmentKeys: keysFor(second.segments, ["!", ...labels.slice(0, 3)]),
  };
  await admin
    .put(edit)
    .send({
      revision: 2,
      position: 5,
      isVisible: true,
      definition: {
        ...definition,
        questions: [{ ...question, alternativeOrders: [] }],
      },
    })
    .expect(200);
  await publish(3);
  expect((await begin()).question).toEqual(second);
  const race = await Promise.all([
    post(wrong),
    post({ ...wrong, requestId: randomUUID() }),
  ]);
  expect(race.map((r) => r.status).sort()).toEqual([200, 409]);
  expect(race.find((r) => r.status === 200)!.body.data.state.result).toEqual({
    total: 2,
    correct: 1,
    incorrect: 1,
    percentage: 50,
  });
  expect((await post(answer).expect(200)).body.data).toEqual(
    repeats[0]!.body.data,
  );
  expect(
    await prisma.activityOrderingSubmission.count({
      where: { attemptId: attempt.attemptId },
    }),
  ).toBe(2);
  const fresh = await begin();
  expect(fresh.versionId).not.toBe(attempt.versionId);
  const newAnswer = {
    questionId: fresh.question.id,
    requestId: randomUUID(),
    segmentKeys: keysFor(fresh.question.segments, [
      labels[1]!,
      labels[0]!,
      labels[2]!,
      labels[3]!,
    ]),
  };
  expect(
    (
      await user
        .post("/api/v1/activity-attempts/" + fresh.attemptId + "/answers")
        .send(newAnswer)
        .expect(200)
    ).body.data.feedback.correct,
  ).toBe(false);
}
