"use client";
import { useEffect, useRef, useState } from "react";
import { CheckCircle2, CircleX, ListChecks } from "lucide-react";
import { Button } from "@/components/ui/button";
import { api, message, type Summary } from "./api";

type State = {
  attemptId: string | null;
  versionId: string;
  title: string;
  instructions: string;
  total: number;
  answered: number;
  question: {
    id: string;
    prompt: string;
    term: string | null;
    options: { id: string; label: string }[];
  } | null;
  result: {
    total: number;
    correct: number;
    incorrect: number;
    percentage: number;
  } | null;
};
type Choice = { questionId: string; optionId: string };
type Reply = {
  state: State;
  feedback: { correct: boolean; feedback: string } | null;
};
export function Practice({
  id,
  preview = false,
}: {
  id: string;
  preview?: boolean;
}) {
  const [state, setState] = useState<State>();
  const [reply, setReply] = useState<Reply>();
  const [selected, select] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const lock = useRef(false);
  const request = useRef("");
  const history = useRef<Choice[]>([]);
  const heading = useRef<HTMLHeadingElement>(null);
  useEffect(() => {
    if (state) heading.current?.focus();
  }, [state]);
  async function action(fn: () => Promise<void>) {
    if (lock.current) return;
    lock.current = true;
    setBusy(true);
    setError("");
    try {
      await fn();
    } catch (e) {
      setError(message(e));
    } finally {
      lock.current = false;
      setBusy(false);
    }
  }
  function begin() {
    void action(async () => {
      request.current ||= crypto.randomUUID();
      const next = preview
        ? (
            await api<Reply>("admin/activities/" + id + "/preview", "POST", {
              choices: [],
            })
          ).state
        : await api<State>("activities/" + id + "/attempts", "POST", {
            requestId: request.current,
          });
      request.current = "";
      history.current = [];
      setState(next);
      setReply(undefined);
      select("");
    });
  }
  function submit() {
    if (!state?.question || !selected || reply) return;
    const choice = { questionId: state.question.id, optionId: selected };
    void action(async () => {
      const choices = [...history.current, choice];
      const next = preview
        ? await api<Reply>("admin/activities/" + id + "/preview", "POST", {
            versionId: state.versionId,
            choices,
          })
        : await api<Reply>(
            "activity-attempts/" + state.attemptId + "/answers",
            "POST",
            choice,
          );
      if (preview) history.current = choices;
      setReply(next);
    });
  }
  return (
    <div className="space-y-3">
      {preview && (
        <p className="text-sm text-muted-foreground">
          Vista previa administrativa · Sin registro de intentos
        </p>
      )}
      {error && <p role="alert">{error}</p>}
      {!state ? (
        <Button type="button" disabled={busy} onClick={begin}>
          <ListChecks />
          Abrir práctica
        </Button>
      ) : (
        <div className="space-y-4 rounded-xl border bg-card p-4 sm:p-6">
          <h3 ref={heading} tabIndex={-1} className="text-xl font-semibold">
            {state.result ? "Resultado de la práctica" : state.title}
          </h3>
          {state.result ? (
            <>
              <p className="text-3xl font-semibold">
                {state.result.percentage}%
              </p>
              <p>
                {state.result.total} preguntas · {state.result.correct}{" "}
                correctas · {state.result.incorrect} incorrectas
              </p>
              <Button disabled={busy} onClick={begin}>
                Repetir práctica
              </Button>
            </>
          ) : (
            state.question && (
              <>
                <p className="whitespace-pre-wrap">{state.instructions}</p>
                <p>
                  Pregunta {state.answered + 1} de {state.total}
                </p>
                <progress
                  className="w-full accent-primary"
                  aria-label="Preguntas respondidas"
                  max={state.total}
                  value={reply?.state.answered ?? state.answered}
                />
                <fieldset
                  disabled={busy || Boolean(reply)}
                  className="space-y-2"
                >
                  <legend className="mb-3 whitespace-pre-wrap font-semibold">
                    {state.question.prompt}
                  </legend>
                  {state.question.term && (
                    <p lang="cak">{state.question.term}</p>
                  )}
                  {state.question.options.map((o) => (
                    <label
                      key={o.id}
                      className="flex cursor-pointer items-start gap-3 rounded-lg border p-3 has-checked:border-primary has-checked:bg-muted"
                    >
                      <input
                        type="radio"
                        name={"choice-" + id}
                        checked={selected === o.id}
                        onChange={() => select(o.id)}
                        className="mt-1"
                      />
                      <span className="min-w-0 break-words">{o.label}</span>
                    </label>
                  ))}
                </fieldset>
                {reply ? (
                  <>
                    <div
                      role="status"
                      className="space-y-1 rounded-lg bg-muted p-3"
                    >
                      <p className="flex items-center gap-2 font-medium">
                        {reply.feedback?.correct ? (
                          <>
                            <CheckCircle2 />
                            Respuesta correcta
                          </>
                        ) : (
                          <>
                            <CircleX />
                            Respuesta incorrecta
                          </>
                        )}
                      </p>
                      {reply.feedback?.feedback && (
                        <p className="whitespace-pre-wrap">
                          {reply.feedback.feedback}
                        </p>
                      )}
                    </div>
                    <Button
                      onClick={() => {
                        setState(reply.state);
                        setReply(undefined);
                        select("");
                      }}
                    >
                      {reply.state.result
                        ? "Ver resultado"
                        : "Siguiente pregunta"}
                    </Button>
                  </>
                ) : (
                  <Button disabled={!selected || busy} onClick={submit}>
                    Comprobar respuesta
                  </Button>
                )}
              </>
            )
          )}
        </div>
      )}
    </div>
  );
}

export function LessonPractices({
  lessonId,
  preview,
}: {
  lessonId: string;
  preview: boolean;
}) {
  const [items, setItems] = useState<Summary[]>([]);
  const [error, setError] = useState("");
  const [retry, setRetry] = useState(0);
  useEffect(() => {
    const ctl = new AbortController();
    api<Summary[]>(
      (preview ? "admin/" : "") + "lessons/" + lessonId + "/activities",
      "GET",
      undefined,
      ctl.signal,
    )
      .then((rows) => {
        if (!ctl.signal.aborted) {
          setItems(rows.filter((r) => r.isVisible));
          setError("");
        }
      })
      .catch((e) => {
        if (!ctl.signal.aborted) setError(message(e));
      });
    return () => ctl.abort();
  }, [lessonId, preview, retry]);
  if (error)
    return (
      <div role="alert">
        {error}{" "}
        <Button variant="outline" onClick={() => setRetry((n) => n + 1)}>
          Reintentar
        </Button>
      </div>
    );
  if (!items.length) return null;
  return (
    <section className="space-y-3">
      <h2 className="text-xl font-semibold">Actividades de práctica</h2>
      {items.map((item) => (
        <article
          key={item.id}
          className="space-y-2 break-words rounded-xl border bg-card p-4"
        >
          <h3 className="font-semibold">{item.title}</h3>
          <p>{item.total} preguntas</p>
          <Practice id={item.id} preview={preview} />
        </article>
      ))}
    </section>
  );
}
