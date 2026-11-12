import Link from "next/link";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { listAdminCourses } from "@/lib/admin-academics";
import { Button } from "@/components/ui/button";
import { AcademicEditor } from "./academic-editor";

export const statusNames = { DRAFT: "Borrador", PUBLISHED: "Publicado", ARCHIVED: "Archivado" };
const sections = { cursos: "Cursos", contenidos: "Contenidos académicos", inscripciones: "Inscripciones y progreso" };

export async function CourseDirectory({ section, page }: { section: keyof typeof sections; page?: string | string[] }) {
  await requireAdmin();
  const number = page === undefined ? 1 : Number(page);
  if (Array.isArray(page) || !Number.isSafeInteger(number) || number < 1 || number > 1000000) redirect("/admin/" + section);
  const result = await listAdminCourses(number);
  const last = Math.max(1, result.pagination.totalPages);
  if (number > last) redirect(`/admin/${section}?page=${last}`);
  return <div className="space-y-5">
    <h1 className="text-2xl font-bold">{sections[section]}</h1>
    {section === "cursos" && <AcademicEditor kind="courses" endpoint="courses" />}
    {!result.data.length && <p>Aún no hay cursos registrados.</p>}
    <ul className="grid gap-4 md:grid-cols-2">{result.data.map(course => (
      <li key={course.id} className="min-w-0 space-y-3 rounded-xl border bg-card p-5">
        <p className="text-xs text-muted-foreground">{statusNames[course.status]} · Posición {course.position}</p>
        <h2 className="break-words text-lg font-semibold">{course.title}</h2>
        <p className="line-clamp-3 break-words text-sm">{course.description}</p>
        <Button variant="outline" asChild><Link href={`/admin/cursos/${course.id}${section === "inscripciones" ? "/inscripciones" : section === "contenidos" ? "#estructura" : ""}`}>
          {section === "inscripciones" ? "Consultar inscripciones" : section === "contenidos" ? "Gestionar estructura" : "Abrir curso"}
        </Link></Button>
      </li>
    ))}</ul>
    {last > 1 && <nav aria-label="Paginación" className="flex items-center gap-3">
      {number > 1 && <Link className="underline" href={`?page=${number-1}`}>Anterior</Link>}
      <span>Página {number} de {last}</span>
      {number < last && <Link className="underline" href={`?page=${number+1}`}>Siguiente</Link>}
    </nav>}
  </div>;
}
