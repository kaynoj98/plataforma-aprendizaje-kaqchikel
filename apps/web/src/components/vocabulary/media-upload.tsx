"use client";

import { useEffect, useId, useRef, useState } from "react";
import { AudioLines, Check, ImagePlus, Loader2, Upload } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

import { httpError, Preview, StoredPreview } from "./media-preview";

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
  const [uploadedId, setUploadedId] = useState<string>();
  const [dragging, setDragging] = useState(false);
  const isImage = kind === "image";
  const limit = isImage ? 10 : 30;
  const allowed = formats[kind];
  const extensions = [...new Set(Object.values(allowed).flat())];
  const Icon = isImage ? ImagePlus : AudioLines;
  const awaitingSave = Boolean(mediaId && mediaId === uploadedId);
  const prompt = isImage ? "Haz clic para seleccionar una imagen" : "Haz clic para seleccionar un audio";
  const dropHint = isImage ? "O arrastra y suelta una imagen aquí" : "O arrastra y suelta un audio aquí";
  function clearSelection() {
    if (input.current) input.current.value = "";
    setFile(undefined);
    onPending(false);
    setLocalUrl("");
  }
  useEffect(() => () => { if (localUrl) URL.revokeObjectURL(localUrl); }, [localUrl]);

  function select(candidate?: File) {
    setError("");

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
      setUploadedId(media.id);
    } catch {
      setError("No se pudo confirmar la subida. Comprueba la conexión con el servidor.");
    } finally {
      lock.current = false;
      setBusy(false);
    }
  }
  return (
    <fieldset disabled={disabled || busy} className="min-w-0 space-y-3 rounded-xl border bg-card p-4 text-sm">
      <legend className="px-1.5 font-semibold">
        {isImage ? "Imagen de vocabulario" : "Audio de pronunciación"}
      </legend>

      {(localUrl || mediaId) && (
        <div className="min-w-0 space-y-2 rounded-lg bg-muted/50 p-3">
          <p className="text-xs font-medium">
            {file ? "Selección pendiente de subir" : awaitingSave ? "Subida pendiente de asociar"
              : isImage ? "Imagen asociada" : "Audio asociado"}
          </p>
          <div className={cn("min-w-0", isImage && "grid min-h-24 place-items-center [&_img]:max-h-36")}>
            {localUrl ? (
              <Preview kind={kind} src={localUrl}
                onError={() => setError("El navegador no puede mostrar la vista previa de este archivo.")} />
            ) : mediaId && <StoredPreview key={mediaId} kind={kind} id={mediaId} showName />}
          </div>
          {file && <p className="break-all text-xs text-muted-foreground">{file.name}</p>}
        </div>
      )}

      <div>
        <input ref={input} type="file" id={inputId} className="peer sr-only"
          accept={[...Object.keys(allowed), ...extensions.map(ext => "." + ext)].join(",")}
          aria-describedby={inputId + "-formats"}
          onChange={event => {
            const candidate = event.target.files?.[0];
            if (candidate) select(candidate);
          }} />
        <label htmlFor={inputId}
          onDragOver={event => {
            event.preventDefault();
            const canDrop = !disabled && !lock.current && event.dataTransfer.types.includes("Files");
            event.dataTransfer.dropEffect = canDrop ? "copy" : "none";
            setDragging(canDrop);
          }}
          onDragLeave={event => {
            if (!(event.relatedTarget instanceof Node && event.currentTarget.contains(event.relatedTarget))) {
              setDragging(false);
            }
          }}
          onDrop={event => {
            event.preventDefault();
            setDragging(false);
            if (disabled || lock.current) return;
            const files = event.dataTransfer.files;
            if (files.length > 1) {
              setError("Selecciona un solo archivo a la vez.");
            } else if (files.length === 1) {
              select(files[0]);
            }
          }}
          className={cn(
            "flex min-h-14 cursor-pointer items-center gap-3 rounded-lg border-2 border-dashed px-3 py-3 transition-colors hover:border-primary/50 hover:bg-muted/50",
            "peer-focus-visible:border-ring peer-focus-visible:ring-2 peer-focus-visible:ring-ring peer-focus-visible:ring-offset-2 peer-disabled:cursor-default peer-disabled:opacity-60",
            dragging && "border-primary bg-primary/10",
          )}>
          <Icon aria-hidden="true" className="size-6 shrink-0 text-primary" />
          <span className="min-w-0">
            <span className="block font-medium">{dragging ? "Suelta el archivo aquí" : mediaId || file
              ? isImage ? "Seleccionar otra imagen" : "Seleccionar otro audio"
              : prompt}</span>
            <span className="block text-xs text-muted-foreground">{dropHint}</span>
          </span>
        </label>
        <p id={inputId + "-formats"} className="mt-2 text-xs text-muted-foreground">
          {extensions.join(", ").toUpperCase()} · Hasta {limit} MiB
        </p>
      </div>

      {file && (
        <div className="flex flex-wrap gap-2">
          <Button type="button" className="min-h-11" disabled={busy || disabled} onClick={upload}>
            {busy ? <Loader2 aria-hidden="true" className="size-4 animate-spin" /> : <Upload aria-hidden="true" />}
            {busy ? "Subiendo…" : isImage ? "Subir imagen" : "Subir audio"}
          </Button>
          <Button type="button" variant="ghost" className="min-h-11" onClick={() => select()}>Descartar</Button>
        </div>
      )}
      {error && <p role="alert" className="rounded-md bg-destructive/10 px-3 py-2 text-destructive">{error}</p>}
      <div role="status" className="empty:hidden">
        {busy ? "Subida en curso…" : awaitingSave && !file && (
          <p className="flex items-start gap-2 text-xs text-muted-foreground">
            <Check aria-hidden="true" className="size-4 shrink-0 text-primary" />
            Archivo subido. Guarda los cambios para asociarlo a la palabra.
          </p>
        )}
      </div>
    </fieldset>
  );
}
