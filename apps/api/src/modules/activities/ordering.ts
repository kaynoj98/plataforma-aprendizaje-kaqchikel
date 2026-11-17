import { createHash } from "node:crypto";
import { AppError } from "../../errors/app-error.js";

export type OrderedChoice = {
  questionId: string;
  requestId: string;
  segmentKeys: string[];
};
type Segment = { id: string; label: string };
export const isPermutation = (order: number[], length: number) =>
  order.length === length &&
  new Set(order).size === length &&
  order.every((i) => Number.isInteger(i) && i >= 0 && i < length);

export function matchesSentence(sentence: string, labels: string[]) {
  let rest = sentence.normalize("NFC").trim();
  for (const raw of labels) {
    const label = raw.normalize("NFC");
    if (!rest.startsWith(label)) return false;
    rest = rest.slice(label.length).trimStart();
  }
  return !rest;
}
export function segmentKey(seed: string, segmentId: string) {
  return createHash("sha256")
    .update("ordering/" + seed + "/" + segmentId)
    .digest("hex");
}
export function shuffledSegments(segments: Segment[], seed: string) {
  return segments
    .map((s) => ({ key: segmentKey(seed, s.id), label: s.label }))
    .sort((a, b) => a.key.localeCompare(b.key));
}
export function decodeOrder(segments: Segment[], seed: string, keys: string[]) {
  const lookup = new Map(segments.map((s, i) => [segmentKey(seed, s.id), i]));
  const order = keys.map((k) => lookup.get(k) ?? -1);
  if (!isPermutation(order, segments.length))
    throw new AppError(
      400,
      "INVALID_SEGMENTS",
      "Utiliza todos los segmentos de esta pregunta exactamente una vez.",
    );
  return order;
}
export function correctOrder(
  segments: Segment[],
  alternatives: unknown,
  order: number[],
) {
  const matches = (candidate: number[]) =>
    candidate.every(
      (n, i) =>
        segments[n]!.label.normalize("NFC") ===
        segments[order[i]!]!.label.normalize("NFC"),
    );
  return (
    matches(segments.map((_, i) => i)) ||
    (Array.isArray(alternatives) &&
      alternatives.some(
        (a) =>
          Array.isArray(a) && isPermutation(a, segments.length) && matches(a),
      ))
  );
}
