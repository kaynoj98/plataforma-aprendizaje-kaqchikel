import type { Metadata } from "next";
import { cookies } from "next/headers";
import { notFound } from "next/navigation";

import { requireAdmin } from "@/lib/auth";
import { VariantForm } from "@/components/vocabulary/variant-form";

export const metadata: Metadata = {
  title: "Editar variante regional",
};

type VocabularyVariant = {
  id: string;
  name: string;
  code: string;
  region: string | null;
  description: string | null;
  isActive: boolean;
};

type VariantsResponse = {
  success: boolean;
  data?: {
    items: VocabularyVariant[];
    pagination: {
      page: number;
      pageSize: number;
      total: number;
      totalPages: number;
    };
  };
};

type LookupResult = {
  variant: VocabularyVariant | null;
  error: boolean;
};

async function getVariantById(id: string): Promise<LookupResult> {
  const cookieStore = await cookies();
  const session = cookieStore.get("kaqchikel_session");

  if (!session) {
    return { variant: null, error: true };
  }

  const apiUrl = process.env.API_INTERNAL_URL ?? "http://127.0.0.1:4000";

  let page = 1;

  try {
    while (true) {
      const response = await fetch(
        `${apiUrl}/api/v1/admin/vocabulary/variants?page=${page}&pageSize=50`,
        {
          method: "GET",
          headers: {
            Cookie: `kaqchikel_session=${session.value}`,
          },
          cache: "no-store",
        },
      );

      if (!response.ok) {
        return { variant: null, error: true };
      }

      const result = (await response.json()) as VariantsResponse;

      if (
        !result.success ||
        !result.data ||
        !Array.isArray(result.data.items)
      ) {
        return { variant: null, error: true };
      }

      const variant = result.data.items.find((item) => item.id === id);

      if (variant) {
        return { variant, error: false };
      }

      const totalPages = result.data.pagination.totalPages;

      if (
        !Number.isInteger(totalPages) ||
        totalPages < 0 ||
        totalPages > 1000000
      ) {
        return { variant: null, error: true };
      }

      if (page >= totalPages) {
        break;
      }

      page++;
    }

    return { variant: null, error: false };
  } catch {
    return { variant: null, error: true };
  }
}

export default async function EditVariantPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdmin();

  const { id } = await params;

  const { variant, error } = await getVariantById(id);

  if (error) {
    return (
      <div className="rounded-xl border p-6">
        <h1 className="text-xl font-semibold">No se pudo cargar la variante</h1>

        <p className="mt-2 text-sm text-muted-foreground">
          Comprueba que el servidor esté disponible e intenta nuevamente.
        </p>
      </div>
    );
  }

  if (!variant) {
    notFound();
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Editar variante regional</h1>

        <p className="mt-2 text-sm text-muted-foreground">
          Modifica los datos de la variante seleccionada.
        </p>
      </div>

      <VariantForm
        variantId={variant.id}
        initialValues={{
          name: variant.name,
          code: variant.code,
          region: variant.region,
          description: variant.description,
          isActive: variant.isActive,
        }}
      />
    </div>
  );
}
