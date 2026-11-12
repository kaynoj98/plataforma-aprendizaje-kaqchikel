import { requireStudent } from "@/lib/auth";
import { CourseReading } from "@/components/courses/course-reading";

export const metadata = { title: "Detalle del curso" };

export default async function Page({ params }: { params: Promise<{ courseId: string }> }) {
  await requireStudent();
  return <CourseReading {...await params} />;
}
