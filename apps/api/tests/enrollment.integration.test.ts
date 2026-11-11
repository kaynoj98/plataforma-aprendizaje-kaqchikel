import { randomUUID } from "node:crypto";
import argon2 from "argon2";
import request from "supertest";
import { describe, expect, it } from "vitest";
import { app } from "../src/app.js";
import { prisma } from "../src/lib/prisma.js";

// Ejecutar explícitamente contra el PostgreSQL de desarrollo del proyecto.
describe.runIf(process.env.TEST_ENROLLMENTS_DB === "1")("inscripción y progreso en PostgreSQL", () => {
  it("aísla estudiantes y calcula el progreso sobre la estructura publicada", async () => {
    const url = new URL(process.env.DATABASE_URL!);
    expect(["localhost", "127.0.0.1"]).toContain(url.hostname);
    expect([url.port, url.pathname]).toEqual(["5433", "/kaqchikel"]);
    expect(process.env.NODE_ENV).not.toBe("production");

    const courseId = randomUUID();
    const otherCourseId = randomUUID();
    const levelId = randomUUID();
    const unitId = randomUUID();
    const first = randomUUID();
    const second = randomUUID();
    const hidden = randomUUID();
    const userIds = [randomUUID(), randomUUID(), randomUUID()];
    const password = randomUUID();
    const passwordHash = await argon2.hash(password);
    const title = "Prueba 5.3 · Kaqchikel ä ë ï ö ü tz’ ch’";
    const path = "/api/v1/enrollments/" + courseId;

    try {
      const agents = [];
      for (const [index, id] of userIds.entries()) {
        const email = `prueba-etapa53-${id}@example.invalid`;
        await prisma.user.create({ data: { id, email, passwordHash, firstName: "Prueba",
          lastName: "Etapa 5.3", role: index === 2 ? "ADMIN" : "USER",
          status: "ACTIVE", emailVerifiedAt: new Date() } });
        const agent = request.agent(app);
        await agent.post("/api/v1/auth/login").send({ email, password }).expect(200);
        agents.push(agent);
      }
      const [student, other, admin] = agents;
      const course = { title, description: title, createdById: userIds[2]! };
      await prisma.course.create({ data: { ...course, id: otherCourseId, slug: "test-" + otherCourseId } });
      await prisma.course.create({ data: { ...course, id: courseId, slug: "test-" + courseId,
        status: "PUBLISHED", levels: { create: { id: levelId, title, status: "PUBLISHED",
          units: { create: { id: unitId, title, status: "PUBLISHED", lessons: {
            create: [first, second, hidden].map((id, position) => ({
              id, title, position, slug: "test-" + id, status: position === 2 ? "DRAFT" : "PUBLISHED",
            })),
          } } },
        } },
      } });
      const mark = path + "/lessons/" + first;
      await request(app).put(path).expect(401);
      await admin.put(path).expect(403);
      await student.put("/api/v1/enrollments/invalid").expect(400);
      await student.put("/api/v1/enrollments/" + otherCourseId).expect(404);
      await student.put(path).send({ userId: userIds[1] }).expect(400);
      await student.put(mark).expect(403);
      await Promise.all([student.put(path).expect(204), student.put(path).expect(204)]);
      expect(await prisma.enrollment.count({ where: { courseId } })).toBe(1);
      const progress = async () => (await student.get(path).expect(200)).body.data.progress;
      expect(await progress()).toMatchObject({ completed: 0, total: 2, percentage: 0, nextLessonId: first, title });
      expect((await other.get(path)).body.data.progress).toBeNull();
      await other.put(mark).expect(403);
      await student.put(mark).send({ percentage: 100 }).expect(400);
      await student.put(path + "/lessons/" + hidden).expect(404);
      await prisma.course.update({ where: { id: otherCourseId }, data: { status: "PUBLISHED" } });
      await student.put("/api/v1/enrollments/" + otherCourseId).expect(204);
      await student.put("/api/v1/enrollments/" + otherCourseId + "/lessons/" + first).expect(404);
      await Promise.all([student.put(mark).expect(204), student.put(mark).expect(204)]);
      expect(await progress()).toMatchObject({ completed: 1, total: 2, percentage: 50,
        nextLessonId: second, completedLessonIds: [first] });
      expect(await prisma.lessonProgress.count({ where: { lessonId: first } })).toBe(1);
      await other.put(path).expect(204);
      expect((await other.get(path)).body.data.progress.percentage).toBe(0);
      await prisma.lesson.update({ where: { id: first }, data: { deletedAt: new Date() } });
      expect(await progress()).toMatchObject({ completed: 0, total: 1, percentage: 0 });
      await student.put(mark).expect(404);
      await prisma.courseUnit.update({ where: { id: unitId }, data: { status: "ARCHIVED" } });
      expect(await progress()).toMatchObject({ completed: 0, total: 0, percentage: 0, nextLessonId: null });
      await student.put(path + "/lessons/" + second).expect(404);
      await prisma.courseUnit.update({ where: { id: unitId }, data: { status: "PUBLISHED" } });
      await student.put(path + "/lessons/" + second).expect(204);
      expect(await progress()).toMatchObject({ completed: 1, total: 1, percentage: 100, nextLessonId: null });
      expect((await student.get("/api/v1/enrollments")).body.data.enrollments).toContainEqual(
        expect.objectContaining({ courseId, title, percentage: 100 }),
      );
      await prisma.course.update({ where: { id: courseId }, data: { status: "ARCHIVED" } });
      expect((await student.get("/api/v1/enrollments")).body.data.enrollments).not.toContainEqual(
        expect.objectContaining({ courseId }),
      );
      await student.put(path).expect(404);
    } finally {
      await prisma.$transaction([
        prisma.enrollment.deleteMany({ where: { courseId: { in: [courseId, otherCourseId] }, userId: { in: userIds } } }),
        prisma.course.deleteMany({ where: { id: { in: [courseId, otherCourseId] }, createdById: userIds[2] } }),
        prisma.auditLog.deleteMany({ where: { actorUserId: { in: userIds } } }),
        prisma.user.deleteMany({ where: { id: { in: userIds }, email: { endsWith: "@example.invalid" } } }),
      ]);
    }
  }, 60000);
});
