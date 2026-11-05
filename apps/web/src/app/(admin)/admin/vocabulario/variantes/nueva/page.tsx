import type { Metadata } from "next";

import { requireAdmin } from "@/lib/auth";
import { VariantForm } from "@/components/vocabulary/variant-form";

export const metadata: Metadata = {
  title: "Nueva variante regional",
};

export default async function NewVariantPage() {
  await requireAdmin();

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Nueva variante regional</h1>

        <p className="mt-2 text-sm text-muted-foreground">
          Registra una variante lingüística documentada del idioma Maya
          Kaqchikel.
        </p>
      </div>

      <VariantForm />
    </div>
  );
}
