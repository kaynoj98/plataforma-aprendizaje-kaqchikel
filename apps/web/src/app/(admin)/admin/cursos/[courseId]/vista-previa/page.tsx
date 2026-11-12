import { requireAdmin } from "@/lib/auth";
import { CourseReading } from "@/components/courses/course-reading";

export const metadata = { title: "Vista previa · Detalle del curso" };

export default async function Page({ params }: { params: Promise<{ courseId: string }> }) {
  await requireAdmin();
  return <CourseReading {...await params} preview />;
}
