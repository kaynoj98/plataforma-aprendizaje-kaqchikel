"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { BookPlus, Check, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export function ProgressAction({ courseId, lessonId }: { courseId: string; lessonId?: string }) {
  const router = useRouter();
  const lock = useRef(false);
  const [busy, setBusy] = useState(false);
  const [refreshing, startTransition] = useTransition();
  const [error, setError] = useState("");

  async function save() {
    if (lock.current || refreshing) return;
    lock.current = true;
    setBusy(true);
    setError("");
    try {
      const path = "/api/v1/enrollments/" + courseId + (lessonId ? "/lessons/" + lessonId : "");
      const response = await fetch(path, { method: "PUT", credentials: "same-origin" });
      if (response.status === 401) { router.replace("/login"); return; }
      if (!response.ok) {
        const result = await response.json().catch(() => null);
        setError(result?.error?.message ?? "No se pudo guardar. Inténtalo de nuevo.");
        return;
      }
      startTransition(() => router.refresh());
    } catch {
      setError("No se pudo conectar con el servidor. Puedes volver a intentarlo.");
    } finally {
      lock.current = false;
      setBusy(false);
    }
  }

  return <div className="space-y-2">
    <Button type="button" disabled={busy || refreshing} onClick={save}>
      {busy || refreshing ? <Loader2 aria-hidden="true" className="animate-spin" />
        : lessonId ? <Check aria-hidden="true" /> : <BookPlus aria-hidden="true" />}
      {busy || refreshing ? "Guardando…" : lessonId ? "Marcar como completada" : "Inscribirme al curso"}
    </Button>
    {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
  </div>;
}
