import type { Metadata } from "next";
import { cookies } from "next/headers";
import Link from "next/link";
import { ArrowLeft, FolderOpen } from "lucide-react";

import { requireAdmin } from "@/lib/auth";
import { Button } from "@/components/ui/button";

import { CategoryStatusButton } from "@/components/vocabulary/category-status-button";

export const metadata: Metadata = {
  title: "Categorías de vocabulario",
};

type VocabularyCategory = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  isActive: boolean;
};

type CategoriesResponse = {
  success: boolean;
  data?: {
    items: VocabularyCategory[];
    pagination: {
      page: number;
      pageSize: number;
      total: number;
      totalPages: number;
    };
  };
};

async function getCategories(page: number) {
  const cookieStore = await cookies();
  const session = cookieStore.get("kaqchikel_session");

  if (!session) {
    return null;
  }

  const apiUrl = process.env.API_INTERNAL_URL ?? "http://127.0.0.1:4000";

  try {
    const response = await fetch(
      `${apiUrl}/api/v1/admin/vocabulary/categories?page=${page}&pageSize=20`,
      {
        method: "GET",
        headers: {
          Cookie: `kaqchikel_session=${session.value}`,
        },
        cache: "no-store",
      },
    );

    if (!response.ok) {
      return null;
    }

    const result = (await response.json()) as CategoriesResponse;

    if (!result.success || !result.data) {
      return null;
    }

    return result.data;
  } catch {
    return null;
  }
}

export default async function CategoriesPage({
  searchParams,
}: {
  searchParams: Promise<{
    page?: string | string[];
  }>;
}) {
  await requireAdmin();

  const { page: pageParam } = await searchParams;

  const requestedPage = typeof pageParam === "string" ? Number(pageParam) : 1;

  const currentPage =
    Number.isInteger(requestedPage) &&
    requestedPage >= 1 &&
    requestedPage <= 1000000
      ? requestedPage
      : 1;

  const categories = await getCategories(currentPage);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <FolderOpen className="size-7" />

          <div>
            <h1 className="text-2xl font-bold">Categorías de vocabulario</h1>

            <p className="mt-1 text-sm text-muted-foreground">
              Organiza las palabras por temas de aprendizaje.
            </p>
          </div>
        </div>

        <Button asChild variant="outline">
          <Link href="/admin/vocabulario">
            <ArrowLeft className="size-4" />
            Volver
          </Link>
        </Button>
      </div>

      <div className="flex justify-end">
        <Button asChild>
          <Link href="/admin/vocabulario/categorias/nueva">
            + Nueva categoría
          </Link>
        </Button>
      </div>

      <div className="rounded-xl border bg-card shadow-sm">
        <div className="border-b p-5">
          <h2 className="font-semibold">Categorías registradas</h2>

          <p className="mt-1 text-sm text-muted-foreground">
            Total: {categories?.pagination.total ?? "—"}
          </p>
        </div>

        {!categories ? (
          <p className="p-6 text-sm text-destructive">
            No fue posible consultar las categorías.
          </p>
        ) : categories.items.length === 0 ? (
          <p className="p-6 text-sm text-muted-foreground">
            Todavía no hay categorías registradas.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b bg-muted/50">
                <tr>
                  <th className="p-4">Nombre</th>
                  <th className="p-4">Identificador</th>
                  <th className="p-4">Descripción</th>
                  <th className="p-4">Estado</th>
                  <th className="p-4">Acciones</th>
                </tr>
              </thead>

              <tbody>
                {categories.items.map((category) => (
                  <tr key={category.id} className="border-b last:border-0">
                    <td className="p-4 font-medium">{category.name}</td>

                    <td className="p-4 text-muted-foreground">
                      {category.slug}
                    </td>

                    <td className="p-4">
                      {category.description ?? "Sin descripción"}
                    </td>

                    <td className="p-4">
                      <span
                        className={
                          category.isActive
                            ? "rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-800"
                            : "rounded-full bg-muted px-3 py-1 text-xs text-muted-foreground"
                        }
                      >
                        {category.isActive ? "Activa" : "Inactiva"}
                      </span>
                    </td>

                    <td className="p-4">
                      <div className="flex flex-wrap items-center gap-2">
                        <Button asChild variant="outline" size="sm">
                          <Link
                            href={`/admin/vocabulario/categorias/${category.id}/editar`}
                          >
                            Editar
                          </Link>
                        </Button>

                        <CategoryStatusButton
                          categoryId={category.id}
                          isActive={category.isActive}
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

      {categories && categories.pagination.totalPages > 1 && (
        <div className="flex flex-wrap items-center justify-between gap-3 border-t p-4">
          <p className="text-sm text-muted-foreground">
            Página {categories.pagination.page} de{" "}
            {categories.pagination.totalPages}
            {" · "}
            {categories.pagination.total} categorías
          </p>

          <div className="flex items-center gap-2">
            {categories.pagination.page > 1 ? (
              <Button asChild variant="outline" size="sm">
                <Link
                  href={`/admin/vocabulario/categorias?page=${
                    categories.pagination.page - 1
                  }`}
                >
                  Anterior
                </Link>
              </Button>
            ) : (
              <Button variant="outline" size="sm" disabled>
                Anterior
              </Button>
            )}

            {categories.pagination.page < categories.pagination.totalPages ? (
              <Button asChild variant="outline" size="sm">
                <Link
                  href={`/admin/vocabulario/categorias?page=${
                    categories.pagination.page + 1
                  }`}
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
  );
}
