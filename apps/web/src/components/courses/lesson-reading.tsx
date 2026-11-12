import Link from "next/link";
import { StoredPreview } from "@/components/vocabulary/media-preview";
import { getCourseLesson, getCourseProgress } from "@/lib/student-courses";
import { ProgressAction } from "@/components/courses/progress-action";
import { CourseProgress } from "@/components/courses/course-progress";

export async function LessonReading({ courseId, lessonId, preview = false }: { courseId: string; lessonId: string; preview?: boolean }) {
  const [{ lesson, words }, progress] = await Promise.all([
    getCourseLesson(courseId, lessonId), preview ? null : getCourseProgress(courseId),
  ]);
  const { level } = lesson.unit;
  const blocks = lesson.blocks.filter(block => block.type !== "QUIZ");
  return (
    <main className="min-h-screen bg-muted/30 px-4 py-8 sm:px-6">
      <div className="mx-auto max-w-3xl space-y-5 break-words">
        <Link href={preview ? `/admin/cursos/${level.course.id}/vista-previa` : `/aprender/cursos/${level.course.id}`} className="text-sm underline">Volver al curso · {level.course.title}</Link>
        <article className="space-y-5 rounded-xl border bg-card p-5 shadow-sm sm:p-8">
          <header className="space-y-2">
            <p className="text-sm text-muted-foreground">{level.title} · {lesson.unit.title} · {lesson.estimatedMinutes} min</p>
            <h1 className="text-3xl font-bold">{lesson.title}</h1>
            {lesson.description && <p className="whitespace-pre-line">{lesson.description}</p>}
          </header>
          {blocks.length === 0 && <p className="text-sm text-muted-foreground">Aún no hay contenido de lectura disponible.</p>}
          {blocks.map(block => {
            const text = typeof block.content?.text === "string" ? block.content.text.trim() : "";
            if (block.type === "HEADING") {
              const Heading = block.content.level === 3 ? "h3" : "h2";
              return <Heading key={block.id} className="text-xl font-semibold">{text || block.title}</Heading>;
            }
            return (
              <section key={block.id} className="space-y-2">
                {block.title && <h2 className="text-lg font-semibold">{block.title}</h2>}
                {text ? <p className="whitespace-pre-line">{text}</p>
                  : <p className="text-sm text-muted-foreground">Este recurso aún no tiene una vista de lectura.</p>}
              </section>
            );
          })}
        </article>
        {words.length > 0 && (
          <section aria-labelledby="words" className="space-y-3">
            <h2 id="words" className="text-xl font-semibold">Vocabulario de la lección</h2>
            <ul className="grid gap-3 sm:grid-cols-2">
              {words.map(word => (
                <li key={word.id} className="min-w-0 space-y-2 rounded-xl border bg-card p-4">
                  <h3 lang="cak" className="font-semibold">{word.termKaqchikel}</h3>
                  <p>{word.translationEs}</p>
                  {word.imageMedia && <StoredPreview kind="image" id={word.imageMedia.id} />}
                  {word.pronunciationMedia && <StoredPreview kind="audio" id={word.pronunciationMedia.id} />}
                </li>
              ))}
            </ul>
          </section>
        )}
        {!preview && <section aria-label="Tu progreso" className="space-y-3 rounded-xl border bg-card p-5">
          {progress?.completedLessonIds.includes(lesson.id)
            ? <p role="status" className="font-medium">Lección completada</p>
            : <ProgressAction courseId={level.course.id} lessonId={progress ? lesson.id : undefined} />}
          {progress && <CourseProgress progress={progress} currentLessonId={lesson.id} />}
        </section>}
      </div>
    </main>
  );
}
