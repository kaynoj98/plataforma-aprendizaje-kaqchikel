import { randomUUID } from "node:crypto";
import { verifyVisualActivity } from "./visual-activity.fixture.js";
import {
  storageService,
  practiceImageKey,
} from "../src/services/storage.service.js";
import argon2 from "argon2";
import request from "supertest";
import { describe, it, expect } from "vitest";
import { app } from "../src/app.js";
import { prisma } from "../src/lib/prisma.js";
import {
  definition,
  totals,
} from "../src/modules/activities/activity.schemas.js";

const options = [
  { label: "A", correct: true },
  { label: "B", correct: false },
];
const draft = {
  title: "Prueba técnica",
  instructions: "Seleccione una opción.",
  questions: [
    { prompt: "Pregunta ä · ch’", feedback: "Comentario reservado", options },
    { prompt: "Pregunta 2", feedback: "", options },
  ],
};
it("valida una única clave, opciones distintas, Unicode y puntuación", () => {
  expect(definition.parse(draft).questions[0]?.prompt).toBe(
    draft.questions[0]!.prompt,
  );
  for (const opts of [
    [
      { label: "A", correct: false },
      { label: "B", correct: false },
    ],
    [
      { label: "A", correct: true },
      { label: "B", correct: true },
    ],
    [
      { label: "A", correct: true },
      { label: "A", correct: false },
    ],
  ])
    expect(
      definition.safeParse({
        ...draft,
        questions: [{ prompt: "?", options: opts }],
      }).success,
    ).toBe(false);
  expect(totals(3, 2)).toEqual({
    total: 3,
    correct: 2,
    incorrect: 1,
    percentage: 67,
  });
});
describe.runIf(process.env.TEST_ACTIVITIES_DB === "1")(
  "Práctica formativa en PostgreSQL",
  () => {
    it("protege roles, historial, claves, secuencia e idempotencia", async () => {
      const url = new URL(process.env.DATABASE_URL!);
      expect(["localhost", "127.0.0.1"]).toContain(url.hostname);
      expect([url.port, url.pathname]).toEqual(["5433", "/kaqchikel"]);
      expect(process.env.NODE_ENV).not.toBe("production");
      const users = [randomUUID(), randomUUID(), randomUUID()];
      const courseId = randomUUID(),
        lessonId = randomUUID(),
        wordId = randomUUID(),
        pw = randomUUID();
      const hash = await argon2.hash(pw);
      try {
        const agents = [];
        for (const [i, id] of users.entries()) {
          const email = id + "@example.invalid";
          await prisma.user.create({
            data: {
              id,
              email,
              passwordHash: hash,
              firstName: "Etapa",
              lastName: "6.1",
              role: i === 0 ? "ADMIN" : "USER",
              status: "ACTIVE",
              emailVerifiedAt: new Date(),
            },
          });
          const agent = request.agent(app);
          await agent
            .post("/api/v1/auth/login")
            .send({ email, password: pw })
            .expect(200);
          agents.push(agent);
        }
        const [admin, user, other] = agents;
        await prisma.course.create({
          data: {
            id: courseId,
            title: "Temporal",
            slug: courseId,
            description: "Temporal",
            status: "PUBLISHED",
            createdById: users[0]!,
            levels: {
              create: {
                title: "Nivel",
                status: "PUBLISHED",
                units: {
                  create: {
                    title: "Unidad",
                    status: "PUBLISHED",
                    lessons: {
                      create: {
                        id: lessonId,
                        title: "Lección",
                        slug: lessonId,
                        status: "PUBLISHED",
                      },
                    },
                  },
                },
              },
            },
          },
        });
        const list = "/api/v1/lessons/" + lessonId + "/activities",
          manage = list.replace("/lessons", "/admin/lessons");
        await request(app).get(list).expect(401);
        await user!.get(manage).expect(403);
        const id = randomUUID();
        const term =
          "Referencia temporal · ä, ë, ï, ö, ü, tz’, ch’, k’, q’, b’, t’";
        await prisma.vocabularyItem.create({
          data: {
            id: wordId,
            termKaqchikel: term,
            translationSpanish: "Prueba técnica",
            isActive: true,
          },
        });
        const createBody = {
          requestId: id,
          position: 0,
          definition: {
            ...draft,
            questions: draft.questions.map((q) => ({
              ...q,
              vocabularyId: wordId,
            })),
          },
        };
        const creations = await Promise.all(
          [1, 2].map(() => admin!.post(manage).send(createBody)),
        );
        expect(creations.map((r) => r.status).sort()).toEqual([201, 409]);
        const edit = "/api/v1/admin/activities/" + id,
          start = "/api/v1/activities/" + id + "/attempts";
        expect((await user!.get(list)).body.data).toEqual([]);
        await user!.post(start).send({ requestId: randomUUID() }).expect(404);
        const preview = (
          await admin!
            .post(edit + "/preview")
            .send({ choices: [] })
            .expect(200)
        ).body.data.state;
        expect(preview.question.options[0]).not.toHaveProperty("correct");
        expect(preview.question.term).toBe(term);
        await prisma.vocabularyItem.update({
          where: { id: wordId },
          data: { termKaqchikel: "Término revisado" },
        });
        await admin!
          .post(edit + "/preview")
          .send({
            versionId: preview.versionId,
            choices: [
              {
                questionId: preview.question.id,
                optionId: preview.question.options[0].id,
              },
            ],
          })
          .expect(200);
        expect(
          await prisma.activityAttempt.count({
            where: { version: { activityId: id } },
          }),
        ).toBe(0);
        const metadata = { position: 0, isVisible: true, revision: 1 };
        await admin!.put(edit).send(metadata).expect(200);
        await admin!.put(edit).send(metadata).expect(409);
        const key = randomUUID();
        const [r1, r2] = await Promise.all(
          [key, randomUUID()].map((requestId) =>
            user!.post(start).send({ requestId }).expect(200),
          ),
        );
        const state = r1.body.data;
        expect(r2.body.data.attemptId).toBe(state.attemptId);
        expect(state.question.term).toBe(term);
        expect(JSON.stringify(state)).not.toContain("Comentario reservado");
        expect(state.question.options[0]).not.toHaveProperty("correct");
        const submit =
          "/api/v1/activity-attempts/" + state.attemptId + "/answers";
        const choice = {
          questionId: state.question.id,
          optionId: state.question.options[0].id,
        };
        await other!.post(submit).send(choice).expect(404);
        await admin!.post(submit).send(choice).expect(403);
        await user!
          .post(submit)
          .send({ ...choice, percentage: 100 })
          .expect(400);
        await user!
          .post(submit)
          .send({ ...choice, optionId: randomUUID() })
          .expect(400);
        await user!
          .post(submit)
          .send({ ...choice, questionId: randomUUID() })
          .expect(409);
        const replies = await Promise.all(
          [1, 2].map(() => user!.post(submit).send(choice).expect(200)),
        );
        expect(replies[0]!.body.data.feedback).toEqual({
          correct: true,
          feedback: "Comentario reservado",
        });
        expect(
          await prisma.activityAnswer.count({
            where: { attemptId: state.attemptId },
          }),
        ).toBe(1);
        await user!
          .post(submit)
          .send({ ...choice, optionId: state.question.options[1].id })
          .expect(409);
        const next = replies[0]!.body.data.state.question,
          last = { questionId: next.id, optionId: next.options[1].id };
        await admin!
          .put(edit)
          .send({
            ...metadata,
            revision: 2,
            definition: {
              ...draft,
              title: "Nueva versión",
              questions: [draft.questions[0]],
            },
          })
          .expect(200);
        await user!.post(submit).send(last).expect(404);
        await admin!
          .put(edit)
          .send({ ...metadata, revision: 3 })
          .expect(200);
        await prisma.course.update({
          where: { id: courseId },
          data: { status: "DRAFT" },
        });
        await user!.post(submit).send(last).expect(404);
        await prisma.course.update({
          where: { id: courseId },
          data: { status: "PUBLISHED" },
        });
        const end = (await user!.post(submit).send(last).expect(200)).body.data
          .state;
        expect(end.result).toEqual({
          total: 2,
          correct: 1,
          incorrect: 1,
          percentage: 50,
        });
        expect(end.versionId).toBe(state.versionId);
        const newAttempt = (
          await user!.post(start).send({ requestId: randomUUID() }).expect(200)
        ).body.data;
        expect(newAttempt.total).toBe(1);
        expect(newAttempt.versionId).not.toBe(end.versionId);
        await verifyVisualActivity(
          admin!,
          user!,
          other!,
          lessonId,
          wordId,
          courseId,
        );
        expect(await prisma.lessonProgress.count({ where: { lessonId } })).toBe(
          0,
        );
        expect(await prisma.enrollment.count({ where: { courseId } })).toBe(0);
      } finally {
        const files = await prisma.mediaFile.findMany({
          where: { uploadedById: users[0] },
        });
        for (const file of files) {
          await storageService.delete(file.objectKey);
          if (file.mediaType === "IMAGE")
            await storageService.delete(practiceImageKey(file.objectKey));
        }
        const version = { activity: { lessonId } };
        await prisma.$transaction([
          prisma.activityAnswer.deleteMany({ where: { attempt: { version } } }),
          prisma.activityAttempt.deleteMany({ where: { version } }),
          prisma.activityOption.deleteMany({
            where: { question: { version } },
          }),
          prisma.activityQuestion.deleteMany({ where: { version } }),
          prisma.activityVersion.deleteMany({
            where: { activity: { lessonId } },
          }),
          prisma.activity.deleteMany({ where: { lessonId } }),
          prisma.vocabularyItem.deleteMany({ where: { id: wordId } }),
          prisma.course.deleteMany({ where: { id: courseId } }),
          prisma.auditLog.deleteMany({ where: { actorUserId: { in: users } } }),
          prisma.mediaFile.deleteMany({ where: { uploadedById: users[0] } }),
          prisma.user.deleteMany({
            where: {
              id: { in: users },
              email: { endsWith: "@example.invalid" },
            },
          }),
        ]);
      }
    }, 120000);
  },
);
