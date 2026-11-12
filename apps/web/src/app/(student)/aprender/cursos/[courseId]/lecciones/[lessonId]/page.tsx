import { requireStudent } from "@/lib/auth";
import { LessonReading } from "@/components/courses/lesson-reading";

export const metadata = { title: "Lección" };

export default async function Page({ params }: { params: Promise<{ courseId: string; lessonId: string }> }) {
  await requireStudent();
  return <LessonReading {...await params} />;
}
