"use client";
import { useEffect, useRef, useState } from "react";
import { CheckCircle2, CircleX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { api, message } from "./api";

type Card = {
  key: string;
  label: string;
  done: boolean;
  variant?: string | null;
};
type Board = {
  resumeKey?: string;
  attemptId: string | null;
  versionId: string;
  title: string;
  instructions: string;
  terms: Card[];
  translations: Card[];
  total: number;
  completed: number;
  firstCorrect: number;
  incorrect: number;
  finished: boolean;
  percentage: number;
};
type Choice = { termKey: string; translationKey: string };
type Reply = {
  state: Board;
  feedback: { correct: boolean; message: string } | null;
};

export function MatchingPractice({
  id,
  preview = false,
}: {
  id: string;
  preview?: boolean;
}) {
  const [state, setState] = useState<Board>();
  const [selected, select] = useState("");
  const [busy, setBusy] = useState(false),
    [error, setError] = useState(""),
    [notice, setNotice] = useState<{ correct: boolean; text: string }>();
  const [pending, setPending] = useState<
    (Choice & { requestId: string }) | null
  >(null);
  const lock = useRef(false),
    seed = useRef(""),
    beginKey = useRef(""),
    history = useRef<Choice[]>([]);
  const termList = useRef<HTMLFieldSetElement>(null),
    translationList = useRef<HTMLFieldSetElement>(null),
    resultHeading = useRef<HTMLHeadingElement>(null);
  useEffect(() => {
    if (!state || busy || error) return;
    if (state.finished) resultHeading.current?.focus();
    else
      (selected ? translationList : termList).current
        ?.querySelector<HTMLButtonElement>("button:not(:disabled)")
        ?.focus();
  }, [state, busy, error, selected]);
  async function run(action: () => Promise<void>) {
    if (lock.current) return;
    lock.current = true;
    setBusy(true);
    setError("");
    try {
      await action();
    } catch (e) {
      setError(message(e));
    } finally {
      lock.current = false;
      setBusy(false);
    }
  }
  function open(repeat = false) {
    void run(async () => {
      const storageKey = "matching-attempt-" + id;
      if (!preview && !repeat && !beginKey.current) {
        try {
          beginKey.current = sessionStorage.getItem(storageKey) ?? "";
        } catch {
          /* Express permite reanudar aunque el navegador bloquee el almacenamiento. */
        }
      }
      beginKey.current ||= crypto.randomUUID();
      const next = preview
        ? (
            await api<Reply>(
              "admin/activities/" + id + "/matching-preview",
              "POST",
              { seed: beginKey.current, choices: [] },
            )
          ).state
        : await api<Board>("activities/" + id + "/attempts", "POST", {
            requestId: beginKey.current,
          });
      if (!preview && next.resumeKey) {
        try {
          sessionStorage.setItem(storageKey, next.resumeKey);
        } catch {
          /* El intento abierto se recupera en Express. */
        }
      }
      seed.current = beginKey.current;
      beginKey.current = "";
      history.current = [];
      setState(next);
      select("");
      setPending(null);
      setNotice(undefined);
    });
  }
  function submit(choice: Choice & { requestId: string }) {
    if (!state) return;
    void run(async () => {
      setPending(choice);
      const choices = [
        ...history.current,
        { termKey: choice.termKey, translationKey: choice.translationKey },
      ];
      const reply = preview
        ? await api<Reply>(
            "admin/activities/" + id + "/matching-preview",
            "POST",
            { seed: seed.current, versionId: state.versionId, choices },
          )
        : await api<Reply>(
            "activity-attempts/" + state.attemptId + "/matches",
            "POST",
            choice,
          );
      if (preview) history.current = choices;
      setState(reply.state);
      setPending(null);
      select("");
      setNotice({
        correct: !!reply.feedback?.correct,
        text: reply.feedback?.correct
          ? "Pareja correcta. " + reply.feedback.message
          : "La traducción no corresponde. Intentos incorrectos: " +
            reply.state.incorrect +
            ". Puedes intentarlo de nuevo.",
      });
    });
  }
  return (
    <section className="space-y-3 rounded-xl border bg-card p-4">
      {preview && (
        <p className="text-sm text-muted-foreground">
          Vista previa administrativa · Sin registro de intentos
        </p>
      )}
      {error && <p role="alert">{error}</p>}
      {!state ? (
        <Button type="button" disabled={busy} onClick={() => open()}>
          Abrir práctica
        </Button>
      ) : (
        <>
          <h3 className="font-semibold">{state.title}</h3>
          {state.instructions && (
            <p className="whitespace-pre-wrap">{state.instructions}</p>
          )}
          <p>
            {state.completed} de {state.total} parejas completadas
          </p>
          <progress
            className="w-full accent-primary"
            value={state.completed}
            max={state.total}
            aria-label="Parejas completadas"
          />
          <p role="status" aria-live="polite">
            {notice && (
              <span className="flex items-center gap-2">
                {notice.correct ? (
                  <CheckCircle2
                    aria-hidden="true"
                    className="size-5 shrink-0"
                  />
                ) : (
                  <CircleX aria-hidden="true" className="size-5 shrink-0" />
                )}
                {notice.text}
              </span>
            )}
          </p>
          {state.finished ? (
            <div className="space-y-2">
              <h4 ref={resultHeading} tabIndex={-1} className="font-semibold">
                Resultados
              </h4>
              <p>
                {state.firstCorrect} de {state.total} al primer intento ·{" "}
                {state.percentage}%
              </p>
              <p>Emparejamientos incorrectos: {state.incorrect}</p>
              <Button type="button" disabled={busy} onClick={() => open(true)}>
                Repetir práctica
              </Button>
            </div>
          ) : (
            <>
              <p>
                Selecciona un término en Kaqchikel y luego su traducción al
                español.
              </p>
              <div className="grid grid-cols-2 items-start gap-2 sm:gap-4">
                {(["terms", "translations"] as const).map((side) => (
                  <fieldset
                    key={side}
                    ref={side === "terms" ? termList : translationList}
                    disabled={busy || !!pending}
                    className="min-w-0 space-y-2"
                  >
                    <legend className="mb-2 font-semibold">
                      {side === "terms" ? "Kaqchikel" : "Español"}
                    </legend>
                    {state[side].map((card) => (
                      <button
                        key={card.key}
                        type="button"
                        className="block min-h-12 w-full rounded-lg border p-2 text-left transition-colors focus-visible:outline-2 aria-pressed:border-primary aria-pressed:bg-muted disabled:text-muted-foreground motion-reduce:transition-none"
                        aria-pressed={
                          side === "terms" ? selected === card.key : undefined
                        }
                        disabled={
                          card.done || (side === "translations" && !selected)
                        }
                        onClick={() =>
                          side === "terms"
                            ? select(card.key)
                            : submit({
                                termKey: selected,
                                translationKey: card.key,
                                requestId: crypto.randomUUID(),
                              })
                        }
                      >
                        <span
                          lang={side === "terms" ? "cak" : "es"}
                          className="break-words"
                        >
                          {card.label}
                        </span>
                        {card.variant && (
                          <small className="block">{card.variant}</small>
                        )}
                        {card.done && (
                          <small className="block">✓ Completada</small>
                        )}
                        {selected === card.key && (
                          <small className="block">Seleccionado</small>
                        )}
                      </button>
                    ))}
                  </fieldset>
                ))}
              </div>
              {error && (
                <div className="flex flex-wrap gap-2">
                  {pending && (
                    <Button
                      type="button"
                      disabled={busy}
                      onClick={() => submit(pending)}
                    >
                      Reintentar envío
                    </Button>
                  )}
                  <Button
                    type="button"
                    variant="outline"
                    disabled={busy}
                    onClick={() => open()}
                  >
                    {preview ? "Reiniciar vista previa" : "Reabrir tablero"}
                  </Button>
                </div>
              )}
            </>
          )}
        </>
      )}
    </section>
  );
}
