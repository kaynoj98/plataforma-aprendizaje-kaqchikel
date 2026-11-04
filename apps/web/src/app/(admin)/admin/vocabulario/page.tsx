import type { Metadata } from "next";
import { cookies } from "next/headers";
import { Languages } from "lucide-react";
import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { VocabularyStatusButton } from "@/components/vocabulary/vocabulary-status-button";
import { Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Administrar vocabulario",
};

type VocabularyItem = {
  id: string;
  termKaqchikel: string;
  translationSpanish?: string | null;
  translationEs?: string | null;
  isActive: boolean;
};

type VocabularyResponse = {
  success: boolean;
  data?: {
    items: VocabularyItem[];
    pagination: {
      total: number;
    };
  };
};

async function getVocabulary() {
  const cookieStore = await cookies();
  const session = cookieStore.get("kaqchikel_session");

  if (!session) return null;

  const apiUrl = process.env.API_INTERNAL_URL ?? "http://127.0.0.1:4000";

  try {
    const response = await fetch(
      `${apiUrl}/api/v1/admin/vocabulary?page=1&pageSize=20`,
      {
        headers: {
          Cookie: `kaqchikel_session=${session.value}`,
        },
        cache: "no-store",
      },
    );

    if (!response.ok) return null;

    const result = (await response.json()) as VocabularyResponse;

    if (!result.success || !result.data) {
      return null;
    }

    return result.data;
  } catch {
    return null;
  }
}

export default async function VocabularyPage() {
  await requireAdmin();

  const vocabulary = await getVocabulary();

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-3">
          <Languages className="size-7" />

          <h1 className="text-2xl font-bold">Administración de vocabulario</h1>
        </div>

        <p className="mt-2 text-sm text-muted-foreground">
          Gestiona las palabras y traducciones del idioma Maya Kaqchikel.
        </p>
      </div>

      <div className="flex justify-end">
        <Link
          href="/admin/vocabulario/nuevo"
          className="inline-flex h-10 items-center justify-center rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          + Nueva palabra
        </Link>
      </div>

      <div className="rounded-xl border bg-card shadow-sm">
        <div className="border-b p-5">
          <h2 className="font-semibold">Palabras registradas</h2>

          <p className="text-sm text-muted-foreground">
            Total: {vocabulary?.pagination.total ?? "—"}
          </p>
        </div>

        {!vocabulary ? (
          <p className="p-6 text-sm text-destructive">
            No se pudo consultar el vocabulario.
          </p>
        ) : vocabulary.items.length === 0 ? (
          <p className="p-6 text-sm text-muted-foreground">
            Todavía no hay palabras registradas.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b bg-muted/50">
                <tr>
                  <th className="p-4">Kaqchikel</th>
                  <th className="p-4">Español</th>
                  <th className="p-4">Estado</th>
                  <th className="p-4">Acciones</th>
                </tr>
              </thead>

              <tbody>
                {vocabulary.items.map((item) => (
                  <tr key={item.id} className="border-b last:border-0">
                    <td className="p-4 font-medium">{item.termKaqchikel}</td>

                    <td className="p-4">
                      {item.translationSpanish ??
                        item.translationEs ??
                        "Sin traducción"}
                    </td>

                    <td className="p-4">
                      {item.isActive ? "Activo" : "Inactivo"}
                    </td>

                    <td className="p-4">
                      <div className="flex flex-wrap items-center gap-2">
                        <Button asChild variant="outline" size="sm">
                          <Link href={`/admin/vocabulario/${item.id}/editar`}>
                            <Pencil className="size-4" />
                            Editar
                          </Link>
                        </Button>

                        <VocabularyStatusButton
                          vocabularyId={item.id}
                          isActive={item.isActive}
                        />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
