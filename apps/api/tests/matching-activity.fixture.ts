import { randomUUID } from "node:crypto";
import { expect } from "vitest";
import request from "supertest";
import { prisma } from "../src/lib/prisma.js";
type Agent = ReturnType<typeof request.agent>;
type Card = { key: string; label: string; done: boolean };
type State = {
  terms: Card[];
  translations: Card[];
  attemptId: string;
  versionId: string;
  resumeKey: string;
  incorrect: number;
};
export async function verifyMatching(
  admin: Agent,
  user: Agent,
  other: Agent,
  lessonId: string,
  wordId: string,
) {
  const manage = "/api/v1/admin/lessons/" + lessonId + "/activities",
    id = randomUUID(),
    edit = "/api/v1/admin/activities/" + id;
  const pairs = ["ä ë ï ö ü tz’ ch’ k’ q’ b’ t’", "B", "C"].map((term, i) => ({
    term,
    translation: "Etiqueta " + (i + 1),
    feedback: "Comentario reservado " + i,
    vocabularyId: i === 0 ? wordId : null,
  }));
  const definition = {
    type: "MATCHING",
    title: "Tablero técnico",
    instructions: "Relaciona.",
    pairs,
  };
  const create = (items: typeof pairs, key = randomUUID()) =>
    admin
      .post(manage)
      .send({
        requestId: key,
        position: 3,
        definition: { ...definition, pairs: items },
      });
  await create(pairs.slice(0, 2)).expect(400);
  await create(
    Array.from({ length: 9 }, (_, i) => ({
      ...pairs[0]!,
      term: String(i),
      translation: String(i),
    })),
  ).expect(400);
  await create(
    pairs.map((p, i) =>
      i === 1 ? { ...p, translation: "  ETIQUETA   1 " } : p,
    ),
  ).expect(400);
  await create(
    pairs.map((p, i) =>
      i === 1 ? { ...p, term: pairs[0]!.term.normalize("NFD") } : p,
    ),
  ).expect(400);
  const origin = await prisma.vocabularyItem.findUniqueOrThrow({
    where: { id: wordId },
  });
  await prisma.vocabularyItem.update({
    where: { id: wordId },
    data: {
      variant: {
        create: { id: wordId, code: wordId, name: "Variante temporal" },
      },
    },
  });
  await create(pairs, id).expect(201);
  const catalog = await prisma.vocabularyItem.findUniqueOrThrow({
    where: { id: wordId },
  });
  expect([catalog.termKaqchikel, catalog.translationSpanish]).toEqual([
    origin.termKaqchikel,
    origin.translationSpanish,
  ]);
  const doc = (await admin.get(edit).expect(200)).body.data;
  expect(doc.definition.pairs.map((p: { term: string }) => p.term)).toEqual(
    pairs.map((p) => p.term),
  );
  const seed = randomUUID(),
    preview = edit + "/matching-preview";
  await user.post(preview).send({ seed, choices: [] }).expect(403);
  const sample = (
    await admin.post(preview).send({ seed, choices: [] }).expect(200)
  ).body.data.state as State;
  const pick = (state: State, l: number, r: number) => ({
    termKey: state.terms[l]!.key,
    translationKey: state.translations.find(
      (c) => c.label === pairs[r]!.translation,
    )!.key,
  });
  const simulated = (
    await admin
      .post(preview)
      .send({
        seed,
        versionId: sample.versionId,
        choices: [pick(sample, 0, 1), pick(sample, 0, 0)],
      })
      .expect(200)
  ).body.data.state;
  expect(simulated).toMatchObject({
    completed: 1,
    incorrect: 1,
    firstCorrect: 0,
  });
  expect(
    await prisma.activityAttempt.count({
      where: { version: { activityId: id } },
    }),
  ).toBe(0);
  const publish = (revision: number) =>
    admin
      .put(edit)
      .send({ position: 3, revision, isVisible: true })
      .expect(200);
  await publish(1);
  const begin = async (requestId: string) =>
    (
      await user
        .post("/api/v1/activities/" + id + "/attempts")
        .send({ requestId })
        .expect(200)
    ).body.data as State;
  const startKey = randomUUID(),
    state = await begin(startKey),
    path = "/api/v1/activity-attempts/" + state.attemptId + "/matches";
  expect(
    state.translations.every(
      (c) => Object.keys(c).sort().join() === "done,key,label",
    ),
  ).toBe(true);
  expect(
    new Set([...state.terms, ...state.translations].map((c) => c.key)).size,
  ).toBe(6);
  expect(JSON.stringify(state)).not.toContain(wordId);
  expect(JSON.stringify(state)).not.toContain("Comentario reservado");
  for (const card of state.terms)
    expect(Object.keys(card).sort()).toEqual([
      "done",
      "key",
      "label",
      "variant",
    ]);
  const wrong = { ...pick(state, 0, 1), requestId: randomUUID() };
  await other.post(path).send(wrong).expect(404);
  await user
    .post(path)
    .send({ ...wrong, percentage: 100 })
    .expect(400);
  await user
    .post(path)
    .send({ ...wrong, translationKey: sample.translations[0]!.key })
    .expect(400);
  const submit = (body: object) => user.post(path).send(body);
  const duplicates = await Promise.all([
    submit(wrong).expect(200),
    submit(wrong).expect(200),
  ]);
  expect(duplicates[0]!.body.data).toEqual(duplicates[1]!.body.data);
  expect(duplicates[0]!.body.data.state.incorrect).toBe(1);
  await submit({ ...pick(state, 0, 0), requestId: wrong.requestId }).expect(
    409,
  );
  await submit({ ...wrong, requestId: randomUUID() }).expect(200);
  const resume = await begin(randomUUID());
  await prisma.vocabularyVariant.update({
    where: { id: wordId },
    data: { name: "Variante revisada" },
  });
  await prisma.vocabularyItem.update({
    where: { id: wordId },
    data: {
      termKaqchikel: "Revisión técnica",
      translationSpanish: "Revisión editorial",
    },
  });
  expect((await begin(startKey)).terms[0]).toMatchObject({
    label: pairs[0]!.term,
    variant: "Variante temporal",
  });
  expect(resume.translations).toEqual(state.translations);
  expect(resume.resumeKey).toBe(startKey);
  expect(resume.incorrect).toBe(2);
  const changed = [...pairs]
    .reverse()
    .map((p, i) => (i === 0 ? { ...p, translation: "Edición nueva" } : p));
  await admin
    .put(edit)
    .send({
      revision: 2,
      position: 3,
      isVisible: true,
      definition: { ...definition, pairs: changed },
    })
    .expect(200);
  await submit({ ...pick(state, 0, 0), requestId: randomUUID() }).expect(404);
  await publish(3);
  for (const i of [0, 1]) {
    const statuses = await Promise.all(
      [1, 2].map(() =>
        submit({ ...pick(state, i, i), requestId: randomUUID() }),
      ),
    );
    expect(statuses.map((r) => r.status).sort()).toEqual([200, 409]);
  }
  const last = { ...pick(state, 2, 2), requestId: randomUUID() };
  const result = (await submit(last).expect(200)).body.data.state;
  expect(result).toMatchObject({
    finished: true,
    completed: 3,
    firstCorrect: 2,
    incorrect: 2,
    percentage: 67,
  });
  expect((await submit(wrong).expect(200)).body.data).toEqual(
    duplicates[0]!.body.data,
  );
  expect((await begin(startKey)).versionId).toBe(state.versionId);
  const fresh = await begin(randomUUID());
  expect(fresh.versionId).not.toBe(state.versionId);
  expect(fresh.translations.map((c) => c.label)).toContain("Edición nueva");
  const history = await prisma.activityMatchingSubmission.findFirstOrThrow({
    where: { attemptId: state.attemptId, correct: true },
  });
  await expect(
    prisma.activityMatchingSubmission.create({
      data: { ...history, sequence: 99, requestId: randomUUID() },
    }),
  ).rejects.toThrow();
  await expect(
    prisma.activityMatchingSubmission.create({
      data: {
        ...history,
        attemptId: fresh.attemptId,
        versionId: fresh.versionId,
        sequence: 1,
        requestId: randomUUID(),
      },
    }),
  ).rejects.toThrow();
  expect(
    await prisma.activityMatchingSubmission.count({
      where: { attemptId: state.attemptId },
    }),
  ).toBe(5);
}
