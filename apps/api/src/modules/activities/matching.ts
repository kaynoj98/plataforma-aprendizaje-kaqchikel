import { createHash } from "node:crypto";
import { AppError } from "../../errors/app-error.js";
import type { Prisma } from "../../generated/prisma/client.js";

type Pair = {
  id: string;
  term: string;
  translation: string;
  feedback: string;
  variant: string | null;
};
type Version = {
  id: string;
  title: string;
  instructions: string;
  pairs: Pair[];
};
type Choice = { termKey: string; translationKey: string };
type Count = { termId: string; correct: boolean; _count: number };

function cards(version: Version, seed: string) {
  // El UUID privado de la pareja nunca se envía. Cada lado y cada intento usan un espacio distinto.
  const key = (side: string, id: string) =>
    createHash("sha256").update([seed, side, id].join("/")).digest("hex");
  return version.pairs.map((p) => ({
    ...p,
    termKey: key("term", p.id),
    translationKey: key("translation", p.id),
  }));
}
function resolveChoice(version: Version, seed: string, choice: Choice) {
  const items = cards(version, seed);
  const term = items.find((p) => p.termKey === choice.termKey),
    translation = items.find((p) => p.translationKey === choice.translationKey);
  if (!term || !translation)
    throw new AppError(
      400,
      "INVALID_MATCH",
      "La selección no pertenece a este tablero.",
    );
  return { term, translation, correct: term.id === translation.id };
}
function checkOpen(counts: Count[], termId: string, translationId: string) {
  if (
    counts.some(
      (c) => c.correct && (c.termId === termId || c.termId === translationId),
    )
  )
    throw new AppError(
      409,
      "PAIR_COMPLETED",
      "Esta pareja ya está completada. Vuelve a abrir el tablero.",
    );
}
function board(
  version: Version,
  seed: string,
  counts: Count[],
  attemptId: string | null,
) {
  const done = new Set(counts.filter((c) => c.correct).map((c) => c.termId));
  const errors = counts.filter((c) => !c.correct);
  const first = [...done].filter(
    (id) => !errors.some((e) => e.termId === id),
  ).length;
  const items = cards(version, seed),
    total = items.length;
  const terms = items.map((p) => ({
    key: p.termKey,
    label: p.term,
    variant: p.variant,
    done: done.has(p.id),
  }));
  // Orden pseudoaleatorio independiente del orden editorial, reproducible al reabrir el intento.
  const translations = items
    .map((p) => ({
      key: p.translationKey,
      label: p.translation,
      done: done.has(p.id),
    }))
    .sort((a, b) => a.key.localeCompare(b.key));
  return {
    attemptId,
    versionId: version.id,
    title: version.title,
    instructions: version.instructions,
    terms,
    translations,
    total,
    completed: done.size,
    firstCorrect: first,
    incorrect: errors.reduce((sum, e) => sum + e._count, 0),
    finished: done.size === total,
    percentage: Math.round((100 * first) / total),
  };
}
function countsFor(
  tx: Prisma.TransactionClient,
  attemptId: string,
  sequence?: number,
) {
  return tx.activityMatchingSubmission.groupBy({
    by: ["termId", "correct"],
    where: {
      attemptId,
      ...(sequence === undefined ? {} : { sequence: { lte: sequence } }),
    },
    _count: true,
  });
}
export async function resumeBoard(
  tx: Prisma.TransactionClient,
  version: Version,
  attemptId: string,
) {
  return board(version, attemptId, await countsFor(tx, attemptId), attemptId);
}
export async function recordMatch(
  tx: Prisma.TransactionClient,
  version: Version,
  attemptId: string,
  choice: Choice & { requestId: string },
) {
  const { term, translation, correct } = resolveChoice(
    version,
    attemptId,
    choice,
  );
  const replay = await tx.activityMatchingSubmission.findUnique({
    where: { attemptId_requestId: { attemptId, requestId: choice.requestId } },
  });
  if (
    replay &&
    (replay.termId !== term.id || replay.translationId !== translation.id)
  )
    throw new AppError(
      409,
      "REQUEST_REUSED",
      "El identificador de envío ya se utilizó para otra selección.",
    );
  const counts = await countsFor(tx, attemptId, replay?.sequence);
  if (!replay) {
    checkOpen(counts, term.id, translation.id);
    const sequence = 1 + counts.reduce((sum, c) => sum + c._count, 0);
    await tx.activityMatchingSubmission.create({
      data: {
        attemptId,
        versionId: version.id,
        requestId: choice.requestId,
        termId: term.id,
        translationId: translation.id,
        sequence,
        correct,
      },
    });
    counts.push({ termId: term.id, correct, _count: 1 });
  }
  const state = board(version, attemptId, counts, attemptId);
  if (!replay && state.finished)
    await tx.activityAttempt.update({
      where: { id: attemptId },
      data: { completedAt: new Date() },
    });
  return {
    state,
    feedback: { correct, message: correct ? term.feedback : "" },
  };
}
export function previewBoard(
  version: Version,
  seed: string,
  choices: Choice[],
) {
  const counts: Count[] = [];
  let feedback: { correct: boolean; message: string } | null = null;
  for (const choice of choices) {
    const { term, translation, correct } = resolveChoice(version, seed, choice);
    checkOpen(counts, term.id, translation.id);
    counts.push({ termId: term.id, correct, _count: 1 });
    feedback = { correct, message: correct ? term.feedback : "" };
  }
  return { state: board(version, seed, counts, null), feedback };
}
