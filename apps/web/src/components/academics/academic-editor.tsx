"use client";

import { useRef, useState } from "react";
import type { FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import type { AcademicItem, Kind } from "@/lib/admin-academics";

const names = { courses: "curso", levels: "nivel", units: "unidad", lessons: "lección" };
const field = "mt-1 block w-full rounded-lg border bg-background px-3 py-2";
const transitions = { publish: "Publicar", unpublish: "Pasar a borrador", archive: "Archivar" };

export function AcademicEditor({ kind, endpoint, item }: { kind: Kind; endpoint: string; item?: AcademicItem }) {
  const router = useRouter();
  const form = useRef<HTMLFormElement>(null);
  const lock = useRef(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const course = kind === "courses";
  const lesson = kind === "lessons";

  async function submit(path: string, method: string, body?: Record<string, unknown>) {
    if (lock.current) return;
    lock.current = true;
    setBusy(true);
    setError("");
    setMessage("");
    try {
      const response = await fetch("/api/v1/admin/" + path, {
        method, credentials: "same-origin",
        ...(body && { headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }),
      });
      const result = await response.json().catch(() => null);
      if (!response.ok || !result?.success) {
        setError(result?.error?.message ?? "No se pudo guardar. Comprueba la sesión y vuelve a intentarlo.");
        return;
      }
      if (!item) form.current?.reset();
      setMessage(result.message ?? "Cambios guardados.");
      if (course && !item && result.data?.course?.id) router.push("/admin/cursos/" + result.data.course.id);
      router.refresh();
    } catch {
      setError("No se pudo conectar con el servidor.");
    } finally {
      lock.current = false;
      setBusy(false);
    }
  }

  function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const body: Record<string, unknown> = {};
    for (const [key, value] of data) {
      if (typeof value !== "string") continue;
      const text = value.trim();
      body[key] = key === "position" || key === "estimatedMinutes" ? Number(text) : text;
    }
    if (course) body.isPublicPreview = data.has("isPublicPreview");
    if (!body.slug) delete body.slug;
    for (const key of ["description", "objectives"]) {
      if (body[key] === "") {
        if (item) body[key] = null;
        else delete body[key];
      }
    }
    if (item) {
      for (const key of Object.keys(body) as (keyof AcademicItem)[]) {
        // El servicio regenera el slug al recibir un título: conservar el slug elegido.
        if (key === "slug" && body.title !== item.title && body.title !== undefined) continue;
        if (body[key] === item[key]) delete body[key];
      }
      if (!Object.keys(body).length) { setMessage("Sin cambios pendientes."); setError(""); return; }
    }
    void submit(endpoint, item ? "PATCH" : "POST", body);
  }

  return <details className="rounded-lg border bg-card p-3">
    <summary className="cursor-pointer font-medium">{item ? "Editar" : "Crear"} {names[kind]}</summary>
    <form ref={form} onSubmit={save} className="mt-4">
      <fieldset disabled={busy} className="grid min-w-0 gap-3 text-sm sm:grid-cols-2">
        <label className="sm:col-span-2">Título<input name="title" className={field} minLength={3} maxLength={200} required defaultValue={item?.title} /></label>
        <label className="sm:col-span-2">Descripción<textarea name="description" className={field} required={course} minLength={course ? 10 : undefined} maxLength={5000} defaultValue={item?.description ?? ""} /></label>
        <label>Posición<input type="number" name="position" min={0} max={2147483647} required className={field} defaultValue={item?.position ?? 0} /></label>
        {(course || lesson) && <label>Slug<input name="slug" className={field} minLength={3} maxLength={220} required={Boolean(item)} defaultValue={item?.slug} /></label>}
        {lesson && <label>Duración en minutos<input name="estimatedMinutes" type="number" min={1} max={600} required className={field} defaultValue={item?.estimatedMinutes ?? 10} /></label>}
        {course && <>
          <label className="sm:col-span-2">Objetivos<textarea name="objectives" className={field} maxLength={5000} defaultValue={item?.objectives ?? ""} /></label>
          <label>Dificultad<select className={field} name="difficulty" defaultValue={item?.difficulty ?? "BEGINNER"}>
            <option value="BEGINNER">Principiante</option><option value="INTERMEDIATE">Intermedio</option><option value="ADVANCED">Avanzado</option>
          </select></label>
          <label className="flex items-center gap-2"><input name="isPublicPreview" type="checkbox" defaultChecked={item?.isPublicPreview} />Permitir vista pública</label>
        </>}
        <Button className="justify-self-start" type="submit">{busy ? "Guardando…" : item ? "Guardar cambios" : "Crear " + names[kind]}</Button>
      </fieldset>
    </form>
    {item && <div className="mt-4 flex flex-wrap gap-2 border-t pt-3">
      {(Object.keys(transitions) as (keyof typeof transitions)[]).filter(action =>
        action === "publish" ? item.status !== "PUBLISHED" : action === "archive" ? item.status !== "ARCHIVED" : item.status !== "DRAFT"
      ).map(action => <Button key={action} variant="outline" disabled={busy} onClick={() => {
        if (window.confirm(`¿${transitions[action]} «${item.title}»?`)) void submit(endpoint + "/" + action, "POST");
      }}>{transitions[action]}</Button>)}
    </div>}
    {error && <p role="alert" className="mt-2 text-sm text-destructive">{error}</p>}
    <p role="status" className="mt-2 text-sm empty:hidden">{message}</p>
  </details>;
}
