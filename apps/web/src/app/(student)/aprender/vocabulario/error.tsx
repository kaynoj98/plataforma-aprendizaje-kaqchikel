"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function VocabularyError({ reset }: { reset: () => void }) {
  return (
    <main className="mx-auto max-w-5xl space-y-4 p-6">
      <h1 className="text-2xl font-bold">Vocabulario</h1>
      <p role="alert">No se pudo cargar el vocabulario. Comprueba la conexión e inténtalo de nuevo.</p>
      <div className="flex flex-wrap gap-3">
        <Button onClick={reset}>Reintentar</Button>
        <Button variant="outline" asChild><Link href="/aprender">Volver a Aprender</Link></Button>
      </div>
    </main>
  );
}
