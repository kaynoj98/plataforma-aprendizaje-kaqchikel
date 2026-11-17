"use client";
import { Button } from "@/components/ui/button";
type Segment = { key: string; label: string };

export function SegmentPicker({
  segments,
  order,
  onChange,
}: {
  segments: Segment[];
  order: string[];
  onChange: (order: string[]) => void;
}) {
  return (
    <div className="min-w-0 space-y-3">
      <fieldset className="min-w-0">
        <legend>Segmentos disponibles</legend>
        <div className="mt-2 flex flex-wrap gap-2">
          {segments.map((s) => (
            <Button
              type="button"
              variant="outline"
              key={s.key}
              className="h-auto max-w-full whitespace-pre-wrap break-all"
              disabled={order.includes(s.key)}
              onClick={() => onChange([...order, s.key])}
            >
              <span lang="cak">{s.label}</span>
            </Button>
          ))}
        </div>
      </fieldset>
      <fieldset className="min-w-0 rounded-lg border p-3">
        <legend>Tu orden</legend>
        <ol className="flex flex-wrap gap-2">
          {order.map((key, i) => {
            const s = segments.find((s) => s.key === key);
            return (
              <li className="max-w-full" key={key}>
                <Button
                  type="button"
                  variant="secondary"
                  className="h-auto max-w-full whitespace-pre-wrap break-all"
                  aria-label={`Quitar segmento ${i + 1}: ${s?.label}`}
                  onClick={() => onChange(order.filter((k) => k !== key))}
                >
                  <span lang="cak">{s?.label}</span> ×
                </Button>
              </li>
            );
          })}
        </ol>
        <p role="status" className="mt-2 text-sm">
          {order.length} de {segments.length} segmentos colocados
        </p>
      </fieldset>
      <Button
        type="button"
        variant="outline"
        disabled={!order.length}
        onClick={() => onChange([])}
      >
        Reiniciar orden
      </Button>
    </div>
  );
}
