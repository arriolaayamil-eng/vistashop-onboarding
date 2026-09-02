/**
 * Cliente HTTP único del proyecto.
 * La URL base viene de VITE_API_BASE_URL (.env), nunca hardcodeada.
 */

export const API_BASE_URL = (import.meta.env['VITE_API_BASE_URL'] as string | undefined)?.replace(
  /\/+$/,
  "",
);

/** true cuando todavía no hay API configurada -> las funciones devuelven mocks. */
export const usaMocks = !API_BASE_URL;

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

type Options = Omit<RequestInit, "body"> & { body?: unknown; token?: string };

export async function apiFetch<T>(path: string, options: Options = {}): Promise<T> {
  if (!API_BASE_URL) {
    throw new ApiError("No hay API configurada (VITE_API_BASE_URL).", 0);
  }

  const { body, token, headers, ...rest } = options;

  let res: Response;
  try {
    res = await fetch(`${API_BASE_URL}${path}`, {
      ...rest,
      headers: {
        Accept: "application/json",
        ...(body !== undefined ? { "Content-Type": "application/json" } : {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(headers as Record<string, string> | undefined),
      },
      ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
    });
  } catch {
    throw new ApiError("No pudimos conectarnos. Revisá tu conexión e intentá de nuevo.", 0);
  }

  const texto = await res.text();
  let data: unknown = null;
  if (texto) {
    try {
      data = JSON.parse(texto);
    } catch {
      data = null;
    }
  }

  if (!res.ok) {
    // Los mensajes del backend ya están pensados para el usuario final: se muestran tal cual.
    const mensaje =
      data && typeof data === "object" && typeof (data as { error?: unknown }).error === "string"
        ? (data as { error: string }).error
        : "Ocurrió un error inesperado.";
    throw new ApiError(mensaje, res.status);
  }

  return data as T;
}
