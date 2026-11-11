import { Prisma } from "../../generated/prisma/client.js";
import { prisma } from "../../lib/prisma.js";
import { AppError } from "../../errors/app-error.js";

const published = { status: "PUBLISHED", deletedAt: null } as const;
const ordered = [{ position: "asc" }, { id: "asc" }] as const;
const courseSelection = {
  id: true, title: true,
  levels: { where: published, orderBy: [...ordered], select: {
    units: { where: published, orderBy: [...ordered], select: {
      lessons: { where: published, orderBy: [...ordered], select: { id: true } },
    } },
  } },
} satisfies Prisma.CourseSelect;

const selection = {
  course: { select: courseSelection },
  progress: { select: { lessonId: true } },
} satisfies Prisma.EnrollmentSelect;

function summarize(enrollment: Prisma.EnrollmentGetPayload<{ select: typeof selection }>) {
  const { course, progress } = enrollment;
  const lessons = course.levels.flatMap(level => level.units.flatMap(unit => unit.lessons));
  const recorded = new Set(progress.map(mark => mark.lessonId));
  const completedLessonIds = lessons.filter(lesson => recorded.has(lesson.id)).map(lesson => lesson.id);
  const total = lessons.length;
  const completed = completedLessonIds.length;
  return {
    courseId: course.id, title: course.title, completed, total,
    percentage: total ? Math.floor(100 * completed / total) : 0,
    nextLessonId: lessons.find(lesson => !recorded.has(lesson.id))?.id ?? null,
    completedLessonIds,
  };
}

export async function listEnrollments(userId: string) {
  const rows = await prisma.enrollment.findMany({
    where: { userId, course: published }, select: selection,
    orderBy: [{ enrolledAt: "desc" }, { id: "asc" }],
  });
  return rows.map(row => {
    const { courseId, title, completed, total, percentage, nextLessonId } = summarize(row);
    return { courseId, title, completed, total, percentage, nextLessonId };
  });
}

export async function getProgress(userId: string, courseId: string) {
  const row = await prisma.enrollment.findFirst({
    where: { userId, courseId, course: published }, select: selection,
  });
  return row ? summarize(row) : null;
}

// Validación e inserción comparten la misma instantánea SQL. ON CONFLICT
// permite repetir la petición incluso cuando llegan dos escrituras a la vez.
export async function enroll(userId: string, courseId: string) {
  const [result] = await prisma.$queryRaw<{ available: boolean }[]>`
    WITH available AS (
      SELECT id FROM courses WHERE id = ${courseId}::uuid AND status = 'PUBLISHED' AND deleted_at IS NULL
    ), inserted AS (
      INSERT INTO enrollments (id, user_id, course_id)
      SELECT gen_random_uuid(), ${userId}::uuid, id FROM available
      ON CONFLICT (user_id, course_id) DO NOTHING
    )
    SELECT EXISTS(SELECT FROM available) AS available`;
  if (!result?.available) throw new AppError(404, "COURSE_NOT_FOUND", "El curso no está disponible.");
}

export async function completeLesson(userId: string, courseId: string, lessonId: string) {
  const [result] = await prisma.$queryRaw<{ available: boolean; enrolled: boolean }[]>`
    WITH available AS (
      SELECT l.id FROM lessons l
      JOIN course_units u ON u.id = l.unit_id
      JOIN course_levels v ON v.id = u.level_id
      JOIN courses c ON c.id = v.course_id
      WHERE l.id = ${lessonId}::uuid AND c.id = ${courseId}::uuid
        AND l.status = 'PUBLISHED' AND l.deleted_at IS NULL
        AND u.status = 'PUBLISHED' AND u.deleted_at IS NULL
        AND v.status = 'PUBLISHED' AND v.deleted_at IS NULL
        AND c.status = 'PUBLISHED' AND c.deleted_at IS NULL
    ), mine AS (
      SELECT id FROM enrollments WHERE user_id = ${userId}::uuid AND course_id = ${courseId}::uuid
    ), inserted AS (
      INSERT INTO lesson_progress (id, enrollment_id, lesson_id)
      SELECT gen_random_uuid(), mine.id, available.id FROM mine CROSS JOIN available
      ON CONFLICT (enrollment_id, lesson_id) DO NOTHING
    )
    SELECT EXISTS(SELECT FROM available) AS available, EXISTS(SELECT FROM mine) AS enrolled`;
  if (!result?.available) throw new AppError(404, "LESSON_NOT_FOUND", "La lección no está disponible en este curso.");
  if (!result.enrolled) throw new AppError(403, "ENROLLMENT_REQUIRED", "Inscríbete al curso antes de completar la lección.");
}
