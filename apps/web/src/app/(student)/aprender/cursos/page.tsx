import Link from "next/link";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { requireStudent } from "@/lib/auth";
import { getCourses, getEnrollments } from "@/lib/student-courses";
import { CourseProgress } from "@/components/courses/course-progress";

export const metadata = { title: "Cursos" };

export default async function CoursesPage({ searchParams }: {
  searchParams: Promise<{ page?: string | string[] }>;
}) {
  await requireStudent();
  const { page: raw } = await searchParams;
  const page = raw === undefined ? 1 : Number(raw);
  if (Array.isArray(raw) || !Number.isSafeInteger(page) || page < 1 || page > 1000000) {
    redirect("/aprender/cursos");
  }
  const [{ courses, totalPages }, enrollments] = await Promise.all([getCourses(page), getEnrollments()]);
  const byCourse = new Map(enrollments.map(item => [item.courseId, item]));
  const last = Math.max(totalPages, 1);
  if (page > last) redirect(`/aprender/cursos?page=${last}`);

  return (
    <main className="min-h-screen bg-muted/30 px-4 py-8 sm:px-6">
      <div className="mx-auto max-w-5xl space-y-6">
        <Link href="/aprender" className="text-sm underline">Volver a Aprender</Link>
        <h1 className="text-3xl font-bold">Cursos de Kaqchikel</h1>
        {courses.length === 0 ? (
          <p role="status" className="rounded-xl border bg-card p-6">Aún no hay cursos disponibles.</p>
        ) : (
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {courses.map(course => {
              const progress = byCourse.get(course.id);
              return (
              <li key={course.id} className="flex min-w-0 flex-col gap-3 rounded-xl border bg-card p-5 shadow-sm">
                <p className="text-xs font-medium text-muted-foreground">Dificultad · {course.difficulty}</p>
                <h2 className="break-words text-xl font-semibold">{course.title}</h2>
                <p className="line-clamp-3 break-words text-sm text-muted-foreground">{course.description}</p>
                {progress && <CourseProgress progress={progress} />}
                <Button asChild className="mt-auto self-start">
                  <Link href={`/aprender/cursos/${course.id}`} aria-label={`Ver curso: ${course.title}`}>Ver curso</Link>
                </Button>
              </li>
              );
            })}
          </ul>
        )}
        {totalPages > 1 && (
          <nav aria-label="Páginas de cursos" className="flex flex-wrap items-center gap-3">
            {page > 1 && <Button asChild variant="outline"><Link href={`?page=${page - 1}`}>Anterior</Link></Button>}
            <span className="text-sm">Página {page} de {totalPages}</span>
            {page < totalPages && <Button asChild variant="outline"><Link href={`?page=${page + 1}`}>Siguiente</Link></Button>}
          </nav>
        )}
      </div>
    </main>
  );
}
