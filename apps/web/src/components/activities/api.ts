export type Summary = {
  id: string;
  title: string;
  instructions: string;
  position: number;
  isVisible: boolean;
  total: number;
  revision: number;
};
export type Question = {
  prompt: string;
  feedback: string;
  vocabularyId: string | null;
  term?: string | null;
  options: { label: string; correct: boolean }[];
};
export type Definition = {
  title: string;
  instructions: string;
  questions: Question[];
};
export type Document = {
  revision: number;
  position: number;
  isVisible: boolean;
  definition: Definition;
};
export async function api<T>(
  path: string,
  method = "GET",
  body?: unknown,
  signal?: AbortSignal,
): Promise<T> {
  const response = await fetch("/api/v1/" + path, {
    method,
    cache: "no-store",
    signal,
    ...(body === undefined
      ? {}
      : {
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        }),
  });
  const result = await response.json();
  if (!response.ok)
    throw new Error(
      result.error?.details?.[0]?.message ??
        result.error?.message ??
        "No se pudo completar la solicitud.",
    );
  return result.data;
}
export function message(error: unknown) {
  return error instanceof Error
    ? error.message
    : "No se pudo conectar con el servidor.";
}
