"use client";

import { useEffect, useId, useRef, useState } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

type Kind = "image" | "audio";

const formats: Record<Kind, Record<string, string[]>> = {
  image: {
    "image/jpeg": ["jpg", "jpeg", "jfif"],
    "image/png": ["png"],
    "image/webp": ["webp"],
    "image/gif": ["gif"],
  },
  audio: {
    "audio/mpeg": ["mp3", "mp2", "mpeg", "mpga"],
    "audio/wav": ["wav"],
    "audio/x-wav": ["wav"],
    "audio/ogg": ["ogg", "oga", "opus"],
    "audio/mp4": ["m4a", "mp4"],
  },
};

function httpError(status: number) {
  switch (status) {
    case 400: return "El servidor rechazó el archivo o identificador.";
    case 401: return "La sesión ha caducado. Vuelve a iniciar sesión.";
    case 403: return "Tu cuenta no tiene permiso para esta operación.";
    case 404: return "El archivo ya no está disponible.";
    case 413: return "El archivo supera el tamaño permitido.";
    default: return "El servicio multimedia no está disponible. Inténtalo de nuevo.";
  }
}

function Preview({ kind, src, onError }: { kind: Kind; src: string; onError: () => void }) {
  if (kind === "audio") {
    return <audio aria-label="Audio de pronunciación" className="w-full" controls preload="metadata"
      src={src} onError={onError} />;
  }
  // El recurso puede ser un blob local o una URL firmada de corta duración.
  // eslint-disable-next-line @next/next/no-img-element
  return <img className="max-h-52 max-w-full rounded-md object-contain"
    alt="Imagen de vocabulario" src={src} onError={onError} />;
}

function StoredPreview({ kind, id }: { kind: Kind; id: string }) {
  const [attempt, setAttempt] = useState(0);
  const [link, setLink] = useState<{ url: string; expires: number }>();
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
          setLink({ url: data.url, expires: Date.now() + data.expiresInMinutes * 60000 });
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
  return <Preview kind={kind} src={link.url} onError={() => {
    if (Date.now() >= link.expires - 1000) refresh();
    else setError("No se pudo abrir el archivo multimedia.");
  }} />;
}

export function MediaUpload({ kind, mediaId, disabled, onUploaded, onPending }: {
  kind: Kind;
  mediaId?: string;
  disabled: boolean;
  onUploaded: (id: string) => void;
  onPending: (pending: boolean) => void;
}) {
  const inputId = useId();
  const input = useRef<HTMLInputElement>(null);
  const lock = useRef(false);
  const [file, setFile] = useState<File>();
  const [localUrl, setLocalUrl] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const isImage = kind === "image";
  const limit = isImage ? 10 : 30;
  const allowed = formats[kind];
  const extensions = [...new Set(Object.values(allowed).flat())];
  function clearSelection() {
    if (input.current) input.current.value = "";
    setFile(undefined);
    onPending(false);
    setLocalUrl("");
  }
  useEffect(() => () => { if (localUrl) URL.revokeObjectURL(localUrl); }, [localUrl]);

  function select(candidate?: File) {
    setError("");
    setMessage("");
    if (!candidate) { clearSelection(); return; }
    const extension = /\.([^.]+)$/.exec(candidate.name)?.[1].toLowerCase() ?? "";
    if (!allowed[candidate.type]?.includes(extension) || candidate.size > limit * 1024 * 1024) {
      clearSelection();
      setError(candidate.size > limit * 1024 * 1024 ? `El límite es de ${limit} MiB.` :
        "La extensión o el tipo de archivo no corresponde a un formato permitido.");
      return;
    }
    setFile(candidate);
    setLocalUrl(URL.createObjectURL(candidate));
    onPending(true);
  }
  async function upload() {
    if (!file || disabled || lock.current) return;
    lock.current = true;
    setBusy(true);
    setError("");
    try {
      const body = new FormData();
      body.append("file", file);
      const response = await fetch("/api/v1/admin/media", {
        method: "POST", credentials: "same-origin", body,
      });
      if (!response.ok) { setError(httpError(response.status)); return; }
      const result = await response.json();
      const media = result?.data?.media;
      if (!result?.success || media?.mediaType !== (isImage ? "IMAGE" : "AUDIO") ||
          typeof media.id !== "string" || !/^[\da-f]{8}(?:-[\da-f]{4}){3}-[\da-f]{12}$/i.test(media.id)) {
        setError("El servidor no confirmó el registro del archivo.");
        return;
      }
      onUploaded(media.id);
      clearSelection();
      setMessage("Archivo subido. Guarda los cambios para asociarlo a la palabra.");
    } catch {
      setError("No se pudo confirmar la subida. Comprueba la conexión con el servidor.");
    } finally {
      lock.current = false;
      setBusy(false);
    }
  }
  return (
    <fieldset disabled={disabled || busy} className="min-w-0 space-y-3 rounded-lg border p-4 text-sm">
      <legend className="px-1 font-medium">{isImage ? "Imagen de vocabulario" : "Audio de pronunciación"}</legend>
      {localUrl ? <Preview kind={kind} src={localUrl} onError={() => setError("El navegador no puede mostrar la vista previa de este archivo.")} />
        : mediaId && <StoredPreview key={mediaId} kind={kind} id={mediaId} />}
      <label htmlFor={inputId} className="block">Seleccionar {isImage ? "imagen" : "audio"}</label>
      <input ref={input} type="file" id={inputId} className="w-full text-sm"
        accept={[...Object.keys(allowed), ...extensions.map(ext => "." + ext)].join(",")}
        aria-describedby={inputId + "-formats"}
        onChange={event => select(event.target.files?.[0])} />
      <p id={inputId + "-formats"} className="text-xs text-muted-foreground">{extensions.join(", ")} · Hasta {limit} MiB</p>
      <div className="flex flex-wrap gap-2">
        <Button type="button" variant="outline" disabled={!file || busy} onClick={upload}>
          {busy && <Loader2 className="size-4 animate-spin" aria-hidden="true" />}
          {busy ? "Subiendo…" : isImage ? "Subir imagen" : "Subir audio"}
        </Button>
        {file && <Button type="button" variant="ghost" onClick={() => select()}>Descartar selección</Button>}
      </div>
      {error && <p role="alert" className="text-destructive">{error}</p>}
      <p role="status">{busy ? "Subida en curso…" : message}</p>
    </fieldset>
  );
}
