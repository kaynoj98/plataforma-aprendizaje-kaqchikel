"use client";
import { useRef } from "react";
import { Button } from "@/components/ui/button";

export function WritingInput({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  const input = useRef<HTMLInputElement>(null);
  function insert(letter: string) {
    const el = input.current;
    if (!el) return;
    const start = el.selectionStart ?? value.length,
      end = el.selectionEnd ?? start;
    const next = value.slice(0, start) + letter + value.slice(end);
    el.focus();
    if (next.length > 500) return;
    onChange(next);
    requestAnimationFrame(() =>
      el.setSelectionRange(start + letter.length, start + letter.length),
    );
  }
  return (
    <div className="space-y-2">
      <label className="block">
        Tu respuesta en Kaqchikel
        <input
          ref={input}
          lang="cak"
          type="text"
          maxLength={500}
          spellCheck={false}
          autoCorrect="off"
          autoComplete="off"
          autoCapitalize="none"
          className="mt-1 block w-full rounded-lg border bg-background p-2"
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
      </label>
      <div
        role="group"
        aria-label="Insertar caracteres en la respuesta"
        className="flex flex-wrap gap-2"
      >
        {["ä", "ë", "ï", "ö", "ü", "’"].map((c) => (
          <Button
            key={c}
            type="button"
            variant="outline"
            aria-label={"Insertar " + (c === "’" ? "apóstrofo tipográfico" : c)}
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => insert(c)}
          >
            {c}
          </Button>
        ))}
      </div>
      <p className="text-sm text-muted-foreground">
        Respeta las mayúsculas, los espacios internos, las diéresis y el tipo de
        apóstrofo.
      </p>
    </div>
  );
}
