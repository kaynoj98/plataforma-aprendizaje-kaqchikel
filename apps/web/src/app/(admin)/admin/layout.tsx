import {
  AdminSidebar,
  AdminMobileMenu,
} from "@/components/layout/admin-navigation";

import { LogoutButton } from "@/components/layout/logout-button";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-muted/30 md:flex">
      {/* Sidebar para computadoras */}
      <AdminSidebar />

      {/* Contenido principal */}
      <div className="min-w-0 flex-1">
        {/* Encabezado */}
        <header className="flex min-h-18 items-center justify-between gap-3 border-b bg-card px-4 md:px-8">
          <div className="flex items-center gap-3">
            {/* Menú móvil */}
            <AdminMobileMenu />

            <div>
              <p className="text-xs text-muted-foreground">
                Plataforma educativa
              </p>

              <p className="font-semibold">Panel de administración</p>
            </div>
          </div>

          <LogoutButton />
        </header>

        {/* Contenido de cada página */}
        <main className="mx-auto max-w-7xl p-4 md:p-8">{children}</main>
      </div>
    </div>
  );
}
