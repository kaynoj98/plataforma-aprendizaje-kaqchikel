import type { Metadata } from "next";
import { cookies } from "next/headers";
import { notFound } from "next/navigation";

import { requireAdmin } from "@/lib/auth";
import { VocabularyForm } from "@/components/vocabulary/vocabulary-form";

export const metadata: Metadata = {
  title: "Editar vocabulario",
};

type VocabularyItem = {
  id: string;
  termKaqchikel: string;
  translationEs: string;
  description: string | null;
  phoneticGuide: string | null;
};

type VocabularyResponse = {
  success: boolean;
  data?:
    | VocabularyItem
    | { item: VocabularyItem }
    | { vocabulary: VocabularyItem };
};

async function getVocabularyItem(id: string): Promise<VocabularyItem | null> {
  const cookieStore = await cookies();
  const session = cookieStore.get("kaqchikel_session");

  if (!session) return null;

  const apiUrl = process.env.API_INTERNAL_URL ?? "http://127.0.0.1:4000";

  const response = await fetch(
    `${apiUrl}/api/v1/admin/vocabulary/${encodeURIComponent(id)}`,
    {
      headers: {
        Cookie: `kaqchikel_session=${session.value}`,
      },
      cache: "no-store",
    },
  ).catch(() => null);

  if (!response) return null;

  if (response.status === 404) {
    notFound();
  }

  if (!response.ok) return null;

  const result = (await response
    .json()
    .catch(() => null)) as VocabularyResponse | null;

  if (!result?.success || !result.data) {
    return null;
  }

  // Admitir objeto directo o envoltorio en "item"/"vocabulary"
  const data = result.data;

  const item =
    "item" in data ? data.item : "vocabulary" in data ? data.vocabulary : data;

  if (
    !item ||
    typeof item.id !== "string" ||
    typeof item.termKaqchikel !== "string" ||
    typeof item.translationEs !== "string"
  ) {
    return null;
  }

  return item;
}

export default async function EditVocabularyPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdmin();

  const { id } = await params;

  const vocabulary = await getVocabularyItem(id);

  if (!vocabulary) {
    return (
      <div className="rounded-xl border p-6">
        <h1 className="text-xl font-semibold">No se pudo cargar la palabra</h1>

        <p className="mt-2 text-sm text-muted-foreground">
          Comprueba que el registro existe y que el servidor está disponible.
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Editar vocabulario</h1>

        <p className="mt-2 text-sm text-muted-foreground">
          Modifica la información de la palabra seleccionada.
        </p>
      </div>

      <VocabularyForm
        vocabularyId={vocabulary.id}
        initialValues={{
          termKaqchikel: vocabulary.termKaqchikel,
          translationEs: vocabulary.translationEs,
          description: vocabulary.description,
          phoneticGuide: vocabulary.phoneticGuide,
        }}
      />
    </div>
  );
}
