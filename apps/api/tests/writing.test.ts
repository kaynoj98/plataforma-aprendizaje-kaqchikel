import { expect, it } from "vitest";
import { randomUUID } from "node:crypto";
import {
  writtenChoice,
  writingKey,
} from "../src/modules/activities/activity.schemas.js";

it.each([
  ["ä ë ï ö ü", "ä ë ï ö ü".normalize("NFD"), true],
  ["tz’ ch’ k’ q’ b’ t’", "  tz’ ch’ k’ q’ b’ t’  ", true],
  ["ä", "a", false],
  ["Ä", "ä", false],
  ["ch’", "ch'", false],
  ["q’", "qʼ", false],
  ["k’", "k", false],
  ["ä ë", "ä  ë", false],
  ["ä ë", "ä\të", false],
  ["tz’", "t’", false],
] as const)("compara %j con %j", (expected, actual, correct) => {
  expect(writingKey(actual) === writingKey(expected)).toBe(correct);
});
it("valida el texto sin transformar el original", () => {
  const base = { questionId: randomUUID(), requestId: randomUUID() };
  for (const invalid of ["", "   ", "x".repeat(501), "\u0000", "\ud800"])
    expect(
      writtenChoice.safeParse({ ...base, responseText: invalid }).success,
    ).toBe(false);
  const raw = "  " + "ä".normalize("NFD") + " ";
  expect(writtenChoice.parse({ ...base, responseText: raw }).responseText).toBe(
    raw,
  );
});
