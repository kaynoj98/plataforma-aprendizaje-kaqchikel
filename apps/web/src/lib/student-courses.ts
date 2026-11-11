import "server-only";

import { cookies } from "next/headers";
import { notFound, redirect } from "next/navigation";

const difficultyLabels = {
  BEGINNER: "Principiante",
  INTERMEDIATE: "Intermedio",
  ADVANCED: "Avanzado",
};

type Course = {
  id: string;
  title: string;
  description: string;
  objectives: string | null;
  difficulty: keyof typeof difficultyLabels;
};

async function readCourses(path: string) {
  const session = (await cookies()).get("kaqchikel_session");
  if (!session) redirect("/login");

  const base = process.env.API_INTERNAL_URL ?? "http://127.0.0.1:4000";
  const response = await fetch(base + "/api/v1/courses" + path, {
    headers: { Cookie: `kaqchikel_session=${session.value}` },
    cache: "no-store",
  });
  if (response.status === 401 || response.status === 403) redirect("/login");
  if (response.status === 404 && path.startsWith("/")) notFound();
  if (!response.ok) throw new Error("No se pudieron consultar los cursos.");
  return response;
}

// La API también devuelve datos del creador. Solo estos campos llegan a la vista.
function presentCourse(course: Course) {
  return { id: course.id, title: course.title, description: course.description,
    objectives: course.objectives, difficulty: difficultyLabels[course.difficulty] };
}

export async function getCourses(page: number) {
  const response = await readCourses(`?page=${page}&pageSize=12`);
  const result = await response.json() as {
    success: boolean; data: Course[]; pagination: { totalPages: number };
  };
  if (!result.success || !Array.isArray(result.data) || !result.pagination) {
    throw new Error("El catálogo de cursos no está disponible.");
  }
  return { courses: result.data.map(presentCourse), totalPages: result.pagination.totalPages };
}

export async function getCourse(id: string) {
  if (!/^[\da-f]{8}(?:-[\da-f]{4}){3}-[\da-f]{12}$/i.test(id)) notFound();
  const response = await readCourses("/" + encodeURIComponent(id));
  const result = await response.json() as { success: boolean; data: { course: Course } };
  if (!result.success || !result.data?.course) throw new Error("No se pudo cargar el curso.");
  return presentCourse(result.data.course);
}
