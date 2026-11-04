import type { Metadata } from "next";
import { requireAdmin } from "@/lib/auth";

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

export default async function AdminPage() {
  const user = await requireAdmin();
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

              <p className="mt-4 text-3xl font-semibold">—</p>
              <p className="mt-2 text-xs text-muted-foreground">
                Pendiente de conectar
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
