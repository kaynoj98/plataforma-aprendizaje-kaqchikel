import Link from "next/link";
import { Button } from "@/components/ui/button";
import type { EnrollmentSummary } from "@/lib/student-courses";

export function CourseProgress({ progress, currentLessonId }: {
  progress: EnrollmentSummary;
  currentLessonId?: string;
}) {
  const { completed, total, percentage, nextLessonId, courseId } = progress;
  return <div className="min-w-0 space-y-2">
    <p className="text-sm" role="status">
      {total > 0 && completed === total ? "Curso completado" : "Inscrito"} · {completed} de {total} lecciones completadas ({percentage}%)
    </p>
    <progress aria-label={`Progreso de ${progress.title}`} value={percentage} max={100}
      className="block h-2 w-full accent-primary" />
    {nextLessonId && nextLessonId !== currentLessonId && <Button asChild variant="outline">
      <Link href={`/aprender/cursos/${courseId}/lecciones/${nextLessonId}`}>Continuar aprendiendo</Link>
    </Button>}
  </div>;
}
