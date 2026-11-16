"use client";

import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { StoredPreview } from "@/components/vocabulary/media-preview";
import type { LessonWord, LessonWordLink } from "@/lib/admin-academics";
import type { CatalogOption } from "@/lib/vocabulary-catalogs";

const field = "block w-full min-w-0 rounded-md border bg-background px-3 py-2";
type Results = {
  items: LessonWord[];
  pagination: { page: number; totalPages: number };
};

export function LessonVocabularyEditor({
  lessonId,
  initial,
  categories,
  variants,
}: {
  lessonId: string;
  initial: LessonWordLink[];
  categories: CatalogOption[] | null;
  variants: CatalogOption[] | null;
}) {
  const [links, setLinks] = useState(initial);
  const [results, setResults] = useState<Results>();
  const [query, setQuery] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const lock = useRef(false);
  const endpoint = "/api/v1/admin/lessons/" + lessonId + "/vocabulary";

  async function run(operation: () => Promise<void>) {
    if (lock.current) return;
    lock.current = true;
    setBusy(true);
    setMessage("");
    try {
      await operation();
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "No se pudo completar la operación.",
      );
    } finally {
      lock.current = false;
      setBusy(false);
    }
  }
  async function search(filters: string, page: number) {
    await run(async () => {
      const params = new URLSearchParams(filters);
      params.set("page", String(page));
      params.set("pageSize", "8");
      const res = await fetch("/api/v1/admin/vocabulary?" + params, {
        cache: "no-store",
      });
      if (!res.ok) throw new Error("No se pudo consultar el vocabulario.");
      const { data } = await res.json();
      setQuery(filters);
      setResults(data);
    });
  }
  async function refresh() {
    const res = await fetch(endpoint, { cache: "no-store" });
    if (!res.ok)
      throw new Error(
        "No se pudo actualizar la lista. Recarga las asociaciones antes de repetir un cambio.",
      );
    setLinks((await res.json()).data.items);
  }
  function save(word: LessonWord, position: number, visible: boolean) {
    void run(async () => {
      const res = await fetch(
        endpoint + "/" + word.id,
        visible
          ? {
              method: "PUT",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ position, isVisible: true }),
            }
          : { method: "DELETE" },
      );
      if (!res.ok) throw new Error("No se pudo guardar la asociación.");
      await refresh();
      setMessage("Asociaciones actualizadas.");
    });
  }
  return (
    <section
      className="space-y-4 rounded-xl border bg-card p-4"
      aria-labelledby="lesson-vocabulary"
    >
      <h2 id="lesson-vocabulary" className="text-xl font-semibold">
        Vocabulario de la lección
      </h2>
      <form
        className="grid gap-3 sm:grid-cols-2"
        onSubmit={(event) => {
          event.preventDefault();
          const params = new URLSearchParams();
          for (const [key, value] of new FormData(event.currentTarget))
            if (typeof value === "string" && value.trim())
              params.set(key, value.trim());
          void search(params.toString(), 1);
        }}
      >
        <label>
          Palabra o traducción
          <input className={field} name="q" maxLength={100} type="search" />
        </label>
        {(
          [
            ["categoryId", "Categoría", categories],
            ["variantId", "Variante regional", variants],
          ] as const
        ).map(([key, label, options]) => (
          <label key={key}>
            {label}
            <select className={field} name={key} disabled={!options}>
              <option value="">
                {options ? "Todas" : "Filtro no disponible"}
              </option>
              {options?.map((o) => (
                <option key={o.id} value={o.id}>
                  {o.name}
                </option>
              ))}
            </select>
          </label>
        ))}
        <Button disabled={busy} className="self-end">
          Buscar vocabulario
        </Button>
      </form>
      {results && (
        <div className="space-y-2">
          {!results.items.length && <p>Sin coincidencias.</p>}
          {results.items.map((word) => {
            const link = links.find((l) => l.vocabulary.id === word.id);
            return (
              <div
                className="flex flex-wrap items-center justify-between gap-2 border-b py-2"
                key={word.id}
              >
                <span>
                  <span lang="cak">{word.termKaqchikel}</span> ·{" "}
                  {word.translationEs}
                  {!word.isActive && " · Inactiva"}
                </span>
                <Button
                  variant="outline"
                  disabled={busy || link?.isVisible}
                  onClick={() =>
                    save(
                      word,
                      link?.position ?? (links.at(-1)?.position ?? -1) + 1,
                      true,
                    )
                  }
                >
                  {link?.isVisible ? "Asociada" : "Asociar"}
                </Button>
              </div>
            );
          })}
          {results.pagination.totalPages > 1 && (
            <nav
              aria-label="Resultados de vocabulario"
              className="flex flex-wrap items-center gap-2"
            >
              <Button
                variant="outline"
                disabled={busy || results.pagination.page === 1}
                onClick={() => void search(query, results.pagination.page - 1)}
              >
                Anterior
              </Button>
              Página {results.pagination.page} de{" "}
              {results.pagination.totalPages}
              <Button
                variant="outline"
                disabled={
                  busy ||
                  results.pagination.page >= results.pagination.totalPages
                }
                onClick={() => void search(query, results.pagination.page + 1)}
              >
                Siguiente
              </Button>
            </nav>
          )}
        </div>
      )}
      <div role="status">{busy ? "Actualizando…" : message}</div>
      <Button
        variant="outline"
        disabled={busy}
        onClick={() => void run(refresh)}
      >
        Recargar asociaciones
      </Button>
      {!links.length && <p>Esta lección aún no tiene palabras asociadas.</p>}
      <ul className="grid gap-3 sm:grid-cols-2">
        {links.map(({ vocabulary: word, position, isVisible }) => (
          <li
            key={word.id}
            className="min-w-0 space-y-2 break-words rounded-lg border p-3"
          >
            <h3 lang="cak" className="font-semibold">
              {word.termKaqchikel}
            </h3>
            <p>{word.translationEs}</p>
            <p className="text-sm">
              {isVisible ? "Asociada" : "Retirada"}
              {!word.isActive && " · Palabra inactiva"}
            </p>
            {word.imageMedia && (
              <StoredPreview
                key={word.imageMedia.id}
                kind="image"
                id={word.imageMedia.id}
              />
            )}
            {word.pronunciationMedia && (
              <StoredPreview
                key={word.pronunciationMedia.id}
                kind="audio"
                id={word.pronunciationMedia.id}
              />
            )}
            <form
              key={position}
              className="flex flex-wrap items-end gap-2"
              onSubmit={(event) => {
                event.preventDefault();
                save(
                  word,
                  Number(new FormData(event.currentTarget).get("position")),
                  true,
                );
              }}
            >
              <label>
                Posición
                <input
                  className={field}
                  name="position"
                  type="number"
                  min={0}
                  max={2147483647}
                  defaultValue={position}
                  required
                />
              </label>
              <Button variant="outline" disabled={busy}>
                {isVisible ? "Guardar posición" : "Volver a asociar"}
              </Button>
              {isVisible && (
                <Button
                  type="button"
                  variant="ghost"
                  disabled={busy}
                  onClick={() => save(word, position, false)}
                >
                  Retirar asociación
                </Button>
              )}
            </form>
          </li>
        ))}
      </ul>
    </section>
  );
}
