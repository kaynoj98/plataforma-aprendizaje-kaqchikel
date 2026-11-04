import "server-only";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

type SessionResponse = {
  success: boolean;
  data?: {
    authenticated: boolean;
    user?: {
      id: string;
      firstName: string;
      lastName: string;
      email: string;
      role: "ADMIN" | "USER";
      status: string;
    };
  };
};

export async function requireAdmin() {
  // Leer la cookie enviada por el navegador
  const cookieStore = await cookies();

  const sessionCookie = cookieStore.get("kaqchikel_session");

  // Sin cookie, enviar al inicio de sesión
  if (!sessionCookie) {
    redirect("/login");
  }

  // Dirección interna del backend Express
  const apiUrl = process.env.API_INTERNAL_URL ?? "http://127.0.0.1:4000";

  let response: Response;

  try {
    response = await fetch(`${apiUrl}/api/v1/auth/session`, {
      method: "GET",
      headers: {
        Cookie: `kaqchikel_session=${sessionCookie.value}`,
      },
      cache: "no-store",
    });
  } catch {
    throw new Error("No se pudo conectar con el servidor de autenticación.");
  }

  // Sesión inexistente o no autorizada
  if (response.status === 401 || response.status === 403) {
    redirect("/login");
  }

  if (!response.ok) {
    throw new Error("No fue posible verificar la sesión.");
  }

  const result = (await response.json()) as SessionResponse;

  const user = result.data?.user;

  if (
    !result.success ||
    !result.data?.authenticated ||
    !user ||
    user.status !== "ACTIVE"
  ) {
    redirect("/login");
  }

  // Usuario autenticado, pero no administrador
  if (user.role !== "ADMIN") {
    redirect("/aprender");
  }

  return user;
}
