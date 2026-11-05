import type { Metadata } from "next";

import { requireAdmin } from "@/lib/auth";
import { CategoryForm } from "@/components/vocabulary/category-form";

export const metadata: Metadata = {
  title: "Nueva categoría",
};

export default async function NewCategoryPage() {
  await requireAdmin();

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Nueva categoría</h1>

        <p className="mt-2 text-sm text-muted-foreground">
          Crea una categoría temática para organizar el vocabulario del idioma
          Maya Kaqchikel.
        </p>
      </div>

      <CategoryForm />
    </div>
  );
}
