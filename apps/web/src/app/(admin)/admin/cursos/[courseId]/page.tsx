import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { academicId, children, readCourse } from "@/lib/admin-academics";
import type { AcademicItem, Kind } from "@/lib/admin-academics";
import { AcademicEditor } from "@/components/academics/academic-editor";
import { statusNames } from "@/components/academics/course-directory";

function StructureList({ title, rows, kind, collection, href, action }: {
  title: string; rows: AcademicItem[]; kind: Kind; collection: string;
  href?: (id: string) => string; action?: string;
}) {
  return <section className="min-w-0 space-y-3 rounded-xl border bg-card p-4">
    <h2 className="break-words text-lg font-semibold">{title}</h2>
    <AcademicEditor kind={kind} endpoint={collection} />
    {!rows.length && <p className="text-sm text-muted-foreground">Todavía no hay registros.</p>}
    <ul className="divide-y">{rows.map(item => <li key={item.id} className="space-y-2 py-3">
      <h3 className="break-words font-medium">{item.title}</h3>
      <p className="text-xs text-muted-foreground">{statusNames[item.status]} · Posición {item.position}</p>
      {href && <Link className="inline-block text-sm underline" href={href(item.id)}>{action}</Link>}
      <AcademicEditor key={item.updatedAt} kind={kind} endpoint={kind + "/" + item.id} item={item} />
    </li>)}</ul>
  </section>;
}

export default async function CourseAdmin({ params, searchParams }: {
  params: Promise<{ courseId: string }>; searchParams: Promise<{ nivel?: string; unidad?: string }>;
}) {
  await requireAdmin();
  const id = academicId((await params).courseId);
  const query = await searchParams;
  const [course, levels] = await Promise.all([readCourse(id), children("courses", id, "levels")]);
  const level = levels.find(row => row.id === query.nivel);
  if ((query.nivel && !level) || (query.unidad && !level)) notFound();
  const units = level ? await children("levels", level.id, "units") : [];
  const unit = units.find(row => row.id === query.unidad);
  if (query.unidad && !unit) notFound();
  const lessons = unit ? await children("units", unit.id, "lessons") : [];
  const base = "/admin/cursos/" + id;
  return <div className="space-y-5">
    <Link href="/admin/cursos" className="text-sm underline">Volver a cursos</Link>
    <header className="space-y-3 rounded-xl border bg-card p-5">
      <p className="text-sm text-muted-foreground">{statusNames[course.status]}</p>
      <h1 className="break-words text-2xl font-bold">{course.title}</h1>
      <p className="whitespace-pre-line break-words">{course.description}</p>
      <div className="flex flex-wrap gap-4 text-sm underline">
        <Link href={base + "/inscripciones"}>Inscripciones y progreso</Link>
        {course.status === "PUBLISHED" && <Link href={base + "/vista-previa"}>Vista previa de estudiante</Link>}
      </div>
      <AcademicEditor key={course.updatedAt} kind="courses" endpoint={"courses/" + id} item={course} />
    </header>
    <div id="estructura" className="space-y-4">
      <StructureList title="Niveles" kind="levels" rows={levels} collection={`courses/${id}/levels`}
        href={levelId => base + "?nivel=" + levelId + "#unidades"} action="Ver unidades" />
      {level && <div id="unidades"><StructureList title={"Unidades · " + level.title} kind="units" rows={units}
        collection={`levels/${level.id}/units`} href={unitId => base + "?nivel=" + level.id + "&unidad=" + unitId + "#lecciones"} action="Ver lecciones" /></div>}
      {unit && <div id="lecciones"><StructureList title={"Lecciones · " + unit.title} kind="lessons" rows={lessons} collection={`units/${unit.id}/lessons`} /></div>}
    </div>
  </div>;
}
