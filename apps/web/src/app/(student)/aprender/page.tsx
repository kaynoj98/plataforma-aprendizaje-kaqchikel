import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { LogoutButton } from "@/components/layout/logout-button";
import { requireStudent } from "@/lib/auth";
import { getEnrollments } from "@/lib/student-courses";
import { CourseProgress } from "@/components/courses/course-progress";

export const metadata: Metadata = {
  title: "Aprender Kaqchikel",
};

export default async function AprenderPage() {
  const user = await requireStudent();
  const enrollments = await getEnrollments();
  return (
    <main className="min-h-screen bg-muted/30 p-6">
      <div className="mx-auto max-w-5xl space-y-4 py-10">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <h1 className="text-3xl font-bold">Aprendamos Kaqchikel</h1>

          <LogoutButton />
        </div>
        <p className="text-muted-foreground">
          ¡Bienvenido, {user.firstName} {user.lastName}! Continúa aprendiendo el
          idioma Maya Kaqchikel.
        </p>

        <section className="space-y-3 rounded-xl border bg-card p-6 shadow-sm">
          <h2 className="text-xl font-semibold">Mis cursos</h2>
          {enrollments.length === 0 ? <p className="text-sm">Aún no te has inscrito en un curso.</p> :
            <ul className="divide-y">{enrollments.map(progress => (
              <li key={progress.courseId} className="space-y-3 py-3">
                <Link className="break-words font-medium underline" href={`/aprender/cursos/${progress.courseId}`}>{progress.title}</Link>
                <CourseProgress progress={progress} />
              </li>
            ))}</ul>}
        </section>
        <section className="space-y-3 rounded-xl border bg-card p-6 shadow-sm">
          <h2 className="text-xl font-semibold">Vocabulario audiovisual</h2>
          <p className="text-sm text-muted-foreground">Consulta palabras en Kaqchikel y escucha su pronunciación.</p>
          <Button asChild><Link href="/aprender/vocabulario">Explorar vocabulario</Link></Button>
        </section>

        <section className="space-y-3 rounded-xl border bg-card p-6 shadow-sm">
          <h2 className="text-xl font-semibold">Cursos</h2>
          <p className="text-sm text-muted-foreground">Explora los cursos disponibles para aprender Kaqchikel.</p>
          <Button asChild><Link href="/aprender/cursos">Ver cursos</Link></Button>
        </section>
      </div>
    </main>
  );
}
