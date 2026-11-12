import type { Metadata } from "next";
import Link from "next/link";
import { listAdminCourses } from "@/lib/admin-academics";
import { requireAdmin } from "@/lib/auth";
import { cookies } from "next/headers";

import { Users, GraduationCap, Languages, Files } from "lucide-react";

export const metadata: Metadata = {
  title: "Administración",
};

const stats = [
  { title: "Usuarios", icon: Users },
  { title: "Cursos", icon: GraduationCap },
  { title: "Vocabulario", icon: Languages },
  { title: "Multimedia", icon: Files },
];

type VocabularyResponse = {
  success: boolean;
  data?: {
    pagination?: {
      total: number;
    };
  };
};

async function getVocabularyCount(): Promise<number | null> {
  const cookieStore = await cookies();
  const session = cookieStore.get("kaqchikel_session");

  if (!session) {
    return null;
  }

  const apiUrl = process.env.API_INTERNAL_URL ?? "http://127.0.0.1:4000";

  try {
    const response = await fetch(
      `${apiUrl}/api/v1/admin/vocabulary?page=1&pageSize=1`,
      {
        method: "GET",
        headers: {
          Cookie: `kaqchikel_session=${session.value}`,
        },
        cache: "no-store",
      },
    );

    if (!response.ok) {
      return null;
    }

    const result = (await response.json()) as VocabularyResponse;

    const total = result.data?.pagination?.total;

    return result.success && typeof total === "number" ? total : null;
  } catch {
    return null;
  }
}

export default async function AdminPage() {
  const user = await requireAdmin();
  const [vocabularyTotal, courses] = await Promise.all([
    getVocabularyCount(), listAdminCourses(1, 1).catch(() => null),
  ]);
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
          Resumen general
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Bienvenido {user.firstName} al panel de administración de la
          plataforma educativa Kaqchikel.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;

          return (
            <div
              key={stat.title}
              className="rounded-xl border bg-card p-5 shadow-sm"
            >
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">{stat.title}</p>
                <Icon className="size-5 text-muted-foreground" />
              </div>

              <p className="mt-4 text-3xl font-semibold">
                {stat.title === "Vocabulario" ? (vocabularyTotal ?? "—") :
                  stat.title === "Cursos" ? (courses?.pagination.totalItems ?? "—") : "—"}
              </p>

              <p className="mt-2 text-xs text-muted-foreground">
                {stat.title === "Vocabulario"
                  ? vocabularyTotal === null
                    ? "No se pudo consultar la API"
                    : "Total de palabras registradas"
                  : stat.title === "Cursos" ? <Link href="/admin/cursos" className="underline">Gestionar cursos</Link> : "Pendiente de conectar"}
              </p>
            </div>
          );
        })}
      </div>

      <section className="rounded-xl border bg-card p-6 shadow-sm">
        <h2 className="text-lg font-semibold">Actividad reciente</h2>

        <p className="mt-3 text-sm text-muted-foreground">
          Aquí mostraremos los últimos cambios realizados en usuarios, cursos,
          lecciones y vocabulario.
        </p>
      </section>
    </div>
  );
}
