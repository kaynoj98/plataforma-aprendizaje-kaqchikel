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

type CategoryFormProps = {
  categoryId?: string;
  initialValues?: {
    name: string;
    slug: string;
    description: string | null;
    isActive: boolean;
  };
};

export function CategoryForm({ categoryId, initialValues }: CategoryFormProps) {
  const isEditing = Boolean(categoryId);

  const [name, setName] = useState(initialValues?.name ?? "");

  const [slug, setSlug] = useState(initialValues?.slug ?? "");

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
        slug: slug.trim(),
        description: description.trim() || null,
        isActive,
      };

      const url = isEditing
        ? `/api/v1/admin/vocabulary/categories/${categoryId}`
        : "/api/v1/admin/vocabulary/categories";

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
        setError(
          result?.error?.message ?? "No se pudo registrar la categoría.",
        );
        return;
      }

      window.location.assign("/admin/vocabulario/categorias");
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
      <div className="space-y-2">
        <label htmlFor="category-name" className="text-sm font-medium">
          Nombre de la categoría *
        </label>

        <input
          id="category-name"
          required
          maxLength={150}
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Ejemplo: Familia"
          className="w-full rounded-lg border bg-background px-3 py-2.5 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="category-slug" className="text-sm font-medium">
          Identificador (slug) *
        </label>

        <input
          id="category-slug"
          required
          maxLength={180}
          pattern="[a-z0-9]+(-[a-z0-9]+)*"
          title="Utiliza letras minúsculas, números y guiones."
          value={slug}
          onChange={(e) => setSlug(e.target.value)}
          placeholder="Ejemplo: familia"
          className="w-full rounded-lg border bg-background px-3 py-2.5 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
        />

        <p className="text-xs text-muted-foreground">
          Utiliza letras minúsculas, números y guiones. Ejemplo:
          partes-del-cuerpo.
        </p>
      </div>

      <div className="space-y-2">
        <label htmlFor="category-description" className="text-sm font-medium">
          Descripción
        </label>

        <textarea
          id="category-description"
          rows={4}
          maxLength={3000}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Describe el contenido de esta categoría."
          className="w-full rounded-lg border bg-background px-3 py-2.5 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
        />
      </div>

      <label className="flex items-center gap-3 text-sm">
        <input
          type="checkbox"
          checked={isActive}
          onChange={(e) => setIsActive(e.target.checked)}
          className="size-4 accent-primary"
        />
        Categoría activa
      </label>

      <p className="text-xs text-muted-foreground">
        Puedes mantener la categoría inactiva hasta revisar su contenido.
      </p>

      {error && (
        <p
          role="alert"
          className="rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive"
        >
          {error}
        </p>
      )}

      <div className="flex flex-wrap justify-end gap-3">
        <Button variant="outline" asChild>
          <Link href="/admin/vocabulario/categorias">Cancelar</Link>
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
              : "Guardar categoría"}
        </Button>
      </div>
    </form>
  );
}
