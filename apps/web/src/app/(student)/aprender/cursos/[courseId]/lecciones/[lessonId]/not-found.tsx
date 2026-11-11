import Link from "next/link";

export default function LessonNotFound() {
  return <main className="mx-auto max-w-3xl space-y-4 p-6">
    <h1 className="text-2xl font-bold">Lección no disponible</h1>
    <Link href="/aprender/cursos" className="underline">Volver a cursos</Link>
  </main>;
}
