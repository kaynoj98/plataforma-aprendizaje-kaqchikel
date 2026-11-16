"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import type { MediaKind } from "@/components/vocabulary/media-preview";

type FileOption = { id: string; originalName: string; mimeType: string };
export function MediaLibrary({
  kind,
  onSelect,
  disabled,
}: {
  kind: MediaKind;
  onSelect: (id: string) => void;
  disabled: boolean;
}) {
  const [search, setSearch] = useState("");
  const [query, setQuery] = useState<{
    text: string;
    page: number;
    request: number;
  }>();
  function findFiles() {
    setQuery(current => ({text:search.trim(), page:1, request:(current?.request ?? 0)+1}));
  }
  return (
    <fieldset disabled={disabled} className="space-y-2 rounded-lg border p-3">
      <legend>Biblioteca multimedia</legend>
      <label>
        Nombre del archivo
        <input
          className="block w-full rounded border p-2"
          maxLength={100}
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={event => { if (event.key === "Enter") { event.preventDefault(); findFiles(); } }}
        />
      </label>
      <Button
        type="button"
        variant="outline"
        onClick={findFiles}
      >
        Buscar archivos existentes
      </Button>
      {query && (
        <LibraryPage
          key={JSON.stringify([kind, query])}
          kind={kind}
          search={query.text}
          page={query.page}
          onPage={(page) => setQuery({ ...query, page })}
          onSelect={onSelect}
        />
      )}
    </fieldset>
  );
}
function LibraryPage({
  kind,
  search,
  page,
  onPage,
  onSelect,
}: {
  kind: MediaKind;
  search: string;
  page: number;
  onPage: (page: number) => void;
  onSelect: (id: string) => void;
}) {
  const [result, setResult] = useState<{
    files: FileOption[];
    pages: number;
  }>();
  const [error, setError] = useState(false);
  useEffect(() => {
    const controller = new AbortController();
    async function load() {
      const params = new URLSearchParams({
        type: kind.toUpperCase(),
        status: "AVAILABLE",
        page: String(page),
        pageSize: "8",
        search,
      });
      const response = await fetch("/api/v1/admin/media?" + params, {
        cache: "no-store",
        signal: controller.signal,
      });
      if (!response.ok) throw new Error();
      const data = await response.json();
      if (!controller.signal.aborted)
        setResult({ files: data.data, pages: data.pagination.totalPages });
    }
    load().catch(() => {
      if (!controller.signal.aborted) setError(true);
    });
    return () => controller.abort();
  }, [kind, search, page]);
  if (error)
    return (
      <p role="alert">No se pudo cargar la biblioteca. Vuelve a buscar.</p>
    );
  if (!result) return <p role="status">Consultando archivos…</p>;
  return (
    <div className="space-y-2">
      {!result.files.length && <p>Sin archivos coincidentes.</p>}
      {result.files.map((file) => (
        <div
          key={file.id}
          className="flex flex-wrap items-center justify-between gap-2"
        >
          <span className="break-all">
            {file.originalName} · {file.mimeType}
          </span>
          <Button
            type="button"
            variant="outline"
            onClick={() => onSelect(file.id)}
          >
            Usar archivo
          </Button>
        </div>
      ))}
      {result.pages > 1 && (
        <div className="flex flex-wrap items-center gap-2">
          <Button
            type="button"
            variant="outline"
            disabled={page === 1}
            onClick={() => onPage(page - 1)}
          >
            Anterior
          </Button>
          Página {page} de {result.pages}
          <Button
            type="button"
            variant="outline"
            disabled={page >= result.pages}
            onClick={() => onPage(page + 1)}
          >
            Siguiente
          </Button>
        </div>
      )}
    </div>
  );
}
