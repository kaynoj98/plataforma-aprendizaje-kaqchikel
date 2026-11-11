import "server-only";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import type { CatalogOption } from "./vocabulary-catalogs";

type Word = {
  id: string;
  termKaqchikel: string;
  translationEs: string;
  category: CatalogOption | null;
  variant: CatalogOption | null;
  imageMedia: { id: string } | null;
  pronunciationMedia: { id: string } | null;
};

type List<T> = {
  items: T[];
  pagination: { page: number; total: number; totalPages: number };
};

export async function getStudentVocabulary(query: URLSearchParams) {
  const session = (await cookies()).get("kaqchikel_session");
  if (!session) redirect("/login");
  const base = process.env.API_INTERNAL_URL ?? "http://127.0.0.1:4000";
  async function list<T>(path: string): Promise<List<T>> {
    const response = await fetch(base + "/api/v1/vocabulary" + path, {
      headers: { Cookie: `kaqchikel_session=${session!.value}` }, cache: "no-store",
    });
    if (response.status === 401 || response.status === 403) redirect("/login");
    if (!response.ok) throw new Error("No se pudo consultar el vocabulario.");
    const result = await response.json() as { success: boolean; data?: List<T> };
    if (!result.success || !Array.isArray(result.data?.items) || !result.data?.pagination) {
      throw new Error("Respuesta de vocabulario incompleta.");
    }
    return result.data;
  }

  // Solo las opciones de filtro se recorren completas. Las palabras se leen por página.
  async function options(kind: "categories" | "variants") {
    const items: CatalogOption[] = [];
    let page = 1;
    while (true) {
      const result = await list<CatalogOption>(`/${kind}?pageSize=50&page=${page}`);
      items.push(...result.items);
      if (page >= result.pagination.totalPages || !result.items.length) return items;
      page++;
    }
  }
  const [words, categories, variants] = await Promise.all([
    list<Word>("?" + query), options("categories"), options("variants"),
  ]);
  return { words, categories, variants };
}
