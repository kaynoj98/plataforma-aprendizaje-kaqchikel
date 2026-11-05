import type { Metadata } from "next";
import { cookies } from "next/headers";
import Link from "next/link";
import { ArrowLeft, MapPinned } from "lucide-react";

import { requireAdmin } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { VariantStatusButton } from "@/components/vocabulary/variant-status-button";

export const metadata: Metadata = {
  title: "Variantes regionales",
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

async function getVariants() {
  const cookieStore = await cookies();
  const session = cookieStore.get("kaqchikel_session");

  if (!session) {
    return null;
  }

  const apiUrl = process.env.API_INTERNAL_URL ?? "http://127.0.0.1:4000";

  try {
    const response = await fetch(
      `${apiUrl}/api/v1/admin/vocabulary/variants?page=1&pageSize=20`,
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

    const result = (await response.json()) as VariantsResponse;

    if (!result.success || !result.data) {
      return null;
    }

    return result.data;
  } catch {
    return null;
  }
}

export default async function VariantsPage() {
  await requireAdmin();

  const variants = await getVariants();

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <MapPinned className="size-7" />

          <div>
            <h1 className="text-2xl font-bold">Variantes regionales</h1>

            <p className="mt-1 text-sm text-muted-foreground">
              Administra las variantes lingüísticas documentadas del idioma Maya
              Kaqchikel.
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
          <Link href="/admin/vocabulario/variantes/nueva">
            + Nueva variante
          </Link>
        </Button>
      </div>

      <div className="rounded-xl border bg-card shadow-sm">
        <div className="border-b p-5">
          <h2 className="font-semibold">Variantes registradas</h2>

          <p className="mt-1 text-sm text-muted-foreground">
            Total: {variants?.pagination.total ?? "—"}
          </p>
        </div>

        {!variants ? (
          <p className="p-6 text-sm text-destructive">
            No fue posible consultar las variantes.
          </p>
        ) : variants.items.length === 0 ? (
          <p className="p-6 text-sm text-muted-foreground">
            Todavía no hay variantes registradas.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-275 text-left text-sm">
              <thead className="border-b bg-muted/50">
                <tr>
                  <th className="p-4">Nombre</th>
                  <th className="p-4">Código</th>
                  <th className="p-4">Región</th>
                  <th className="p-4">Descripción</th>
                  <th className="p-4">Estado</th>
                  <th className="min-w-55 p-4">Acciones</th>
                </tr>
              </thead>

              <tbody>
                {variants.items.map((variant) => (
                  <tr key={variant.id} className="border-b last:border-0">
                    <td className="p-4 font-medium">{variant.name}</td>

                    <td className="p-4 text-muted-foreground">
                      {variant.code}
                    </td>

                    <td className="p-4">{variant.region ?? "Sin región"}</td>

                    <td className="p-4">
                      {variant.description ?? "Sin descripción"}
                    </td>

                    <td className="p-4">
                      <span
                        className={
                          variant.isActive
                            ? "rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-800"
                            : "rounded-full bg-muted px-3 py-1 text-xs text-muted-foreground"
                        }
                      >
                        {variant.isActive ? "Activa" : "Inactiva"}
                      </span>
                    </td>

                    <td className="min-w-55 p-4">
                      <div className="flex flex-nowrap items-center gap-2 whitespace-nowrap">
                        <Button asChild variant="outline" size="sm">
                          <Link
                            href={`/admin/vocabulario/variantes/${variant.id}/editar`}
                          >
                            Editar
                          </Link>
                        </Button>

                        <VariantStatusButton
                          variantId={variant.id}
                          isActive={variant.isActive}
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
