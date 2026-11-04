"use client";

import { useState } from "react";
import type { FormEvent } from "react";

import { useRouter } from "next/navigation";

import { BookOpen, Eye, EyeOff, Loader2, LogIn } from "lucide-react";

import { Button } from "@/components/ui/button";

type LoginResponse = {
  success: boolean;
  data?: {
    user: {
      id: string;
      email: string;
      role: "ADMIN" | "USER";
    };
  };
  error?: {
    code: string;
    message: string;
  };
};

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/v1/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "same-origin",
        body: JSON.stringify({
          email: email.trim(),
          password,
        }),
      });

      const result = (await response.json()) as LoginResponse;

      if (!response.ok || !result.success || !result.data?.user) {
        setError(result.error?.message ?? "No fue posible iniciar sesión.");
        return;
      }

      const role = result.data.user.role;

      if (role === "ADMIN") {
        router.replace("/admin");
      } else if (role === "USER") {
        router.replace("/aprender");
      } else {
        setError("El usuario no tiene un rol reconocido.");
        return;
      }

      router.refresh();
    } catch {
      setError("No se pudo conectar con el servidor. Intenta nuevamente.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-muted/30 px-4 py-10">
      <div className="w-full max-w-md space-y-6 rounded-2xl border bg-card p-6 shadow-sm sm:p-8">
        {/* Identidad */}
        <div className="space-y-3 text-center">
          <div className="mx-auto flex size-14 items-center justify-center rounded-xl bg-primary text-primary-foreground">
            <BookOpen className="size-7" />
          </div>

          <h1 className="text-2xl font-bold">Plataforma Kaqchikel</h1>

          <p className="text-sm text-muted-foreground">
            Ingresa tus credenciales para continuar
          </p>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-medium">
              Correo electrónico
            </label>

            <input
              id="email"
              name="email"
              type="email"
              autoComplete="username"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="usuario@ejemplo.com"
              className="w-full rounded-lg border bg-background px-3 py-2.5 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="password" className="text-sm font-medium">
              Contraseña
            </label>

            <div className="relative">
              <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-lg border bg-background px-3 py-2.5 pr-12 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />

              <button
                type="button"
                aria-label={
                  showPassword ? "Ocultar contraseña" : "Mostrar contraseña"
                }
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-3 flex items-center text-muted-foreground"
              >
                {showPassword ? (
                  <EyeOff className="size-5" />
                ) : (
                  <Eye className="size-5" />
                )}
              </button>
            </div>
          </div>

          {/* Error de autenticación */}
          {error && (
            <div
              role="alert"
              className="rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive"
            >
              {error}
            </div>
          )}

          <Button type="submit" disabled={loading} className="w-full">
            {loading ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Iniciando sesión...
              </>
            ) : (
              <>
                <LogIn className="size-4" />
                Iniciar sesión
              </>
            )}
          </Button>
        </form>

        <p className="text-center text-xs text-muted-foreground">
          Plataforma educativa para el aprendizaje del idioma Maya Kaqchikel.
        </p>
      </div>
    </main>
  );
}
