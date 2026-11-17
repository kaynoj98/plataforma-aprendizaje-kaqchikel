import { describe, expect, it } from "vitest";
import {
  correctOrder,
  decodeOrder,
  matchesSentence,
  segmentKey,
  shuffledSegments,
} from "../src/modules/activities/ordering.js";

describe("Segmentos de ordenamiento", () => {
  const labels = ["ä ë ï ö ü", "tz’ ch’ k’ q’ b’ t’", "ä ë ï ö ü", "."];
  const segments = labels.map((label, i) => ({ id: String(i), label }));
  it("conserva puntuación, unidades compuestas y signos glotales", () => {
    const sentence = labels.slice(0, 3).join(" ") + ".";
    expect(matchesSentence(sentence.normalize("NFD"), labels)).toBe(true);
    for (const changed of [
      sentence.replace("ä", "a"),
      sentence.replace("’", "'"),
      sentence.slice(0, -1),
    ])
      expect(matchesSentence(changed, labels)).toBe(false);
  });
  it("permite intercambiar dos fichas de escritura idéntica", () => {
    expect(correctOrder(segments, [], [2, 1, 0, 3])).toBe(true);
    expect(correctOrder(segments, [], [2, 1, 3, 0])).toBe(false);
  });
  it("mantiene las claves y la mezcla dentro de cada intento", () => {
    const palette = shuffledSegments(segments, "intento A");
    expect(shuffledSegments([...segments].reverse(), "intento A")).toEqual(
      palette,
    );
    const keys = segments.map((s) => segmentKey("intento A", s.id));
    expect(decodeOrder(segments, "intento A", keys)).toEqual([0, 1, 2, 3]);
    expect(() => decodeOrder(segments, "intento B", keys)).toThrow();
    expect(() =>
      decodeOrder(segments, "intento A", [
        keys[0]!,
        keys[1]!,
        keys[0]!,
        keys[3]!,
      ]),
    ).toThrow();
  });
});
