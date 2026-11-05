"use client";

import { useState } from "react";
import type { FormEvent } from "react";
import Link from "next/link";
import { Loader2, Save } from "lucide-react";

import { Button } from "@/components/ui/button";

type ApiResponse = {
  success: boolean;
  error?: {
    code?: string;
    message?: string;
  };
};

type VariantFormProps = {
  variantId?: string;
  initialValues?: {
    name: string;
    code: string;
    region: string | null;
    description: string | null;
    isActive: boolean;
  };
};

export function VariantForm({ variantId, initialValues }: VariantFormProps) {
  const isEditing = Boolean(variantId);

  const [name, setName] = useState(initialValues?.name ?? "");

  const [code, setCode] = useState(initialValues?.code ?? "");

  const [region, setRegion] = useState(initialValues?.region ?? "");

  const [description, setDescription] = useState(
    initialValues?.description ?? "",
  );

  const [isActive, setIsActive] = useState(initialValues?.isActive ?? false);

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (saving) return;

    setSaving(true);
    setError("");

    try {
      const body = {
        name: name.trim(),
        code: code.trim(),
        region: region.trim() || null,
        description: description.trim() || null,
        isActive,
      };

      const url = isEditing
        ? `/api/v1/admin/vocabulary/variants/${variantId}`
        : "/api/v1/admin/vocabulary/variants";

      const response = await fetch(url, {
        method: isEditing ? "PATCH" : "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "same-origin",
        body: JSON.stringify(body),
      });

      if (response.status === 401) {
        window.location.replace("/login");
        return;
      }

      const result = (await response
        .json()
        .catch(() => null)) as ApiResponse | null;

      if (!response.ok || !result?.success) {
        setError(result?.error?.message ?? "No se pudo registrar la variante.");
        return;
      }

      window.location.assign("/admin/vocabulario/variantes");
    } catch {
      setError("No fue posible conectar con el servidor.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-6 rounded-xl border bg-card p-6 shadow-sm"
    >
      {/* Nombre */}
      <div className="space-y-2">
        <label htmlFor="variant-name" className="text-sm font-medium">
          Nombre de la variante *
        </label>

        <input
          id="variant-name"
          required
          maxLength={150}
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Nombre documentado de la variante"
          className="w-full rounded-lg border bg-background px-3 py-2.5 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
        />
      </div>

      {/* Código */}
      <div className="space-y-2">
        <label htmlFor="variant-code" className="text-sm font-medium">
          Código identificador *
        </label>

        <input
          id="variant-code"
          required
          maxLength={50}
          pattern="[A-Za-z0-9_-]+"
          title="Utiliza letras, números, guiones o guiones bajos."
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="Ejemplo: variante_prueba"
          className="w-full rounded-lg border bg-background px-3 py-2.5 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
        />

        <p className="text-xs text-muted-foreground">
          No utilices espacios ni caracteres especiales.
        </p>
      </div>

      {/* Región */}
      <div className="space-y-2">
        <label htmlFor="variant-region" className="text-sm font-medium">
          Región geográfica
        </label>

        <input
          id="variant-region"
          maxLength={150}
          value={region}
          onChange={(e) => setRegion(e.target.value)}
          placeholder="Región correspondiente"
          className="w-full rounded-lg border bg-background px-3 py-2.5 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
        />
      </div>

      {/* Descripción */}
      <div className="space-y-2">
        <label htmlFor="variant-description" className="text-sm font-medium">
          Descripción
        </label>

        <textarea
          id="variant-description"
          rows={4}
          maxLength={3000}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Información lingüística y contexto regional."
          className="w-full rounded-lg border bg-background px-3 py-2.5 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
        />
      </div>

      {/* Estado */}
      <div className="space-y-2">
        <label className="flex items-center gap-3 text-sm">
          <input
            type="checkbox"
            checked={isActive}
            onChange={(e) => setIsActive(e.target.checked)}
            className="size-4 accent-primary"
          />
          Variante activa
        </label>

        <p className="text-xs text-muted-foreground">
          Puedes mantener la variante inactiva hasta que su información sea
          revisada.
        </p>
      </div>

      {/* Error */}
      {error && (
        <p
          role="alert"
          className="rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive"
        >
          {error}
        </p>
      )}

      {/* Acciones */}
      <div className="flex flex-wrap justify-end gap-3">
        <Button variant="outline" asChild>
          <Link href="/admin/vocabulario/variantes">Cancelar</Link>
        </Button>

        <Button type="submit" disabled={saving}>
          {saving ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <Save className="size-4" />
          )}

          {saving
            ? "Guardando..."
            : isEditing
              ? "Guardar cambios"
              : "Guardar variante"}
        </Button>
      </div>
    </form>
  );
}
