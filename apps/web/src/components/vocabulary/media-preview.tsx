"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

type Kind = "image" | "audio";

export function httpError(status: number) {
  switch (status) {
    case 400: return "El servidor rechazó el archivo o identificador.";
    case 401: return "La sesión ha caducado. Vuelve a iniciar sesión.";
    case 403: return "Tu cuenta no tiene permiso para esta operación.";
    case 404: return "El archivo ya no está disponible.";
    case 413: return "El archivo supera el tamaño permitido.";
    default: return "El servicio multimedia no está disponible. Inténtalo de nuevo.";
  }
}

export function Preview({ kind, src, onError }: { kind: Kind; src: string; onError: () => void }) {
  if (kind === "audio") {
    return <audio aria-label="Audio de pronunciación" className="w-full" controls preload="metadata"
      src={src} onError={onError} />;
  }
  // El recurso puede ser un blob local o una URL firmada de corta duración.
  // eslint-disable-next-line @next/next/no-img-element
  return <img className="max-h-52 max-w-full rounded-md object-contain"
    alt="Imagen de vocabulario" src={src} onError={onError} />;
}

export function StoredPreview({ kind, id, showName = false }: { kind: Kind; id: string; showName?: boolean }) {
  const [attempt, setAttempt] = useState(0);
  const [link, setLink] = useState<{ url: string; expires: number; name?: string }>();
  const [error, setError] = useState("");
  function refresh() {
    setError("");
    setLink(undefined);
    setAttempt(n => n + 1);
  }
  useEffect(() => {
    const controller = new AbortController();
    async function read() {
      try {
        const response = await fetch(`/api/v1/media/${encodeURIComponent(id)}/access`, {
          credentials: "same-origin", cache: "no-store", signal: controller.signal,
        });
        if (!response.ok) throw new Error(httpError(response.status));
        const result = await response.json();
        const data = result?.data;
        if (!result?.success || typeof data?.url !== "string" ||
            !(data.expiresInMinutes > 0)) throw new Error("El enlace del archivo no está disponible.");
        if (!controller.signal.aborted) {
          setLink({ url: data.url, expires: Date.now() + data.expiresInMinutes * 60000,
            name: typeof data.media?.originalName === "string" ? data.media.originalName : undefined });
        }
      } catch (cause) {
        if (!controller.signal.aborted) setError(cause instanceof TypeError
          ? "No se pudo conectar con el servicio multimedia."
          : cause instanceof Error ? cause.message : "El archivo no está disponible.");
      }
    }
    void read();
    return () => controller.abort();
  }, [id, attempt]);
  if (error) return <div className="space-y-2"><p role="alert">{error}</p>
    <Button type="button" variant="outline" onClick={refresh}>Reintentar vista previa</Button></div>;
  if (!link) return <p role="status">Cargando vista previa…</p>;
  return <>
    <Preview kind={kind} src={link.url} onError={() => {
      if (Date.now() >= link.expires - 1000) refresh();
      else setError("No se pudo abrir el archivo multimedia.");
    }} />
    {showName && link.name && <p className="mt-2 break-all text-xs text-muted-foreground">{link.name}</p>}
  </>;
}
