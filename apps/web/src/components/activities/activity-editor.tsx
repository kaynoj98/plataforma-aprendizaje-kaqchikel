"use client";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  api,
  message,
  type Definition,
  type Question,
  type Pair,
  type Summary,
  type Document,
} from "./api";
import { MediaLibrary } from "@/components/academics/media-library";
import { MediaUpload } from "@/components/vocabulary/media-upload";
import { MatchingPractice } from "./matching-practice";
import { Practice } from "./practice";

const field = "mt-1 block w-full min-w-0 rounded-lg border bg-background p-2";
const blankPair = (): Pair => ({
  editorKey: crypto.randomUUID(),
  term: "",
  translation: "",
  vocabularyId: null,
  feedback: "",
});
const blankQuestion = (writing = false): Question => ({
  editorKey: crypto.randomUUID(),
  prompt: "",
  feedback: "",
  vocabularyId: null,
  options: writing
    ? [{ label: "", correct: true }]
    : [
        { label: "", correct: true },
        { label: "", correct: false },
      ],
});
const blank = (writing = false): Definition => ({
  title: "",
  instructions: "",
  questions: [blankQuestion(writing)],
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
  kind?: "audio" | "image";
  onMedia?: (id: string, term: string, mediaId: string) => void;
  onPick: (
    id: string,
    term: string,
    translation: string,
    variant: string | null,
  ) => void;
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
              onClick={() =>
                onPick(
                  w.id,
                  w.termKaqchikel,
                  w.translationEs,
                  w.variant?.name ?? null,
                )
              }
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
function PairEditor({
  pairs,
  onChange,
}: {
  pairs: Pair[];
  onChange: (pairs: Pair[]) => void;
}) {
  function update(i: number, props: Partial<Pair>) {
    onChange(pairs.map((p, n) => (i === n ? { ...p, ...props } : p)));
  }
  return (
    <div className="space-y-4">
      {pairs.map((p, i) => (
        <fieldset className="space-y-2 rounded-lg border p-3" key={p.editorKey}>
          <legend>Pareja {i + 1}</legend>
          <WordPicker
            onPick={(vocabularyId, term, translation, variant) =>
              update(i, { vocabularyId, term, translation, variant })
            }
          />
          {p.vocabularyId && (
            <div>
              Vocabulario vinculado{p.variant ? " · " + p.variant : ""}{" "}
              <Button
                type="button"
                variant="ghost"
                onClick={() => update(i, { vocabularyId: null, variant: null })}
              >
                Quitar vínculo
              </Button>
            </div>
          )}
          <label className="block">
            Término en Kaqchikel
            <input
              className={field}
              required
              maxLength={200}
              lang="cak"
              value={p.term}
              onChange={(e) => update(i, { term: e.target.value })}
            />
          </label>
          <label className="block">
            Traducción al español
            <input
              className={field}
              required
              maxLength={255}
              value={p.translation}
              onChange={(e) => update(i, { translation: e.target.value })}
            />
          </label>
          <label className="block">
            Retroalimentación al completar la pareja
            <textarea
              className={field}
              maxLength={2000}
              value={p.feedback}
              onChange={(e) => update(i, { feedback: e.target.value })}
            />
          </label>
          <div className="flex flex-wrap gap-2">
            {[-1, 1].map((d) => (
              <Button
                type="button"
                variant="outline"
                key={d}
                disabled={!pairs[i + d]}
                onClick={() => onChange(swap(pairs, i, i + d))}
              >
                {d < 0 ? "Subir" : "Bajar"} pareja {i + 1}
              </Button>
            ))}
            <Button
              type="button"
              variant="ghost"
              disabled={pairs.length <= 3}
              onClick={() => onChange(pairs.filter((_, n) => n !== i))}
            >
              Quitar pareja {i + 1}
            </Button>
          </div>
        </fieldset>
      ))}
      <Button
        type="button"
        variant="outline"
        disabled={pairs.length >= 8}
        onClick={() => onChange([...pairs, blankPair()])}
      >
        Agregar pareja
      </Button>
    </div>
  );
}
export function ActivityEditor({ lessonId }: { lessonId: string }) {
  const path = "admin/lessons/" + lessonId + "/activities";
  const [list, setList] = useState<Summary[]>([]);
  const [draft, setDraft] = useState<Definition>();
  const [selected, setSelected] = useState<Document & { id: string }>();
  const [pending, setPending] = useState<Record<string, boolean>>({});
  const hasPending = draft?.questions.some((q) => pending[q.editorKey!]);
  const writing = draft?.type === "WRITING";
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
      if (doc.definition.pairs)
        doc.definition.pairs = doc.definition.pairs.map((p) => ({
          ...p,
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
      pairs: draft.pairs?.map(
        ({ term, translation, vocabularyId, feedback }) => ({
          term,
          translation,
          vocabularyId,
          feedback,
        }),
      ),
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
              "MATCHING",
              "WRITING",
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
                setDraft(
                  type === "MATCHING"
                    ? {
                        title: "",
                        instructions: "",
                        questions: [],
                        pairs: Array.from({ length: 3 }, blankPair),
                        type,
                      }
                    : { ...blank(type === "WRITING"), type },
                );
              }}
            >
              {type === "WRITING"
                ? "Crear práctica de escritura"
                : type === "MATCHING"
                  ? "Crear relación de palabras"
                  : type === "AUDIO_RECOGNITION"
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
                {item.position} · {item.total}{" "}
                {item.type === "MATCHING" ? "parejas" : "preguntas"}
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
              {preview === item.id &&
                (item.type === "MATCHING" ? (
                  <MatchingPractice id={item.id} preview />
                ) : (
                  <Practice id={item.id} preview />
                ))}
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
            {draft.type === "MATCHING" && (
              <PairEditor
                pairs={draft.pairs ?? []}
                onChange={(pairs) => setDraft({ ...draft, pairs })}
              />
            )}
            {draft.questions.map((q, i) => (
              <fieldset
                key={q.editorKey}
                className="min-w-0 space-y-3 rounded-lg border p-3"
              >
                <legend>Pregunta {i + 1}</legend>
                <label>
                  {writing ? "Indicación en español" : "Enunciado"}
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
                    Término vinculado · {q.term}
                    {writing && q.variantSnapshot
                      ? " · " + q.variantSnapshot
                      : ""}{" "}
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() =>
                        change(i, {
                          ...q,
                          vocabularyId: null,
                          term: null,
                          variantSnapshot: null,
                        })
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
                  onPick={(vocabularyId, term, translation, variantSnapshot) =>
                    change(i, {
                      ...q,
                      vocabularyId,
                      term,
                      ...(writing
                        ? {
                            variantSnapshot,
                            prompt: q.prompt || translation,
                            options: [
                              { label: term, correct: true },
                              ...q.options.slice(1),
                            ],
                          }
                        : {}),
                    })
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
                      {writing
                        ? j === 0
                          ? "Respuesta principal en Kaqchikel"
                          : "Alternativa autorizada " + j
                        : "Opción " + (j + 1)}
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
                    {!writing && (
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
                    )}
                    <Button
                      type="button"
                      variant="ghost"
                      disabled={writing ? j === 0 : q.options.length <= 2}
                      onClick={() =>
                        change(i, {
                          ...q,
                          options: q.options.filter((_, n) => n !== j),
                        })
                      }
                    >
                      {writing
                        ? "Quitar alternativa"
                        : "Quitar opción " + (j + 1)}
                    </Button>
                    {!writing && (
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
                    )}
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  disabled={q.options.length >= 10}
                  onClick={() =>
                    change(i, {
                      ...q,
                      options: [...q.options, { label: "", correct: writing }],
                    })
                  }
                >
                  {writing
                    ? "Agregar alternativa autorizada"
                    : "Agregar opción"}
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
            {draft.type !== "MATCHING" && (
              <Button
                type="button"
                variant="outline"
                disabled={draft.questions.length >= 50}
                onClick={() =>
                  setDraft({
                    ...draft,
                    questions: [...draft.questions, blankQuestion(writing)],
                  })
                }
              >
                Agregar pregunta
              </Button>
            )}
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
