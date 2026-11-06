import type { Metadata } from "next";
import { cookies } from "next/headers";
import { Languages } from "lucide-react";
import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { VocabularyStatusButton } from "@/components/vocabulary/vocabulary-status-button";
import { Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getActiveVocabularyCatalog } from "@/lib/vocabulary-catalogs";

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
      page: number;
      pageSize: number;
      total: number;
      totalPages: number;
    };
  };
};

type VocabularyFilters = {
  q: string;
  categoryId: string;
  variantId: string;
  isActive: "true" | "false" | "";
  page: number;
};

async function getVocabulary(filters: VocabularyFilters) {
  const cookieStore = await cookies();
  const session = cookieStore.get("kaqchikel_session");

  if (!session) return null;

  const apiUrl = process.env.API_INTERNAL_URL ?? "http://127.0.0.1:4000";

  const params = new URLSearchParams({
    page: String(filters.page),
    pageSize: "20",
  });

  if (filters.q) {
    params.set("q", filters.q);
  }

  if (filters.categoryId) {
    params.set("categoryId", filters.categoryId);
  }

  if (filters.variantId) {
    params.set("variantId", filters.variantId);
  }

  if (filters.isActive) {
    params.set("isActive", filters.isActive);
  }

  try {
    const response = await fetch(
      `${apiUrl}/api/v1/admin/vocabulary?${params.toString()}`,
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

function buildPageHref(filters: VocabularyFilters, page: number): string {
  const params = new URLSearchParams();

  if (filters.q) {
    params.set("q", filters.q);
  }

  if (filters.categoryId) {
    params.set("categoryId", filters.categoryId);
  }

  if (filters.variantId) {
    params.set("variantId", filters.variantId);
  }

  if (filters.isActive) {
    params.set("isActive", filters.isActive);
  }

  params.set("page", String(page));

  return `/admin/vocabulario?${params.toString()}`;
}

export default async function VocabularyPage({
  searchParams,
}: {
  searchParams: Promise<{
    q?: string | string[];
    categoryId?: string | string[];
    variantId?: string | string[];
    isActive?: string | string[];
    page?: string | string[];
  }>;
}) {
  await requireAdmin();

  const {
    q,
    categoryId,
    variantId,
    isActive,
    page: pageParam,
  } = await searchParams;

  const requestedPage = typeof pageParam === "string" ? Number(pageParam) : 1;

  const currentPage =
    Number.isInteger(requestedPage) &&
    requestedPage >= 1 &&
    requestedPage <= 1000000
      ? requestedPage
      : 1;

  const filters: VocabularyFilters = {
    q: typeof q === "string" ? q.trim().slice(0, 100) : "",
    categoryId: typeof categoryId === "string" ? categoryId : "",
    variantId: typeof variantId === "string" ? variantId : "",
    isActive: isActive === "true" || isActive === "false" ? isActive : "",
    page: currentPage,
  };

  const [vocabulary, categories, variants] = await Promise.all([
    getVocabulary(filters),
    getActiveVocabularyCatalog("categories"),
    getActiveVocabularyCatalog("variants"),
  ]);

  const query = filters.q;

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

      <div className="flex flex-wrap justify-end gap-3">
        <Button asChild variant="outline">
          <Link href="/admin/vocabulario/categorias">Categorías</Link>
        </Button>

        <Button asChild variant="outline">
          <Link href="/admin/vocabulario/variantes">Variantes regionales</Link>
        </Button>

        <Button asChild>
          <Link href="/admin/vocabulario/nuevo">+ Nueva palabra</Link>
        </Button>
      </div>

      <form
        action="/admin/vocabulario"
        method="GET"
        className="space-y-4 rounded-xl border bg-card p-4"
      >
        {/* Campo de búsqueda */}
        <div className="space-y-2">
          <label htmlFor="search-vocabulary" className="text-sm font-medium">
            Buscar vocabulario
          </label>

          <input
            id="search-vocabulary"
            type="search"
            name="q"
            defaultValue={query}
            maxLength={100}
            placeholder="Buscar palabra..."
            className="h-10 w-full rounded-lg border bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
        </div>

        {/* Filtros */}
        <div className="grid gap-4 md:grid-cols-3">
          {/* Categorías */}
          <div className="space-y-2">
            <label htmlFor="filter-category" className="text-sm font-medium">
              Categoría
            </label>

            <select
              id="filter-category"
              name="categoryId"
              defaultValue={filters.categoryId}
              disabled={categories === null}
              className="h-10 w-full rounded-lg border bg-background px-3 text-sm"
            >
              <option value="">Todas las categorías</option>

              {categories?.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>

          {/* Variantes regionales */}
          <div className="space-y-2">
            <label htmlFor="filter-variant" className="text-sm font-medium">
              Variante regional
            </label>

            <select
              id="filter-variant"
              name="variantId"
              defaultValue={filters.variantId}
              disabled={variants === null}
              className="h-10 w-full rounded-lg border bg-background px-3 text-sm"
            >
              <option value="">Todas las variantes</option>

              {variants?.map((variant) => (
                <option key={variant.id} value={variant.id}>
                  {variant.name}
                </option>
              ))}
            </select>
          </div>

          {/* Estado de publicación */}
          <div className="space-y-2">
            <label htmlFor="filter-status" className="text-sm font-medium">
              Estado
            </label>

            <select
              id="filter-status"
              name="isActive"
              defaultValue={filters.isActive}
              className="h-10 w-full rounded-lg border bg-background px-3 text-sm"
            >
              <option value="">Todos los estados</option>
              <option value="true">Activas</option>
              <option value="false">Inactivas</option>
            </select>
          </div>
        </div>

        {/* Error al consultar los catálogos */}
        {(categories === null || variants === null) && (
          <p role="alert" className="text-sm text-destructive">
            No fue posible cargar algunos filtros. Comprueba la conexión con el
            backend.
          </p>
        )}

        {/* Botones */}
        <div className="flex flex-wrap justify-end gap-3">
          <Button asChild variant="outline">
            <Link href="/admin/vocabulario">Limpiar filtros</Link>
          </Button>

          <Button type="submit">Aplicar filtros</Button>
        </div>
      </form>

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
            {query ||
            filters.categoryId ||
            filters.variantId ||
            filters.isActive
              ? "No se encontraron palabras con los filtros seleccionados."
              : "Todavía no hay palabras registradas."}
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

        {vocabulary && vocabulary.pagination.totalPages > 0 && (
          <div className="flex flex-wrap items-center justify-between gap-3 border-t p-4">
            <p className="text-sm text-muted-foreground">
              Página {vocabulary.pagination.page} de{" "}
              {vocabulary.pagination.totalPages}
              {" · "}
              {vocabulary.pagination.total} registros
            </p>

            <div className="flex items-center gap-2">
              {vocabulary.pagination.page > 1 ? (
                <Button asChild variant="outline" size="sm">
                  <Link
                    href={buildPageHref(
                      filters,
                      vocabulary.pagination.page - 1,
                    )}
                  >
                    Anterior
                  </Link>
                </Button>
              ) : (
                <Button variant="outline" size="sm" disabled>
                  Anterior
                </Button>
              )}

              {vocabulary.pagination.page < vocabulary.pagination.totalPages ? (
                <Button asChild variant="outline" size="sm">
                  <Link
                    href={buildPageHref(
                      filters,
                      vocabulary.pagination.page + 1,
                    )}
                  >
                    Siguiente
                  </Link>
                </Button>
              ) : (
                <Button variant="outline" size="sm" disabled>
                  Siguiente
                </Button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
