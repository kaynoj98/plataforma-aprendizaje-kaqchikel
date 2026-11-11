import "server-only";

import { cookies } from "next/headers";
import { notFound, redirect } from "next/navigation";

const difficultyLabels = {
  BEGINNER: "Principiante",
  INTERMEDIATE: "Intermedio",
  ADVANCED: "Avanzado",
};

export type EnrollmentSummary = {
  courseId: string; title: string; completed: number; total: number;
  percentage: number; nextLessonId: string | null;
};

export async function getEnrollments() {
  const response = await readLearning("enrollments");
  const result = await response.json() as { data: { enrollments: EnrollmentSummary[] } };
  return result.data.enrollments;
}

export async function getCourseProgress(courseId: string) {
  const response = await readLearning("enrollments/" + uuid(courseId));
  const result = await response.json() as {
    data: { progress: (EnrollmentSummary & { completedLessonIds: string[] }) | null };
  };
  return result.data.progress;
}

type Course = {
  id: string;
  title: string;
  description: string;
  objectives: string | null;
  difficulty: keyof typeof difficultyLabels;
};

async function readLearning(path: string) {
  const session = (await cookies()).get("kaqchikel_session");
  if (!session) redirect("/login");

  const base = process.env.API_INTERNAL_URL ?? "http://127.0.0.1:4000";
  const response = await fetch(base + "/api/v1/" + path, {
    headers: { Cookie: `kaqchikel_session=${session.value}` },
    cache: "no-store",
  });
  if (response.status === 401 || response.status === 403) redirect("/login");
  if (response.status === 404) notFound();
  if (!response.ok) throw new Error("No se pudieron consultar los cursos.");
  return response;
}

// La API también devuelve datos del creador. Solo estos campos llegan a la vista.
function presentCourse(course: Course) {
  return { id: course.id, title: course.title, description: course.description,
    objectives: course.objectives, difficulty: difficultyLabels[course.difficulty] };
}

export async function getCourses(page: number) {
  const response = await readLearning(`courses?page=${page}&pageSize=12`);
  const result = await response.json() as {
    success: boolean; data: Course[]; pagination: { totalPages: number };
  };
  if (!result.success || !Array.isArray(result.data) || !result.pagination) {
    throw new Error("El catálogo de cursos no está disponible.");
  }
  return { courses: result.data.map(presentCourse), totalPages: result.pagination.totalPages };
}

type Entry = { id: string; title: string; description: string | null };
type Level = Entry & { units: (Entry & { lessons: (Entry & { estimatedMinutes: number })[] })[] };
type Block = { id: string; type: string; title: string | null; content: Record<string, unknown> };
type Lesson = Entry & {
  estimatedMinutes: number;
  unit: { title: string; level: { title: string; course: { id: string; title: string } } };
  blocks: Block[];
};
type WordLink = { vocabulary: {
  id: string; termKaqchikel: string; translationEs: string;
  imageMedia: { id: string } | null; pronunciationMedia: { id: string } | null;
} };

function uuid(value: string) {
  if (!/^(?:[\da-f]{8}-[\da-f]{4}-[1-8][\da-f]{3}-[89ab][\da-f]{3}-[\da-f]{12}|00000000-0000-0000-0000-000000000000|ffffffff-ffff-ffff-ffff-ffffffffffff)$/i.test(value)) notFound();
  return value.toLowerCase();
}

export async function getCourse(id: string) {
  const path = "courses/" + uuid(id);
  // El detalle incluye objetivos. La estructura incluye únicamente descendientes publicados.
  const [detail, structure] = await Promise.all([readLearning(path), readLearning(path + "/structure")]);
  const result = await detail.json() as { success: boolean; data: { course: Course } };
  const tree = await structure.json() as { success: boolean; data: { course: { levels: Level[] } } };
  if (!result.success || !result.data?.course || !tree.success || !Array.isArray(tree.data?.course?.levels)) {
    throw new Error("No se pudo cargar el curso.");
  }
  return { ...presentCourse(result.data.course), levels: tree.data.course.levels };
}

export async function getCourseLesson(courseId: string, lessonId: string) {
  const course = uuid(courseId);
  const path = "lessons/" + uuid(lessonId);
  const response = await readLearning(path);
  const result = await response.json() as { success: boolean; data: { lesson: Lesson } };
  if (!result.success || !result.data?.lesson) throw new Error("No se pudo cargar la lección.");
  const lesson = result.data.lesson;
  if (lesson.unit.level.course.id !== course) notFound();

  const vocabulary = await readLearning(path + "/vocabulary");
  const words = await vocabulary.json() as { success: boolean; data: { items: WordLink[] } };
  if (!words.success || !Array.isArray(words.data?.items)) throw new Error("No se pudo cargar el vocabulario de la lección.");
  return { lesson, words: words.data.items.map(link => link.vocabulary) };
}
