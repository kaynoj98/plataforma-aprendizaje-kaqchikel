"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function CoursesError({ reset }: { reset: () => void }) {
  return <main className="mx-auto max-w-5xl space-y-4 p-6">
    <h1 className="text-2xl font-bold">Cursos</h1>
    <p role="alert">No se pudo cargar la información de cursos. Comprueba la conexión.</p>
    <div className="flex flex-wrap gap-3">
      <Button onClick={reset}>Reintentar</Button>
      <Button asChild variant="outline"><Link href="/aprender">Volver a Aprender</Link></Button>
    </div>
  </main>;
}
