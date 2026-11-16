import Link from "next/link";
import { ActivityEditor } from "@/components/activities/activity-editor";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { academicId, children, readBlocks, readCourse } from "@/lib/admin-academics";
import { BlockEditor } from "@/components/academics/block-editor";
import { LessonVocabularyEditor } from "@/components/academics/lesson-vocabulary-editor";
import { readLessonWords } from "@/lib/admin-academics";
import { getActiveVocabularyCatalog } from "@/lib/vocabulary-catalogs";

export default async function Page({ params }: { params: Promise<{
  courseId: string; levelId: string; unitId: string; lessonId: string;
}> }) {
  await requireAdmin();
  const ids = await params;
  const [courseId, levelId, unitId, lessonId] = [ids.courseId, ids.levelId, ids.unitId, ids.lessonId].map(academicId);
  const [course, levels, units, lessons] = await Promise.all([readCourse(courseId),
    children("courses", courseId, "levels"), children("levels", levelId, "units"), children("units", unitId, "lessons")]);
  const level = levels.find(row => row.id === levelId);
  const unit = units.find(row => row.id === unitId);
  const lesson = lessons.find(row => row.id === lessonId);
  if (!level || !unit || !lesson) notFound();
  const published = [course, level, unit, lesson].every(row => row.status === "PUBLISHED");
  const base = "/admin/cursos/" + courseId;
  const [blocks, words, categories, variants] = await Promise.all([
    readBlocks(lessonId), readLessonWords(lessonId),
    getActiveVocabularyCatalog("categories"), getActiveVocabularyCatalog("variants"),
  ]);
  return <div className="mx-auto max-w-4xl space-y-5">
    <Link href={base + "?nivel=" + levelId + "&unidad=" + unitId + "#lecciones"} className="text-sm underline">Volver a lecciones</Link>
    <header className="space-y-2 break-words">
      <p className="text-sm text-muted-foreground">{course.title} · {level.title} · {unit.title}</p>
      <h1 className="text-2xl font-bold">Editar contenido · {lesson.title}</h1>
      {published ? <Link href={base + "/vista-previa/lecciones/" + lessonId} className="inline-block underline">Vista previa</Link>
        : <p className="text-sm">La vista previa requiere que el curso, nivel, unidad y lección estén publicados.</p>}
    </header>
    <BlockEditor key={lessonId} lessonId={lessonId} initial={blocks} />
    <ActivityEditor key={"activities-"+lessonId} lessonId={lessonId} />
    <LessonVocabularyEditor key={"words-" + lessonId} lessonId={lessonId} initial={words}
      categories={categories} variants={variants} />
  </div>;
}
