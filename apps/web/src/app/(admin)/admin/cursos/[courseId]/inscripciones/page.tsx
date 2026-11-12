import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { readReport } from "@/lib/admin-academics";

export default async function ReportPage({ params }: { params: Promise<{ courseId: string }> }) {
  await requireAdmin();
  const { courseId } = await params;
  const report = await readReport(courseId);
  return <div className="space-y-5">
    <Link href={"/admin/cursos/" + courseId} className="text-sm underline">Volver al curso</Link>
    <h1 className="break-words text-2xl font-bold">Inscripciones y progreso · {report.title}</h1>
    <dl className="grid gap-3 sm:grid-cols-3">{[
      ["Estudiantes inscritos", report.totalEnrolled], ["Lecciones disponibles", report.totalLessons], ["Estudiantes que completaron el curso", report.finished],
    ].map(([label,value]) => <div key={label} className="rounded-xl border bg-card p-4"><dt className="text-sm">{label}</dt><dd className="text-2xl font-semibold">{value}</dd></div>)}</dl>
    {!report.students.length && <p>Aún no hay estudiantes inscritos.</p>}
    <ul className="space-y-3">{report.students.map(row => <li key={row.enrollmentId} className="space-y-2 rounded-xl border bg-card p-4">
      <h2 className="break-words font-semibold">{row.student.firstName} {row.student.lastName}</h2>
      <p className="break-all text-sm text-muted-foreground">{row.student.email}</p>
      <p className="text-sm">{row.completed} de {report.totalLessons} lecciones disponibles completadas · {row.percentage}%</p>
      <progress className="w-full" aria-label="Avance del estudiante" value={row.percentage} max={100} />
      {row.lessons.length > 0 && <details><summary className="cursor-pointer">Lecciones completadas</summary>
        <ul className="list-disc space-y-1 py-2 pl-5">{row.lessons.map(lesson =>
          <li key={lesson.completedAt + lesson.title}>{lesson.title}{!lesson.counts && " · Fuera del contenido disponible"}</li>)}</ul>
      </details>}
    </li>)}</ul>
  </div>;
}
