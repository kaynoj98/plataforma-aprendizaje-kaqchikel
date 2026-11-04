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

type VocabularyFormProps = {
  vocabularyId?: string;
  initialValues?: {
    termKaqchikel: string;
    translationEs: string;
    description: string | null;
    phoneticGuide: string | null;
  };
};

export function VocabularyForm({
  vocabularyId,
  initialValues,
}: VocabularyFormProps) {
  const isEditing = Boolean(vocabularyId);

  const [termKaqchikel, setTermKaqchikel] = useState(
    initialValues?.termKaqchikel ?? "",
  );

  const [translationEs, setTranslationEs] = useState(
    initialValues?.translationEs ?? "",
  );

  const [description, setDescription] = useState(
    initialValues?.description ?? "",
  );

  const [phoneticGuide, setPhoneticGuide] = useState(
    initialValues?.phoneticGuide ?? "",
  );

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (saving) return;

    setSaving(true);
    setError("");

    try {
      const body = {
        termKaqchikel: termKaqchikel.trim(),
        translationEs: translationEs.trim(),
        description: description.trim() || null,
        phoneticGuide: phoneticGuide.trim() || null,

        // Solamente las palabras nuevas se crean inactivas
        ...(!isEditing ? { isActive: false } : {}),
      };

      const url = isEditing
        ? `/api/v1/admin/vocabulary/${vocabularyId}`
        : "/api/v1/admin/vocabulary";

      const response = await fetch(url, {
        method: isEditing ? "PATCH" : "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "same-origin",
        body: JSON.stringify(body),
      });

      const result = (await response
        .json()
        .catch(() => null)) as ApiResponse | null;

      if (response.status === 401) {
        window.location.replace("/login");
        return;
      }

      if (!response.ok || !result?.success) {
        setError(result?.error?.message ?? "No se pudo registrar la palabra.");
        return;
      }

      // Regresar al listado con datos actualizados
      window.location.assign("/admin/vocabulario");
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
        <label htmlFor="term" className="text-sm font-medium">
          Palabra en Kaqchikel *
        </label>
        <input
          id="term"
          required
          maxLength={200}
          value={termKaqchikel}
          onChange={(e) => setTermKaqchikel(e.target.value)}
          placeholder="Escribe la palabra en Kaqchikel"
          className="w-full rounded-lg border bg-background px-3 py-2.5 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="translation" className="text-sm font-medium">
          Traducción al español *
        </label>
        <input
          id="translation"
          required
          maxLength={200}
          value={translationEs}
          onChange={(e) => setTranslationEs(e.target.value)}
          placeholder="Escribe su significado en español"
          className="w-full rounded-lg border bg-background px-3 py-2.5 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="description" className="text-sm font-medium">
          Descripción
        </label>
        <textarea
          id="description"
          rows={3}
          maxLength={3000}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Explicación o contexto de uso (opcional)"
          className="w-full rounded-lg border bg-background px-3 py-2.5 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="phonetic" className="text-sm font-medium">
          Guía de pronunciación
        </label>
        <input
          id="phonetic"
          maxLength={500}
          value={phoneticGuide}
          onChange={(e) => setPhoneticGuide(e.target.value)}
          placeholder="Guía fonética validada (opcional)"
          className="w-full rounded-lg border bg-background px-3 py-2.5 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
        />
      </div>

      <p className="text-xs text-muted-foreground">
        * Campos obligatorios. La palabra se guardará inicialmente como inactiva
        hasta su revisión.
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
          <Link href="/admin/vocabulario">Cancelar</Link>
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
              : "Guardar palabra"}
        </Button>
      </div>
    </form>
  );
}
