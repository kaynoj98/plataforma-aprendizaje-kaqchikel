import { requireAdmin } from "@/lib/auth";
import { LessonReading } from "@/components/courses/lesson-reading";

export const metadata = { title: "Vista previa · Lección" };

export default async function Page({ params }: { params: Promise<{ courseId: string; lessonId: string }> }) {
  await requireAdmin();
  return <LessonReading {...await params} preview />;
}
