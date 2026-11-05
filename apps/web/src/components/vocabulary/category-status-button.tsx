"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Ban, CheckCircle2, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";

type CategoryStatusButtonProps = {
  categoryId: string;
  isActive: boolean;
};

type ApiResponse = {
  success: boolean;
  error?: {
    code?: string;
    message?: string;
  };
};

export function CategoryStatusButton({
  categoryId,
  isActive,
}: CategoryStatusButtonProps) {
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleChangeStatus() {
    if (loading) return;

    const newStatus = !isActive;

    const confirmed = window.confirm(
      newStatus
        ? "¿Deseas activar esta categoría?"
        : "¿Deseas desactivar esta categoría?",
    );

    if (!confirmed) return;

    setLoading(true);
    setError("");

    try {
      const response = await fetch(
        `/api/v1/admin/vocabulary/categories/${categoryId}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "same-origin",
          body: JSON.stringify({
            isActive: newStatus,
          }),
        },
      );

      if (response.status === 401) {
        window.location.replace("/login");
        return;
      }

      const result = (await response
        .json()
        .catch(() => null)) as ApiResponse | null;

      if (!response.ok || !result?.success) {
        setError(
          result?.error?.message ?? "No se pudo actualizar la categoría.",
        );
        return;
      }

      router.refresh();
    } catch {
      setError("No fue posible conectar con el servidor.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-1">
      <Button
        type="button"
        size="sm"
        variant={isActive ? "outline" : "default"}
        disabled={loading}
        onClick={handleChangeStatus}
      >
        {loading ? (
          <Loader2 className="size-4 animate-spin" />
        ) : isActive ? (
          <Ban className="size-4" />
        ) : (
          <CheckCircle2 className="size-4" />
        )}

        {loading ? "Actualizando..." : isActive ? "Desactivar" : "Activar"}
      </Button>

      {error && (
        <p role="alert" className="text-xs text-destructive">
          {error}
        </p>
      )}
    </div>
  );
}
