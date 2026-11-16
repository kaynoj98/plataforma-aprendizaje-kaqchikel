"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowDown, ArrowUp, Eye, EyeOff, Heading, LetterText, MessagesSquare, Plus, File } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MediaUpload } from "@/components/vocabulary/media-upload";
import { StoredPreview, type MediaKind } from "@/components/vocabulary/media-preview";
import { MediaLibrary } from "./media-library";
import type { BlockList, LessonBlock } from "@/lib/admin-academics";

const historical = "3f07bcd1-d22a-49a1-a3f6-bafcb24ca70e";
const labels: Record<string, string> = { HEADING: "Encabezado", TEXT: "Párrafo", EXAMPLE: "Ejemplo",
  IMAGE: "Imagen", AUDIO: "Audio", VIDEO: "Video", DOCUMENT: "Documento", DIALOGUE: "Diálogo",
  NOTE: "Nota", QUIZ: "Evaluación", VOCABULARY: "Vocabulario" };
const editable = ["HEADING", "TEXT", "EXAMPLE", "IMAGE", "AUDIO", "VIDEO"];
function mediaKind(type?: string): MediaKind | undefined {
  if (type === "IMAGE") return "image";
  if (type === "AUDIO") return "audio";
  if (type === "VIDEO") return "video";
}
const field = "mt-1 block w-full rounded-lg border bg-background px-3 py-2 text-sm";
const value = (content: Record<string, unknown>, key: string) => typeof content[key] === "string" ? content[key] : "";
function draftOf(block?: LessonBlock) {
  const content = block?.content ?? {};
  return { id: block?.id, type: block?.type ?? "TEXT", title: block?.title ?? "", text: value(content, "text"),
    mediaId: block?.mediaId ?? "", alt: value(content,"alt"), description: value(content,"description"), transcript: value(content,"transcript"),
    kaqchikel: value(content, "kaqchikel"), spanish: value(content, "spanish"), level: String(content.level ?? 2),
    isVisible: block?.isVisible ?? false };
}

