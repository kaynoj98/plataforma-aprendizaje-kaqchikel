import type { Metadata } from "next";
import { cookies } from "next/headers";
import { notFound } from "next/navigation";

import { requireAdmin } from "@/lib/auth";
import { CategoryForm } from "@/components/vocabulary/category-form";

export const metadata: Metadata = {
  title: "Editar categoría",
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

async function getCategoryById(id: string) {
  const cookieStore = await cookies();
  const session = cookieStore.get("kaqchikel_session");

  if (!session) {
    return { category: null, error: true };
  }

  const apiUrl = process.env.API_INTERNAL_URL ?? "http://127.0.0.1:4000";

  let page = 1;
  let totalPages = 1;

  try {
    while (page <= totalPages) {
      const response = await fetch(
        `${apiUrl}/api/v1/admin/vocabulary/categories?page=${page}&pageSize=50`,
        {
          method: "GET",
          headers: {
            Cookie: `kaqchikel_session=${session.value}`,
          },
          cache: "no-store",
        },
      );

      if (!response.ok) {
        return { category: null, error: true };
      }

      const result = (await response.json()) as CategoriesResponse;

      if (!result.success || !result.data) {
        return { category: null, error: true };
      }

      const category = result.data.items.find((item) => item.id === id);

      if (category) {
        return { category, error: false };
      }

      totalPages = result.data.pagination.totalPages;

      if (!Number.isInteger(totalPages) || totalPages < 0) {
        return { category: null, error: true };
      }

      page++;
    }

    return { category: null, error: false };
  } catch {
    return { category: null, error: true };
  }
}

export default async function EditCategoryPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdmin();

  const { id } = await params;

  const { category, error } = await getCategoryById(id);

  if (error) {
    return (
      <div className="rounded-xl border p-6">
        <h1 className="text-xl font-semibold">
          No se pudo cargar la categoría
        </h1>

        <p className="mt-2 text-sm text-muted-foreground">
          Comprueba que el servidor esté disponible e intenta nuevamente.
        </p>
      </div>
    );
  }

  if (!category) {
    notFound();
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Editar categoría</h1>

        <p className="mt-2 text-sm text-muted-foreground">
          Modifica la información de la categoría seleccionada.
        </p>
      </div>

      <CategoryForm
        categoryId={category.id}
        initialValues={{
          name: category.name,
          slug: category.slug,
          description: category.description,
          isActive: category.isActive,
        }}
      />
    </div>
  );
}
