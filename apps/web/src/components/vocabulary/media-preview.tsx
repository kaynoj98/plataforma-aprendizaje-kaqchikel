"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";

export type MediaKind = "image" | "audio" | "video";
type Kind = MediaKind;

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

export function Preview({ kind, src, label, onError }: { kind: Kind; src: string; label?: string; onError: () => void }) {
  if (kind === "video") return <video aria-label={label || "Video educativo"} className="w-full rounded-md" controls playsInline preload="metadata" src={src} onError={onError} />;
  if (kind === "audio") {
    return <audio aria-label={label || "Audio de pronunciación"} className="w-full" controls preload="metadata"
      src={src} onError={onError} />;
  }
  // El recurso puede ser un blob local o una URL firmada de corta duración.
  // eslint-disable-next-line @next/next/no-img-element
  return <img className="max-h-52 max-w-full rounded-md object-contain"
    alt={label || "Imagen de vocabulario"} src={src} onError={onError} />;
}

function PracticeRecording({src,onError}:{src:string;onError:(unsupported:boolean)=>void}) {
  const ref=useRef<HTMLAudioElement>(null);
  const [speed,setSpeed]=useState(1);
  const [notice,setNotice]=useState("");
  useEffect(()=>{
    const player=ref.current;
    return ()=>{player?.pause();};
  },[src]);
  return <div className="space-y-2">
    <audio ref={ref} controls preload="metadata" className="w-full" src={src}
      aria-label="Grabación de la pregunta" onError={()=>onError(ref.current?.error?.code===4)}
      onLoadedMetadata={()=>{if(ref.current)ref.current.playbackRate=speed;}}/>
    <div className="flex flex-wrap items-center gap-3">
      <Button type="button" variant="outline" onClick={()=>{const player=ref.current;if(player){player.currentTime=0;void player.play().catch(()=>setNotice("No se pudo iniciar la reproducción."));}}}>Repetir audio</Button>
      <label>Velocidad <select className="rounded border p-1" value={speed} onChange={e=>{const rate=Number(e.target.value);setSpeed(rate);if(ref.current)ref.current.playbackRate=rate;}}>
        <option value={0.75}>0.75×</option><option value={1}>1.0×</option></select></label>
    </div>{notice && <p role="status">{notice}</p>}
  </div>;
}

export function StoredPreview({ kind, id, label, accessPath, showName = false }: { kind: Kind; id: string; label?: string; accessPath?: string; showName?: boolean }) {
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
        const response = await fetch(accessPath ?? `/api/v1/media/${encodeURIComponent(id)}/access`, {
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
  }, [id, attempt, accessPath]);
  if (error) return <div className="space-y-2"><p role="alert">{error}</p>
    <Button type="button" variant="outline" onClick={refresh}>Reintentar vista previa</Button></div>;
  if (!link) return <p role="status">Cargando vista previa…</p>;
  if (kind==="audio" && accessPath) return <PracticeRecording src={link.url} onError={unsupported=>{
    if(Date.now()>=link.expires-1000) refresh();
    else setError(unsupported ? "El navegador no puede reproducir este formato de audio." : "No se pudo reproducir la grabación.");
  }}/>;
  return <>
    <Preview kind={kind} label={label} src={link.url} onError={() => {
      if (Date.now() >= link.expires - 1000) refresh();
      else setError("No se pudo abrir el archivo multimedia.");
    }} />
    {showName && link.name && <p className="mt-2 break-all text-xs text-muted-foreground">{link.name}</p>}
  </>;
}
