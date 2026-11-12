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
      // Curso efímero: recorrer las mismas colecciones y transiciones que el panel.
      const api = "/api/v1/admin";
      const draft = (await admin.post(api + "/courses").send({
        title, description: title, slug: "prueba-panel-" + courseId, position: 7,
      }).expect(201)).body.data.course;
      const level = (await admin.post(api + "/courses/" + draft.id + "/levels")
        .send({ title, position: 3 }).expect(201)).body.data.level;
      const unit = (await admin.post(api + "/levels/" + level.id + "/units")
        .send({ title, position: 2 }).expect(201)).body.data.unit;
      const lesson = (await admin.post(api + "/units/" + unit.id + "/lessons")
        .send({ title, position: 1 }).expect(201)).body.data.lesson;
      for (const [collection, record] of [["courses", draft], ["levels", level], ["units", unit], ["lessons", lesson]] as const) {
        const resource = api + "/" + collection + "/" + record.id;
        await admin.patch(resource).send({ description: "Edición académica de prueba" }).expect(200);
        await admin.post(resource + "/publish").expect(200);
      }
      const publishedCourse = (await student.get("/api/v1/courses/" + draft.id + "/structure").expect(200)).body.data.course;
      expect(publishedCourse.levels[0]).toMatchObject({ id: level.id, position: 3,
        units: [{ id: unit.id, position: 2, lessons: [{ id: lesson.id, position: 1 }] }] });
      await admin.post(api + "/lessons/" + lesson.id + "/unpublish").expect(200);
      await student.get("/api/v1/lessons/" + lesson.id).expect(404);
      await admin.post(api + "/courses/" + draft.id + "/archive").expect(200);
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
      const reportPath = "/api/v1/admin/courses/" + courseId + "/enrollments";
      await request(app).get(reportPath).expect(401);
      await student.get(reportPath).expect(403);
      await admin.get("/api/v1/admin/courses/invalido/enrollments").expect(400);
      const beforeReport = await progress();
      const report = (await admin.get(reportPath).expect(200)).body.data;
      expect(report).toMatchObject({ totalEnrolled: 1, totalLessons: 2, finished: 0,
        students: [{ completed: 1, percentage: 50, lessons: [{ title, counts: true }] }] });
      expect(await progress()).toEqual(beforeReport);
      const editPath = "/api/v1/admin/lessons/" + first;
      await student.patch(editPath).send({ description: "Prueba" }).expect(403);
      await admin.patch(editPath).send({ description: "Lección de prueba · q’" }).expect(200);
      expect((await student.get("/api/v1/lessons/" + first)).body.data.lesson.description).toBe("Lección de prueba · q’");
      await other.put(path).expect(204);
      expect((await other.get(path)).body.data.progress.percentage).toBe(0);
      await prisma.lesson.update({ where: { id: first }, data: { deletedAt: new Date() } });
      expect(await progress()).toMatchObject({ completed: 0, total: 1, percentage: 0 });
      expect((await admin.get(reportPath)).body.data.students[0]).toMatchObject({
        completed: 0, percentage: 0, lessons: [{ counts: false }],
      });
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
        prisma.course.deleteMany({ where: { createdById: userIds[2], OR: [
          { id: { in: [courseId, otherCourseId] } }, { slug: "prueba-panel-" + courseId },
        ] } }),
        prisma.auditLog.deleteMany({ where: { actorUserId: { in: userIds } } }),
        prisma.user.deleteMany({ where: { id: { in: userIds }, email: { endsWith: "@example.invalid" } } }),
      ]);
    }
  }, 60000);
});
