import "server-only";

import { cookies } from "next/headers";
import { notFound, redirect } from "next/navigation";

export type Kind = "courses" | "levels" | "units" | "lessons";
export type AcademicItem = {
  id: string; title: string; description: string | null; position: number;
  status: "DRAFT" | "PUBLISHED" | "ARCHIVED"; deletedAt: string | null; updatedAt: string;
  slug?: string; estimatedMinutes?: number; objectives?: string | null;
  difficulty?: string; isPublicPreview?: boolean;
};

export function academicId(id: string) {
  if (!/^[\da-f]{8}-[\da-f]{4}-[1-8][\da-f]{3}-[89ab][\da-f]{3}-[\da-f]{12}$/i.test(id)) notFound();
  return id.toLowerCase();
}

async function adminRead<T>(path: string): Promise<T> {
  const session = (await cookies()).get("kaqchikel_session");
  if (!session) redirect("/login");
  const base = process.env.API_INTERNAL_URL ?? "http://127.0.0.1:4000";
  const response = await fetch(base + "/api/v1/admin/" + path, {
    cache: "no-store", headers: { Cookie: `kaqchikel_session=${session.value}` },
  });
  if (response.status === 401) redirect("/login");
  if (response.status === 403) redirect("/aprender");
  if (response.status === 404) notFound();
  if (!response.ok) throw new Error("No se pudo cargar la información académica.");
  return response.json();
}

export function listAdminCourses(page: number, pageSize = 20) {
  return adminRead<{data: AcademicItem[]; pagination: {totalPages: number; totalItems: number}}>(
    `courses?page=${page}&pageSize=${pageSize}&sortBy=position&sortOrder=asc`,
  );
}
export async function readCourse(id: string) {
  const result = await adminRead<{ data: { course: AcademicItem } }>("courses/" + academicId(id));
  return result.data.course;
}
export async function children(parent: Kind, id: string, kind: Exclude<Kind, "courses">) {
  const result = await adminRead<{ data: Record<typeof kind, AcademicItem[]> }>(
    `${parent}/${academicId(id)}/${kind}?includeArchived=true`,
  );
  return result.data[kind].filter(item => !item.deletedAt);
}

type Report = {
  title: string; totalLessons: number; totalEnrolled: number; finished: number;
  students: { enrollmentId: string; student: { firstName: string; lastName: string; email: string };
    enrolledAt: string; completed: number; percentage: number;
    lessons: { title: string; completedAt: string; counts: boolean }[] }[];
};
export async function readReport(courseId: string) {
  return (await adminRead<{ data: Report }>(`courses/${academicId(courseId)}/enrollments`)).data;
}

export type LessonBlock = {
  id: string; lessonId: string; mediaId: string | null; type: string; title: string | null;
  position: number; isVisible: boolean; content: Record<string, unknown>;
};
export type BlockList = { blocks: LessonBlock[]; revision: string };

export type LessonWord = {
  id: string; termKaqchikel: string; translationEs: string; isActive: boolean;
  imageMedia: { id: string } | null; pronunciationMedia: { id: string } | null;
};
export type LessonWordLink = { position: number; isVisible: boolean; vocabulary: LessonWord };

export async function readLessonWords(lessonId: string) {
  const result = await adminRead<{ data: { items: LessonWordLink[] } }>(
    "lessons/" + academicId(lessonId) + "/vocabulary",
  );
  return result.data.items;
}

export async function readBlocks(lessonId: string) {
  const result = await adminRead<{ data: BlockList }>(`lessons/${academicId(lessonId)}/blocks`);
  if (typeof result.data.revision !== "string") throw new Error("La API de bloques requiere actualización.");
  if (result.data.blocks.some(block => block.lessonId !== lessonId)) notFound();
  return result.data;
}
