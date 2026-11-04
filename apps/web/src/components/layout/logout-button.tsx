"use client";

import { useState } from "react";
import { LogOut, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";

export function LogoutButton() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleLogout() {
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/v1/auth/logout", {
        method: "POST",
        credentials: "same-origin",
      });

      if (!response.ok) {
        throw new Error("No se pudo cerrar la sesión.");
      }

      // Regresar al login con una navegación nueva
      window.location.replace("/login");
    } catch {
      setError("Error al cerrar sesión. Intenta nuevamente.");
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={handleLogout}
        disabled={loading}
      >
        {loading ? (
          <Loader2 className="size-4 animate-spin" />
        ) : (
          <LogOut className="size-4" />
        )}

        {loading ? "Cerrando..." : "Cerrar sesión"}
      </Button>

      {error && (
        <p role="alert" className="text-xs text-destructive">
          {error}
        </p>
      )}
    </div>
  );
}
