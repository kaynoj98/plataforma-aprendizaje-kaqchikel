import Link from "next/link";
import { requireStudent } from "@/lib/auth";
import { getCourse } from "@/lib/student-courses";

export const metadata = { title: "Detalle del curso" };

export default async function CoursePage({ params }: { params: Promise<{ courseId: string }> }) {
  await requireStudent();
  const course = await getCourse((await params).courseId);
  return (
    <main className="min-h-screen bg-muted/30 px-4 py-8 sm:px-6">
      <div className="mx-auto max-w-3xl space-y-6">
        <Link href="/aprender/cursos" className="text-sm underline">Volver a cursos</Link>
        <article className="space-y-4 break-words rounded-xl border bg-card p-5 shadow-sm sm:p-8">
          <p className="text-sm text-muted-foreground">Dificultad · {course.difficulty}</p>
          <h1 className="text-3xl font-bold">{course.title}</h1>
          <p className="whitespace-pre-line">{course.description}</p>
          {course.objectives?.trim() && <section className="space-y-2 border-t pt-4">
            <h2 className="text-lg font-semibold">Objetivos</h2>
            <p className="whitespace-pre-line">{course.objectives}</p>
          </section>}
        </article>
      </div>
    </main>
  );
}
