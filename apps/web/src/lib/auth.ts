import "server-only";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

type User = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: "ADMIN" | "USER";
  status: string;
};

type SessionResponse = {
  success: boolean;
  data?: {
    authenticated: boolean;
    user?: User;
  };
};

// Comprobar que existe una sesión válida
export async function requireUser(): Promise<User> {
  const cookieStore = await cookies();

  const sessionCookie = cookieStore.get("kaqchikel_session");

  if (!sessionCookie) {
    redirect("/login");
  }

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

  if (response.status === 401 || response.status === 403) {
    redirect("/login");
  }

  if (!response.ok) {
    throw new Error("Ocurrió un error al verificar la sesión.");
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

  return user;
}

// Acceso exclusivo para administradores
export async function requireAdmin() {
  const user = await requireUser();

  if (user.role !== "ADMIN") {
    redirect("/aprender");
  }

  return user;
}

// Acceso exclusivo para estudiantes y otros USER
export async function requireStudent() {
  const user = await requireUser();

  if (user.role !== "USER") {
    redirect("/admin");
  }

  return user;
}
