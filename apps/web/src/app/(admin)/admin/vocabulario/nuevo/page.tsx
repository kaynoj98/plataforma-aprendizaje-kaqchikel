import type { Metadata } from "next";
import { requireAdmin } from "@/lib/auth";
import { VocabularyForm } from "@/components/vocabulary/vocabulary-form";

export const metadata: Metadata = {
  title: "Nueva palabra",
};

export default async function NewVocabularyPage() {
  await requireAdmin();

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Registrar vocabulario</h1>

        <p className="mt-2 text-sm text-muted-foreground">
          Agrega una palabra nueva al diccionario Kaqchikel–Español.
        </p>
      </div>

      <VocabularyForm />
    </div>
  );
}
