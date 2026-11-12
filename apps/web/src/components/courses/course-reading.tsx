import Link from "next/link";
import { getCourse, getCourseProgress } from "@/lib/student-courses";
import { CourseProgress } from "@/components/courses/course-progress";
import { ProgressAction } from "@/components/courses/progress-action";

export async function CourseReading({ courseId, preview = false }: { courseId: string; preview?: boolean }) {
  const [course, progress] = await Promise.all([getCourse(courseId), preview ? null : getCourseProgress(courseId)]);
  const completed = new Set(progress?.completedLessonIds);
  return (
    <main className="min-h-screen bg-muted/30 px-4 py-8 sm:px-6">
      <div className="mx-auto max-w-3xl space-y-6">
        <Link href={preview ? `/admin/cursos/${course.id}` : "/aprender/cursos"} className="text-sm underline">{preview ? "Volver a gestión del curso" : "Volver a cursos"}</Link>
        <article className="space-y-4 break-words rounded-xl border bg-card p-5 shadow-sm sm:p-8">
          <p className="text-sm text-muted-foreground">Dificultad · {course.difficulty}</p>
          <h1 className="text-3xl font-bold">{course.title}</h1>
          <p className="whitespace-pre-line">{course.description}</p>
          {course.objectives?.trim() && <section className="space-y-2 border-t pt-4">
            <h2 className="text-lg font-semibold">Objetivos</h2>
            <p className="whitespace-pre-line">{course.objectives}</p>
          </section>}
          {!preview && (progress ? <CourseProgress progress={progress} /> : <ProgressAction courseId={course.id} />)}
        </article>

        <section aria-labelledby="levels" className="space-y-3">
          <h2 id="levels" className="text-xl font-semibold">Contenido del curso</h2>
          {!course.levels.length && <p className="text-muted-foreground">Aún no hay niveles publicados.</p>}
          {course.levels.map((level, index) => (
            <details key={level.id} open={index === 0} className="min-w-0 break-words rounded-xl border bg-card">
              <summary className="cursor-pointer rounded-xl px-5 py-4 font-semibold focus-visible:outline-ring">
                {level.title}
              </summary>
              <div className="space-y-4 border-t px-5 py-4">
                {level.description && <p className="whitespace-pre-line text-sm">{level.description}</p>}
                {!level.units.length && <p className="text-sm text-muted-foreground">Aún no hay unidades publicadas.</p>}
                {level.units.map(unit => (
                  <section key={unit.id} className="space-y-2 border-l-2 pl-4">
                    <h3 className="font-semibold">{unit.title}</h3>
                    {unit.description && <p className="whitespace-pre-line text-sm text-muted-foreground">{unit.description}</p>}
                    {unit.lessons.length ? (
                      <ul className="divide-y">
                        {unit.lessons.map(lesson => (
                          <li key={lesson.id}>
                            <Link href={preview ? `/admin/cursos/${course.id}/vista-previa/lecciones/${lesson.id}` : `/aprender/cursos/${course.id}/lecciones/${lesson.id}`}
                              className="flex flex-wrap items-baseline justify-between gap-x-3 rounded-sm py-3 text-sm hover:underline">
                              <span className="min-w-0 font-medium">{lesson.title}</span>
                              <span className="text-xs text-muted-foreground">
                                {completed.has(lesson.id) && "Completada · "}{lesson.estimatedMinutes} min
                              </span>
                            </Link>
                          </li>
                        ))}
                      </ul>
                    ) : <p className="text-sm text-muted-foreground">Aún no hay lecciones publicadas.</p>}
                  </section>
                ))}
              </div>
            </details>
          ))}
        </section>
      </div>
    </main>
  );
}
