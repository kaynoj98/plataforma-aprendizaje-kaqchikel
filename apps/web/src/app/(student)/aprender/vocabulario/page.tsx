import type { Metadata } from "next";
import Form from "next/form";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { StoredPreview } from "@/components/vocabulary/media-preview";
import { requireStudent } from "@/lib/auth";
import { getStudentVocabulary } from "@/lib/student-vocabulary";

export const metadata: Metadata = { title: "Vocabulario audiovisual" };
const path = "/aprender/vocabulario";
const uuid = /^[\da-f]{8}(?:-[\da-f]{4}){3}-[\da-f]{12}$/i;
const field = "mt-1 w-full min-w-0 rounded-lg border bg-background px-3 py-2";

export default async function VocabularyPage({ searchParams }: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  await requireStudent();
  const params = await searchParams;
  const filters = new URLSearchParams();
  if (typeof params.q === "string" && params.q.trim()) filters.set("q", params.q.trim().slice(0, 100));
  for (const key of ["categoryId", "variantId"] as const) {
    const id = params[key];
    if (typeof id === "string" && uuid.test(id)) filters.set(key, id);
  }
  const number = Number(params.page);
  const page = Number.isInteger(number) && number > 0 && number <= 1000000 ? number : 1;
  function pageHref(target: number) {
    const query = new URLSearchParams(filters);
    query.set("page", String(target));
    return path + "?" + query;
  }
  const query = new URLSearchParams(filters);
  query.set("page", String(page));
  query.set("pageSize", "12");
  const { words, categories, variants } = await getStudentVocabulary(query);
  const lastPage = Math.max(1, words.pagination.totalPages);
  if (page > lastPage) redirect(pageHref(lastPage));

  return (
    <main className="min-h-screen bg-muted/30 px-4 py-8 sm:px-6">
      <div className="mx-auto max-w-5xl space-y-6">
        <Link href="/aprender" className="text-sm underline">Volver a Aprender</Link>
        <h1 className="text-3xl font-bold">Vocabulario audiovisual</h1>
        <Form key={filters.toString()} action={path} className="grid gap-4 rounded-xl border bg-card p-4 sm:grid-cols-2 lg:grid-cols-3">
          <label className="min-w-0 text-sm font-medium">
            Buscar palabra o traducción
            <input type="search" name="q" maxLength={100} defaultValue={filters.get("q") ?? ""} className={field} />
          </label>
          {([["categoryId", "Categoría", categories], ["variantId", "Variante regional", variants]] as const)
            .map(([key, label, options]) => (
              <label key={key} className="min-w-0 text-sm font-medium">
                {label}
                <select name={key} defaultValue={filters.get(key) ?? ""} className={field}>
                  <option value="">Todas</option>
                  {options.map(option => <option key={option.id} value={option.id}>{option.name}</option>)}
                </select>
              </label>
            ))}
          <div className="flex flex-wrap gap-2 sm:col-span-2">
            <Button type="submit">Buscar</Button>
            {filters.size > 0 && <Button variant="outline" asChild><Link href={path}>Quitar filtros</Link></Button>}
          </div>
        </Form>

        {words.items.length === 0 ? (
          <p role="status" className="rounded-xl border bg-card p-6">
            {filters.size ? "No hay palabras que coincidan con estos filtros." : "Aún no hay palabras disponibles."}
          </p>
        ) : (
          <>
            <p className="text-sm text-muted-foreground" role="status">
              {words.pagination.total} {words.pagination.total === 1 ? "palabra" : "palabras"} · Página {page} de {lastPage}
            </p>
            <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {words.items.map(word => (
                <li key={word.id} className="min-w-0 space-y-3 break-words rounded-xl border bg-card p-5">
                  <h2 lang="cak" className="text-xl font-semibold">{word.termKaqchikel}</h2>
                  <p>{word.translationEs}</p>
                  {word.category && <p className="text-sm">Categoría · {word.category.name}</p>}
                  {word.variant && <p className="text-sm">Variante regional · {word.variant.name}</p>}
                  {word.imageMedia && <StoredPreview key={word.imageMedia.id} kind="image" id={word.imageMedia.id} />}
                  {word.pronunciationMedia && <StoredPreview key={word.pronunciationMedia.id} kind="audio" id={word.pronunciationMedia.id} />}
                </li>
              ))}
            </ul>
            {lastPage > 1 && (
              <nav aria-label="Páginas de vocabulario" className="flex flex-wrap gap-3">
                {page > 1 && <Button asChild variant="outline"><Link href={pageHref(page - 1)}>Anterior</Link></Button>}
                {page < lastPage && <Button asChild variant="outline"><Link href={pageHref(page + 1)}>Siguiente</Link></Button>}
              </nav>
            )}
          </>
        )}
      </div>
    </main>
  );
}
