import type { Metadata } from "next";
import { requireAdmin } from "@/lib/auth";
import { VocabularyForm } from "@/components/vocabulary/vocabulary-form";
import { getActiveVocabularyCatalog } from "@/lib/vocabulary-catalogs";

export const metadata: Metadata = {
  title: "Nueva palabra",
};

export default async function NewVocabularyPage() {
  await requireAdmin();

  const [categories, variants] = await Promise.all([
    getActiveVocabularyCatalog("categories"),
    getActiveVocabularyCatalog("variants"),
  ]);

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Registrar vocabulario</h1>

        <p className="mt-2 text-sm text-muted-foreground">
          Agrega una palabra nueva al diccionario Kaqchikel–Español.
        </p>
      </div>

      {categories === null || variants === null ? (
        <p role="alert" className="text-sm text-destructive">
          No fue posible cargar las categorías y variantes. Comprueba la
          conexión con el backend.
        </p>
      ) : (
        <VocabularyForm categories={categories} variants={variants} />
      )}
    </div>
  );
}
