"use client";
import { Button } from "@/components/ui/button";
import { SegmentPicker } from "./segment-picker";
import type { Question } from "./api";

export function OrderingEditor({
  q,
  change,
}: {
  q: Question;
  change: (q: Question) => void;
}) {
  const alternatives = q.alternativeOrders ?? [];
  const segments = q.options.map((o, i) => ({
    key: String(i),
    label: o.label || "Segmento " + (i + 1),
  }));
  function resize(options: Question["options"]) {
    change({ ...q, options, alternativeOrders: alternatives.map(() => []) });
  }
  function move(i: number, j: number) {
    const options = [...q.options];
    [options[i], options[j]] = [options[j], options[i]];
    change({
      ...q,
      options,
      alternativeOrders: alternatives.map((a) =>
        a.map((k) => (k === i ? j : k === j ? i : k)),
      ),
    });
  }
  const field = "block w-full rounded-lg border bg-background p-2";
  return (
    <div className="space-y-4">
      <label className="block">
        Oración principal en Kaqchikel
        <textarea
          lang="cak"
          className={field}
          required
          maxLength={3000}
          value={q.sentenceText ?? ""}
          onChange={(e) => change({ ...q, sentenceText: e.target.value })}
        />
      </label>
      <fieldset className="space-y-2">
        <legend>Segmentos en orden principal</legend>
        <p className="text-sm">
          Incluye la puntuación. Puedes mantener varias palabras en un segmento.
        </p>
        {q.options.map((o, i) => (
          <div key={i} className="space-y-1">
            <label>
              Segmento {i + 1}
              <input
                className={field}
                lang="cak"
                required
                maxLength={500}
                value={o.label}
                onChange={(e) =>
                  change({
                    ...q,
                    options: q.options.map((v, n) =>
                      n === i ? { ...v, label: e.target.value } : v,
                    ),
                  })
                }
              />
            </label>
            <div className="flex flex-wrap gap-2">
              {[-1, 1].map((d) => (
                <Button
                  key={d}
                  type="button"
                  variant="outline"
                  disabled={!q.options[i + d]}
                  onClick={() => move(i, i + d)}
                >
                  {d < 0 ? "Subir" : "Bajar"} segmento {i + 1}
                </Button>
              ))}
              <Button
                type="button"
                variant="ghost"
                disabled={q.options.length <= 2}
                onClick={() => resize(q.options.filter((_, n) => n !== i))}
              >
                Quitar segmento {i + 1}
              </Button>
            </div>
          </div>
        ))}
        <Button
          type="button"
          variant="outline"
          disabled={q.options.length >= 32}
          onClick={() => resize([...q.options, { label: "", correct: false }])}
        >
          Agregar segmento
        </Button>
      </fieldset>
      {alternatives.length > 0 && (
        <p className="text-sm">
          Si agregas o quitas segmentos, vuelve a construir cada alternativa
          antes de guardar.
        </p>
      )}
      {alternatives.map((order, i) => (
        <fieldset className="min-w-0 space-y-2 rounded-lg border p-3" key={i}>
          <legend>Orden alternativo autorizado {i + 1}</legend>
          <SegmentPicker
            segments={segments}
            order={order.map(String)}
            onChange={(keys) =>
              change({
                ...q,
                alternativeOrders: alternatives.map((a, n) =>
                  n === i ? keys.map(Number) : a,
                ),
              })
            }
          />
          <Button
            type="button"
            variant="ghost"
            onClick={() =>
              change({
                ...q,
                alternativeOrders: alternatives.filter((_, n) => n !== i),
              })
            }
          >
            Quitar alternativa {i + 1}
          </Button>
        </fieldset>
      ))}
      <Button
        type="button"
        variant="outline"
        disabled={alternatives.length >= 16}
        onClick={() =>
          change({ ...q, alternativeOrders: [...alternatives, []] })
        }
      >
        Agregar orden alternativo
      </Button>
    </div>
  );
}
