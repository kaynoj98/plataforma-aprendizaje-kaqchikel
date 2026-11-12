"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import {
  BookOpen,
  GraduationCap,
  Languages,
  LayoutDashboard,
  Menu,
  Users,
  Volume2,
} from "lucide-react";

import { cn } from "@/lib/utils";

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

// Opciones de navegación
const navigation = [
  {
    name: "Resumen",
    href: "/admin",
    icon: LayoutDashboard,
    enabled: true,
  },
  {
    name: "Usuarios",
    href: "/admin/usuarios",
    icon: Users,
    enabled: false,
  },
  {
    name: "Cursos",
    href: "/admin/cursos",
    icon: GraduationCap,
    enabled: true,
  },
  { name: "Contenidos académicos", href: "/admin/contenidos", icon: BookOpen, enabled: true },
  { name: "Inscripciones y progreso", href: "/admin/inscripciones", icon: Users, enabled: true },
  {
    name: "Vocabulario",
    href: "/admin/vocabulario",
    icon: Languages,
    enabled: true,
  },
  {
    name: "Pronunciación",
    href: "/admin/pronunciacion",
    icon: Volume2,
    enabled: false,
  },
];

// Menú compartido entre computadora y teléfono
function NavigationLinks({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();

  return (
    <nav aria-label="Navegación administrativa" className="space-y-1 p-4">
      {navigation.map((item) => {
        const Icon = item.icon;

        const active =
          pathname === item.href ||
          (item.href !== "/admin" && pathname.startsWith(`${item.href}/`));

        if (!item.enabled) {
          return (
            <div
              key={item.href}
              aria-disabled="true"
              className="flex items-center gap-3 rounded-lg px-3 py-3 text-sm text-muted-foreground/60"
            >
              <Icon className="size-5" aria-hidden="true" />
              <span>{item.name}</span>
              <span className="ml-auto text-[10px]">Próximo</span>
            </div>
          );
        }

        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            aria-current={active ? "page" : undefined}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-3 text-sm transition-colors",
              "hover:bg-accent hover:text-accent-foreground",
              active
                ? "bg-accent font-semibold text-accent-foreground"
                : "text-muted-foreground",
            )}
          >
            <Icon className="size-5" aria-hidden="true" />
            <span>{item.name}</span>
          </Link>
        );
      })}
    </nav>
  );
}

// Sidebar para computadoras
export function AdminSidebar() {
  return (
    <aside className="hidden w-64 shrink-0 flex-col border-r bg-card md:flex">
      <div className="flex h-18 items-center gap-3 border-b px-6">
        <BookOpen className="size-7" />
        <div>
          <p className="font-bold">Kaqchikel</p>
          <p className="text-xs text-muted-foreground">Plataforma educativa</p>
        </div>
      </div>

      <div className="flex-1">
        <NavigationLinks />
      </div>

      <div className="border-t p-4 text-xs text-muted-foreground">
        Plataforma Kaqchikel · Administración
      </div>
    </aside>
  );
}

// Menú desplegable para teléfonos
export function AdminMobileMenu() {
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Abrir menú de administración"
        aria-expanded={open}
        className="inline-flex size-10 items-center justify-center rounded-lg border bg-background hover:bg-accent md:hidden"
      >
        <Menu className="size-5" aria-hidden="true" />
      </button>

      <SheetContent side="left" className="w-[85vw] max-w-[320px] p-0">
        <SheetHeader className="border-b px-6 py-5 text-left">
          <SheetTitle className="flex items-center gap-3">
            <BookOpen className="size-6" />
            Plataforma Kaqchikel
          </SheetTitle>
        </SheetHeader>

        <NavigationLinks onNavigate={() => setOpen(false)} />

        <div className="px-7 py-4 text-xs text-muted-foreground">
          Panel de administración
        </div>
      </SheetContent>
    </Sheet>
  );
}