export function BlockEditor({ lessonId, initial }: { lessonId: string; initial: BlockList }) {
  const [list, setList] = useState(initial);
  const [draft, setDraft] = useState<ReturnType<typeof draftOf> | null>(null);
  const [busy, setBusy] = useState(false);
  const [stale, setStale] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  const kind = mediaKind(draft?.type);
  const lock = useRef(false);
  const collection = `/api/v1/admin/lessons/${lessonId}/blocks`;
  const selected = list.blocks.find(block => block.id === draft?.id);
  const dirty = draft !== null && (pending || JSON.stringify(draft) !== JSON.stringify(draftOf(selected)));
  useEffect(() => {
    if (!dirty) return;
    function warn(event: BeforeUnloadEvent) { event.preventDefault(); event.returnValue = ""; }
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);
  const close = () => !dirty || window.confirm("¿Descartar los cambios pendientes?");
  const blocked = busy || stale || Boolean(draft);
  const damaged = draft && [draft.title, draft.text, draft.kaqchikel, draft.spanish, draft.alt, draft.description, draft.transcript].some(s => s.includes("�"));

  async function load() {
    const res = await fetch(collection, { cache: "no-store" });
    if (!res.ok) throw new Error("No se pudo actualizar la lista.");
    const result = await res.json();
    const data: BlockList = result.data;
    if (!result.success || !Array.isArray(data?.blocks) || typeof data.revision !== "string" ||
        data.blocks.some(block => block.lessonId !== lessonId)) throw new Error("La respuesta de bloques no es válida.");
    setList(data);
  }

  async function reload() {
    if (lock.current || !close()) return;
    lock.current = true;
    setBusy(true);
    try { await load(); setDraft(null); setStale(false); setError(""); setMessage("Lista actualizada."); }
    catch { setError("No se pudo consultar la lección. Puedes volver a intentar la lectura."); }
    finally { setBusy(false); lock.current = false; }
  }

  async function change(path: string, method: string, body?: object) {
    if (lock.current || stale) return;
    lock.current = true;
    setBusy(true);
    setError("");
    setMessage("");
    try {
      const response = await fetch(path, { method,
        headers: { "X-Lesson-Revision": list.revision, ...(body && { "Content-Type": "application/json" }) },
        ...(body && { body: JSON.stringify(body) }) });
      const result = await response.json();
      if (!response.ok || !result.success) {
        if (response.status === 409 || response.status >= 500) setStale(true);
        setError(result.error?.message ?? "El servidor no confirmó el cambio.");
        return;
      }
      await load();
      setDraft(null);
      setMessage(result.message ?? "Cambios guardados.");
    } catch {
      setStale(true);
      setError("No se pudo confirmar el estado final. Consulta la lista antes de repetir la operación.");
    } finally { setBusy(false); lock.current = false; }
  }

  function move(index: number, delta: number) {
    const ordered = [...list.blocks];
    const next = index + delta;
    if (!ordered[next] || ordered[next].id === historical || ordered[index].id === historical) return;
    [ordered[index], ordered[next]] = [ordered[next], ordered[index]];
    let previous = -1;
    const positions = ordered.map((block, i) => {
      previous = Math.max(previous + 1, list.blocks[i].position);
      return { blockId: block.id, position: previous };
    }).filter((entry, i) => ordered[i].position !== entry.position);
    if (positions.some(entry => entry.blockId === historical || entry.position > 2147483647)) {
      setError("Este movimiento afectaría una posición reservada."); return;
    }
    void change(collection + "/reorder", "PATCH", { blocks: positions });
  }

  function save() {
    if (!draft || pending || selected?.id === historical) return;
    const body: Record<string, unknown> = {};
    if (!selected || draft.title !== (selected.title ?? "")) {
      if (draft.title.trim()) body.title = draft.title.trim();
      else if (selected) body.title = null;
    }
    if (!selected || selected.isVisible !== draft.isVisible) body.isVisible = draft.isVisible;
    const content = { ...selected?.content };
    const original = draftOf(selected);
    let changed = false;
    if (kind) {
      if (!draft.mediaId) { setError("Selecciona o sube un archivo."); return; }
      if (kind === "image" && !draft.alt.trim()) { setError("Escribe el texto alternativo."); return; }
      if (!selected || selected.mediaId !== draft.mediaId) body.mediaId = draft.mediaId;
      const keys = kind === "image" ? ["alt","description"] as const : ["transcript"] as const;
      for (const key of keys) {
        if (!selected || original[key] !== draft[key]) { content[key] = draft[key]; changed = true; }
      }
    } else for (const key of draft.type === "EXAMPLE" ? ["kaqchikel","spanish"] as const : ["text"] as const) {
      if (!draft[key].trim()) { setError("Completa los campos de contenido."); return; }
      if (!selected || original[key] !== draft[key]) { content[key] = draft[key]; changed = true; }
    }
    if (draft.type === "HEADING" && (!selected || original.level !== draft.level)) {
      content.level = Number(draft.level); changed = true;
    }
    if (changed) body.content = content;
    if (!selected) {
      body.type = draft.type;
      const position = (list.blocks.at(-1)?.position ?? -1) + 1;
      if (position > 2147483647) { setError("La posición supera el máximo admitido."); return; }
      body.position = position;
    }
    if (!Object.keys(body).length) return;
    void change(selected ? "/api/v1/admin/blocks/" + selected.id : collection, selected ? "PATCH" : "POST", body);
  }

  return <div className="space-y-4">
    <div className="flex flex-wrap items-center justify-between gap-3">
      <h2 id="block-editor-top" tabIndex={-1} className="text-xl font-semibold">Bloques de la lección</h2>
      <Button disabled={blocked} onClick={() => { setPending(false); setDraft(draftOf()); setError(""); setMessage(""); }}><Plus />Agregar bloque</Button>
    </div>
    <div aria-live="polite">{busy ? "Actualizando…" : message}</div>
    {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
    {stale && <Button variant="outline" disabled={busy} onClick={reload}>Recargar bloques</Button>}
    {draft && <form onSubmit={e => { e.preventDefault(); save(); }} className="rounded-xl border bg-card p-4">
      <fieldset disabled={busy || stale} className="grid min-w-0 gap-3 text-sm">
        <legend className="mb-2 font-semibold">{selected ? "Editar bloque" : "Nuevo bloque"}</legend>
        {!selected && <label>Tipo<select disabled={pending} className={field} value={draft.type} onChange={e => setDraft({...draft,type:e.target.value,mediaId:""})}>
          {editable.map(type => <option key={type} value={type}>{labels[type]}</option>)}</select></label>}
        <label>Título opcional<input className={field} maxLength={200} value={draft.title} onChange={e => setDraft({...draft,title:e.target.value})} /></label>
        {draft.type === "HEADING" && <label>Nivel del encabezado<select className={field} value={draft.level} onChange={e => setDraft({...draft,level:e.target.value})}>
          {[...new Set([draft.level,"2","3"])].sort().map(level => <option key={level} value={level}>{level}</option>)}</select></label>}
        {kind && <>
          <MediaUpload key={kind} kind={kind} lesson mediaId={draft.mediaId || undefined} disabled={busy || stale}
            onPending={setPending} onUploaded={mediaId=>setDraft(current=>current ? {...current,mediaId} : null)} />
          <MediaLibrary key={"library-"+kind} kind={kind} disabled={pending}
            onSelect={mediaId=>setDraft({...draft,mediaId})} />
          {kind === "image" ? <>
            <label>Texto alternativo<input required maxLength={500} className={field} value={draft.alt} onChange={e=>setDraft({...draft,alt:e.target.value})} /></label>
            <label>Descripción opcional<textarea maxLength={10000} className={field} value={draft.description} onChange={e=>setDraft({...draft,description:e.target.value})} /></label>
          </> : <label>Transcripción opcional<textarea maxLength={10000} className={field} value={draft.transcript} onChange={e=>setDraft({...draft,transcript:e.target.value})} /></label>}
        </>}
        {!kind && (draft.type === "EXAMPLE" ? ["kaqchikel","spanish"] as const : ["text"] as const).map(key => <label key={key}>
          {key === "kaqchikel" ? "Ejemplo en Kaqchikel" : key === "spanish" ? "Traducción al español" : "Texto"}
          <textarea required rows={3} className={field} value={draft[key]} onChange={e => setDraft({...draft,[key]:e.target.value})} />
        </label>)}
        <label className="flex items-center gap-2"><input type="checkbox" checked={draft.isVisible} onChange={e => setDraft({...draft,isVisible:e.target.checked})} />Visible en la lección publicada</label>
        {damaged && <p role="status">El texto contiene el carácter de reemplazo �. Revisa la transcripción antes de guardar.</p>}
        {dirty && <p className="text-muted-foreground">Cambios pendientes de guardar</p>}
        <div className="flex flex-wrap gap-2"><Button type="submit" disabled={pending || (Boolean(selected) && !dirty)}>Guardar bloque</Button>
          <Button type="button" variant="outline" onClick={() => { if (close()) setDraft(null); }}>Cancelar</Button></div>
      </fieldset>
    </form>}
    {!list.blocks.length && <p className="rounded-lg border p-4">La lección todavía no tiene bloques.</p>}
    <ol className="space-y-3">{list.blocks.map((block, index) => {
      const Icon = block.type === "HEADING" ? Heading : block.type === "TEXT" ? LetterText : block.type === "EXAMPLE" ? MessagesSquare : File;
      const Visibility = block.isVisible ? Eye : EyeOff;
      const blockKind = mediaKind(block.type);
      const reserved = block.id === historical;
      const summary = value(block.content,"text") || value(block.content,"kaqchikel") || block.title;
      const endpoint = "/api/v1/admin/blocks/" + block.id;
      return <li key={block.id} className={`min-w-0 space-y-3 rounded-xl border p-4 ${block.isVisible ? "bg-card" : "border-dashed bg-muted/40"}`}>
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
          <h3 className="flex items-center gap-2 font-semibold"><Icon className="size-4" />{labels[block.type] ?? block.type}</h3>
          <span className="text-xs">Posición {block.position}</span>
          <span className="flex items-center gap-1 text-xs"><Visibility className="size-4" />{block.isVisible ? "Visible" : "Oculto"}</span>
        </div>
        {blockKind && block.mediaId && <StoredPreview kind={blockKind} id={block.mediaId} label={value(block.content,"alt") || block.title || undefined} />}
        {block.title && <p className="break-words font-medium">{block.title}</p>}
        {summary && <p className="line-clamp-2 break-words text-sm">{summary}</p>}
        {block.type === "EXAMPLE" && <details className="text-sm"><summary className="cursor-pointer">Revisar ejemplo</summary>
          <p className="whitespace-pre-wrap break-words" lang="cak">{value(block.content,"kaqchikel")}</p><p className="whitespace-pre-wrap break-words">{value(block.content,"spanish")}</p></details>}
        {reserved ? <p className="text-sm">Solo lectura · Pendiente de transcripciones originales.</p> : <>
          {!editable.includes(block.type) && <p className="text-sm">Este tipo aún no tiene un formulario de contenido definido.</p>}
          <div className="flex flex-wrap gap-2">
            {editable.includes(block.type) && <Button disabled={blocked} variant="outline" onClick={() => { setPending(false); setDraft(draftOf(block)); setError(""); setMessage(""); document.getElementById("block-editor-top")?.focus(); }}>Editar</Button>}
            <Button disabled={blocked} variant="outline" onClick={() => void change(endpoint,"PATCH",{isVisible:!block.isVisible})}>{block.isVisible ? "Ocultar" : "Mostrar"}</Button>
            <Button variant="outline" disabled={blocked || index === 0 || list.blocks[index-1]?.id === historical} onClick={() => move(index,-1)}><ArrowUp />Subir</Button>
            <Button variant="outline" disabled={blocked || index === list.blocks.length-1 || list.blocks[index+1]?.id === historical} onClick={() => move(index,1)}><ArrowDown />Bajar</Button>
            <Button variant="ghost" disabled={blocked} onClick={() => {
              if (window.confirm("¿Retirar este bloque de la lección? Se aplicará un borrado lógico.")) void change(endpoint,"DELETE");
            }}>Retirar</Button>
          </div></>}
      </li>;
    })}</ol>
  </div>;
}
