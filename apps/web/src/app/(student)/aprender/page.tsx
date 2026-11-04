import type { Metadata } from "next";
import { LogoutButton } from "@/components/layout/logout-button";

export const metadata: Metadata = {
  title: "Aprender Kaqchikel",
};

export default function AprenderPage() {
  return (
    <main className="min-h-screen bg-muted/30 p-6">
      <div className="mx-auto max-w-5xl space-y-4 py-10">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <h1 className="text-3xl font-bold">Aprendamos Kaqchikel</h1>

          <LogoutButton />
        </div>
        <p className="text-muted-foreground">
          Bienvenido a la plataforma de aprendizaje del idioma Maya Kaqchikel.
        </p>

        <section className="rounded-xl border bg-card p-6 shadow-sm">
          <h2 className="text-xl font-semibold">Mis cursos</h2>

          <p className="mt-3 text-sm text-muted-foreground">
            Aquí aparecerán los cursos y las lecciones disponibles para el
            estudiante.
          </p>
        </section>
      </div>
    </main>
  );
}
