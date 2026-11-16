import "server-only";

import { cookies } from "next/headers";

export type CatalogOption = {
  id: string;
  name: string;
};

type CatalogItem = CatalogOption & {
  isActive: boolean;
};

type CatalogResponse = {
  success: boolean;
  data?: {
    items: CatalogItem[];
    pagination: { totalPages: number };
  };
};

export async function getActiveVocabularyCatalog(
  kind: "categories" | "variants",
): Promise<CatalogOption[] | null> {
  const cookieStore = await cookies();
  const session = cookieStore.get("kaqchikel_session");

  if (!session) return null;

  const apiUrl = process.env.API_INTERNAL_URL ?? "http://127.0.0.1:4000";

  try {
    const options: CatalogOption[] = [];
    for (let page = 1; ; page++) {
      const response = await fetch(
        `${apiUrl}/api/v1/admin/vocabulary/${kind}?isActive=true&page=${page}&pageSize=50`,
        {
          headers: {
            Cookie: `kaqchikel_session=${session.value}`,
          },
          cache: "no-store",
        },
      );

      if (!response.ok) return null;

      const result = (await response.json()) as CatalogResponse;

      if (!result.success || !result.data) {
        return null;
      }

      options.push(...result.data.items.map(({ id, name }) => ({ id, name })));
      if (
        !result.data.items.length ||
        page >= result.data.pagination.totalPages
      )
        return options;
    }
  } catch {
    return null;
  }
}
