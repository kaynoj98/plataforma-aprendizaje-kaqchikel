"use client";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  api,
  message,
  type Definition,
  type Question,
  type Summary,
  type Document,
} from "./api";
import { MediaLibrary } from "@/components/academics/media-library";
import { MediaUpload } from "@/components/vocabulary/media-upload";
import { Practice } from "./practice";

const field = "mt-1 block w-full min-w-0 rounded-lg border bg-background p-2";
const blankQuestion = (): Question => ({
  editorKey: crypto.randomUUID(),
  prompt: "",
  feedback: "",
  vocabularyId: null,
  options: [
    { label: "", correct: true },
    { label: "", correct: false },
  ],
});
const blank = (): Definition => ({
  title: "",
  instructions: "",
  questions: [blankQuestion()],
});
function swap<T>(items: T[], a: number, b: number) {
  const next = [...items];
  [next[a], next[b]] = [next[b], next[a]];
  return next;
}
function WordPicker({
  onPick,
  onMedia,
  kind,
}: {
  kind: "audio" | "image";
  onMedia?: (id: string, term: string, mediaId: string) => void;
  onPick: (id: string, term: string) => void;
}) {
  const [query, setQuery] = useState("");
  const [words, setWords] = useState<
    {
      id: string;
      termKaqchikel: string;
      translationEs: string;
      variant?: { name: string; region?: string | null } | null;
      pronunciationMedia: { id: string } | null;
      imageMedia: { id: string } | null;
    }[]
  >([]);
  const [status, setStatus] = useState("");
  async function find() {
    try {
      const result = await api<{ items: typeof words }>(
        "admin/vocabulary?isActive=true&pageSize=10&q=" +
          encodeURIComponent(query.trim()),
      );
      setWords(result.items);
      setStatus(result.items.length ? "" : "Sin coincidencias.");
    } catch (e) {
      setStatus(message(e));
    }
  }
  return (
    <details>
      <summary className="cursor-pointer">Vincular vocabulario</summary>
      <label>
        Palabra o traducción
        <input
          className={field}
          maxLength={100}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              void find();
            }
          }}
        />
      </label>
      <Button type="button" variant="outline" onClick={() => void find()}>
        Buscar palabras
      </Button>
      <p role="status">{status}</p>
      {words.map((w) => {
        const media = kind === "audio" ? w.pronunciationMedia : w.imageMedia;
        return (
          <div key={w.id}>
            <Button
              className="m-1 whitespace-normal"
              type="button"
              variant="outline"
              key={w.id}
              onClick={() => onPick(w.id, w.termKaqchikel)}
            >
              {w.termKaqchikel} · {w.translationEs}
              {w.variant ? " · " + w.variant.name : ""}
            </Button>
            {onMedia && media && (
              <Button
                type="button"
                variant="outline"
                onClick={() => onMedia(w.id, w.termKaqchikel, media.id)}
              >
                Vincular y usar{" "}
                {kind === "audio" ? "su pronunciación" : "su imagen"}
              </Button>
            )}
          </div>
        );
      })}
    </details>
  );
}
export function ActivityEditor({ lessonId }: { lessonId: string }) {
  const path = "admin/lessons/" + lessonId + "/activities";
  const [list, setList] = useState<Summary[]>([]);
  const [draft, setDraft] = useState<Definition>();
  const [selected, setSelected] = useState<Document & { id: string }>();
  const [pending, setPending] = useState<Record<string, boolean>>({});
  const hasPending = draft?.questions.some((q) => pending[q.editorKey!]);
  const audio = draft?.type === "AUDIO_RECOGNITION";
  const kind = audio ? "audio" : "image";
  const mediaField = audio ? "audioMediaId" : "imageMediaId";
  function selectMedia(key: string, id: string) {
    setDraft(
      (current) =>
        current && {
          ...current,
          questions: current.questions.map((q) =>
            q.editorKey === key ? { ...q, [mediaField]: id } : q,
          ),
        },
    );
  }
  const creationKey = useRef("");
  const contentChanged =
    !selected || JSON.stringify(selected.definition) !== JSON.stringify(draft);
  const [position, setPosition] = useState(0);
  const [preview, setPreview] = useState("");
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState("");
  const lock = useRef(false);
  useEffect(() => {
    const c = new AbortController();
    api<Summary[]>(path, "GET", undefined, c.signal)
      .then((rows) => {
        if (!c.signal.aborted) setList(rows);
      })
      .catch((e) => {
        if (!c.signal.aborted) setNotice(message(e));
      });
    return () => c.abort();
  }, [path]);
  async function run(fn: () => Promise<void>) {
    if (lock.current) return;
    lock.current = true;
    setBusy(true);
    setNotice("");
    try {
      await fn();
    } catch (e) {
      setNotice(message(e));
    } finally {
      lock.current = false;
      setBusy(false);
    }
  }
  function change(i: number, q: Question) {
    if (draft)
      setDraft({
        ...draft,
        questions: draft.questions.map((prev, n) => (n === i ? q : prev)),
      });
  }
  function open(item: Summary) {
    void run(async () => {
      const doc = await api<Document>("admin/activities/" + item.id);
      doc.definition.questions = doc.definition.questions.map((q) => ({
        ...q,
        editorKey: crypto.randomUUID(),
      }));
      setDraft(doc.definition);
      setSelected({ ...doc, id: item.id });
      setPosition(doc.position);
      setPreview("");
    });
  }
  function save() {
    if (!draft || hasPending) return;
    const definition = {
      ...draft,
      questions: draft.questions.map(
        ({
          prompt,
          feedback,
          vocabularyId,
          options,
          imageMediaId,
          imageDescription,
          audioMediaId,
          audioTranscript,
        }) => ({
          imageMediaId,
          imageDescription,
          audioMediaId,
          audioTranscript,
          prompt,
          feedback,
          vocabularyId,
          options,
        }),
      ),
    };
    void run(async () => {
      if (selected)
        await api("admin/activities/" + selected.id, "PUT", {
          ...(contentChanged ? { definition } : {}),
          position,
          isVisible: selected.isVisible,
          revision: selected.revision,
        });
      else
        await api(path, "POST", {
          requestId: creationKey.current,
          definition,
          position,
        });
      setDraft(undefined);
      setSelected(undefined);
      setList(await api<Summary[]>(path));
      setNotice(
        contentChanged
          ? "Práctica guardada y oculta para revisión."
          : "Posición guardada.",
      );
    });
  }
  return (
    <section
      className="space-y-4 rounded-xl border bg-card p-4"
      aria-labelledby="activities"
    >
      <h2 id="activities" className="text-xl font-semibold">
        Actividades formativas
      </h2>
      <p role="status">{busy ? "Guardando o consultando…" : notice}</p>
      {!draft && (
        <>
          {(
            [
              "MULTIPLE_CHOICE",
              "IMAGE_RECOGNITION",
              "AUDIO_RECOGNITION",
            ] as const
          ).map((type) => (
            <Button
              key={type}
              disabled={busy}
              onClick={() => {
                setPending({});
                setSelected(undefined);
                setPreview("");
                setPosition((list.at(-1)?.position ?? -1) + 1);
                creationKey.current = crypto.randomUUID();
                setDraft({ ...blank(), type });
              }}
            >
              {type === "AUDIO_RECOGNITION"
                ? "Crear comprensión auditiva"
                : type === "IMAGE_RECOGNITION"
                  ? "Crear reconocimiento visual"
                  : "Crear selección múltiple"}
            </Button>
          ))}
          <Button
            variant="ghost"
            disabled={busy}
            onClick={() =>
              void run(async () => setList(await api<Summary[]>(path)))
            }
          >
            Recargar actividades
          </Button>
          {list.map((item) => (
            <article key={item.id} className="space-y-2 rounded-lg border p-3">
              <h3 className="break-words font-semibold">{item.title}</h3>
              <p>
                {item.isVisible ? "Visible" : "Oculta"} · Posición{" "}
                {item.position} · {item.total} preguntas
              </p>
              <div className="flex flex-wrap gap-2">
                <Button
                  variant="outline"
                  disabled={busy}
                  onClick={() => open(item)}
                >
                  Editar
                </Button>
                <Button
                  variant="outline"
                  disabled={busy}
                  onClick={() => setPreview(preview === item.id ? "" : item.id)}
                >
                  Vista previa
                </Button>
                <Button
                  variant="outline"
                  disabled={busy}
                  onClick={() =>
                    void run(async () => {
                      await api("admin/activities/" + item.id, "PUT", {
                        revision: item.revision,
                        position: item.position,
                        isVisible: !item.isVisible,
                      });
                      setList(await api<Summary[]>(path));
                    })
                  }
                >
                  {item.isVisible ? "Ocultar" : "Mostrar"}
                </Button>
              </div>
              {preview === item.id && <Practice id={item.id} preview />}
            </article>
          ))}
        </>
      )}
      {draft && (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            save();
          }}
        >
          <fieldset disabled={busy} className="space-y-4">
            <legend className="font-semibold">
              {selected ? "Editar práctica" : "Nueva práctica"}
            </legend>
            <label className="block">
              Título
              <input
                className={field}
                required
                maxLength={200}
                value={draft.title}
                onChange={(e) => setDraft({ ...draft, title: e.target.value })}
              />
            </label>
            <label className="block">
              Instrucciones
              <textarea
                className={field}
                maxLength={3000}
                value={draft.instructions}
                onChange={(e) =>
                  setDraft({ ...draft, instructions: e.target.value })
                }
              />
            </label>
            <label className="block">
              Posición en la lección
              <input
                className={field}
                required
                type="number"
                min={0}
                max={2147483647}
                value={position}
                onChange={(e) => setPosition(Number(e.target.value))}
              />
            </label>
            {draft.questions.map((q, i) => (
              <fieldset
                key={q.editorKey}
                className="min-w-0 space-y-3 rounded-lg border p-3"
              >
                <legend>Pregunta {i + 1}</legend>
                <label>
                  Enunciado
                  <textarea
                    required
                    className={field}
                    value={q.prompt}
                    maxLength={2000}
                    onChange={(e) =>
                      change(i, { ...q, prompt: e.target.value })
                    }
                  />
                </label>
                {q.vocabularyId && (
                  <p>
                    Término vinculado · {q.term}{" "}
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() =>
                        change(i, { ...q, vocabularyId: null, term: null })
                      }
                    >
                      Quitar vínculo
                    </Button>
                  </p>
                )}
                <WordPicker
                  kind={kind}
                  onMedia={
                    audio || draft.type === "IMAGE_RECOGNITION"
                      ? (vocabularyId, term, id) =>
                          change(i, {
                            ...q,
                            vocabularyId,
                            term,
                            [mediaField]: id,
                          })
                      : undefined
                  }
                  onPick={(vocabularyId, term) =>
                    change(i, { ...q, vocabularyId, term })
                  }
                />
                {(audio || draft.type === "IMAGE_RECOGNITION") && (
                  <>
                    <MediaUpload
                      activity
                      kind={kind}
                      mediaId={q[mediaField] ?? undefined}
                      disabled={busy}
                      onUploaded={(id) => selectMedia(q.editorKey!, id)}
                      onPending={(value) =>
                        setPending((prev) => ({
                          ...prev,
                          [q.editorKey!]: value,
                        }))
                      }
                    />
                    <MediaLibrary
                      kind={kind}
                      disabled={busy || !!pending[q.editorKey!]}
                      onSelect={(id) => selectMedia(q.editorKey!, id)}
                    />
                    <label className="block">
                      {audio
                        ? "Transcripción de la grabación"
                        : "Pista descriptiva accesible"}
                      <textarea
                        required
                        maxLength={audio ? 3000 : 500}
                        className={field}
                        value={
                          (audio ? q.audioTranscript : q.imageDescription) ?? ""
                        }
                        onChange={(e) =>
                          change(i, {
                            ...q,
                            [audio ? "audioTranscript" : "imageDescription"]:
                              e.target.value,
                          })
                        }
                      />
                      <span className="text-sm text-muted-foreground">
                        {audio
                          ? "Usa una grabación de hasta cinco minutos. El estudiante podrá leer la transcripción después de responder."
                          : "Describe rasgos que permitan elegir una opción sin nombrar la solución."}
                      </span>
                    </label>
                  </>
                )}
                {q.options.map((o, j) => (
                  <div
                    key={j}
                    className="grid items-end gap-2 sm:grid-cols-[1fr_auto_auto]"
                  >
                    <label>
                      Opción {j + 1}
                      <input
                        required
                        className={field}
                        value={o.label}
                        maxLength={500}
                        onChange={(e) =>
                          change(i, {
                            ...q,
                            options: q.options.map((v, n) =>
                              n === j ? { ...v, label: e.target.value } : v,
                            ),
                          })
                        }
                      />
                    </label>
                    <label className="p-2">
                      <input
                        type="radio"
                        name={"correct-" + i}
                        checked={o.correct}
                        onChange={() =>
                          change(i, {
                            ...q,
                            options: q.options.map((v, n) => ({
                              ...v,
                              correct: n === j,
                            })),
                          })
                        }
                      />{" "}
                      Correcta
                    </label>
                    <Button
                      type="button"
                      variant="ghost"
                      disabled={q.options.length <= 2}
                      onClick={() =>
                        change(i, {
                          ...q,
                          options: q.options.filter((_, n) => n !== j),
                        })
                      }
                    >
                      Quitar opción {j + 1}
                    </Button>
                    <div className="flex flex-wrap gap-2 sm:col-span-full">
                      {[-1, 1].map((delta) => (
                        <Button
                          key={delta}
                          type="button"
                          variant="outline"
                          disabled={!q.options[j + delta]}
                          onClick={() =>
                            change(i, {
                              ...q,
                              options: swap(q.options, j, j + delta),
                            })
                          }
                        >
                          {delta < 0 ? "Subir" : "Bajar"} opción {j + 1}
                        </Button>
                      ))}
                    </div>
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  disabled={q.options.length >= 10}
                  onClick={() =>
                    change(i, {
                      ...q,
                      options: [...q.options, { label: "", correct: false }],
                    })
                  }
                >
                  Agregar opción
                </Button>
                <label className="block">
                  Retroalimentación opcional
                  <textarea
                    className={field}
                    maxLength={2000}
                    value={q.feedback}
                    onChange={(e) =>
                      change(i, { ...q, feedback: e.target.value })
                    }
                  />
                </label>
                <div className="flex flex-wrap gap-2">
                  {[-1, 1].map((delta) => (
                    <Button
                      type="button"
                      key={delta}
                      variant="outline"
                      disabled={!draft.questions[i + delta]}
                      onClick={() =>
                        setDraft({
                          ...draft,
                          questions: swap(draft.questions, i, i + delta),
                        })
                      }
                    >
                      {delta < 0 ? "Subir" : "Bajar"} pregunta
                    </Button>
                  ))}
                  <Button
                    type="button"
                    variant="ghost"
                    disabled={draft.questions.length === 1}
                    onClick={() =>
                      setDraft({
                        ...draft,
                        questions: draft.questions.filter((_, n) => n !== i),
                      })
                    }
                  >
                    Quitar pregunta
                  </Button>
                </div>
              </fieldset>
            ))}
            <Button
              type="button"
              variant="outline"
              disabled={draft.questions.length >= 50}
              onClick={() =>
                setDraft({
                  ...draft,
                  questions: [...draft.questions, blankQuestion()],
                })
              }
            >
              Agregar pregunta
            </Button>
            <div className="flex flex-wrap gap-2">
              <Button disabled={hasPending}>
                {contentChanged ? "Guardar para revisión" : "Guardar posición"}
              </Button>
              <Button
                type="button"
                variant="ghost"
                onClick={() => {
                  if (window.confirm("¿Descartar la edición?"))
                    setDraft(undefined);
                }}
              >
                Cancelar
              </Button>
            </div>
          </fieldset>
        </form>
      )}
    </section>
  );
}
