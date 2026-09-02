/**
 * Las 6 llamadas del flujo de suscripción. Sin lógica de negocio:
 * arman el request y devuelven la respuesta. Con mocks de la misma forma
 * mientras no haya VITE_API_BASE_URL.
 */
import { apiFetch, usaMocks } from "./client";
import {
  mockCheckout,
  mockCotizacion,
  mockEnlace,
  mockEstado,
  mockLogin,
  mockTerminos,
} from "@/mocks/data";

export type DocumentoLegal = {
  documento: "servicio" | "datos";
  version: string;
  titulo: string;
  url: string;
  aceptado: boolean;
  borrador: boolean;
};

export type TerminosResponse = { documentos: DocumentoLegal[] };

export type Perfil = { name: string; email: string; picture: string; role: string };
export type LoginResponse = { accessToken: string; profile: Perfil };
export type EnlaceResponse = { enviado: boolean; expiraEn: number };
export type CheckoutResponse = { id: string; [k: string]: unknown };
export type SuscripcionEstado = {
  id: string;
  estado: string;
  slug: string;
  listo: boolean;
  ciclo: string;
  ultimoPago: string | null;
};
export type CotizacionResponse = {
  moneda: string;
  monto: number;
  cotizacion: number;
  actualizado: string;
};

export type CheckoutBody = {
  email: string;
  nombreComercio: string;
  /** Token del SDK de Mercado Pago (string), nunca datos de tarjeta. */
  tarjeta: string;
  acepta: Record<string, boolean>;
  visita: string;
};

const espera = (ms: number) => new Promise((r) => setTimeout(r, ms));

/** 1. GET /gondola-suscripcion/terminos */
export async function obtenerTerminos(): Promise<TerminosResponse> {
  if (usaMocks) {
    await espera(300);
    return structuredClone(mockTerminos);
  }
  return apiFetch<TerminosResponse>("/gondola-suscripcion/terminos");
}

/** 2. POST /account/login (credential de Google Identity Services) */
export async function loginGoogle(credential: string): Promise<LoginResponse> {
  if (usaMocks) {
    await espera(400);
    return structuredClone(mockLogin);
  }
  return apiFetch<LoginResponse>("/account/login", {
    method: "POST",
    body: { credential },
  });
}

/** 3. POST /account/enlace */
export async function pedirEnlace(email: string): Promise<EnlaceResponse> {
  if (usaMocks) {
    await espera(400);
    return structuredClone(mockEnlace);
  }
  return apiFetch<EnlaceResponse>("/account/enlace", {
    method: "POST",
    body: { email, rol: "comerciante" },
  });
}

/** 4. POST /account/enlace/verificar */
export async function verificarEnlace(token: string): Promise<LoginResponse> {
  if (usaMocks) {
    await espera(600);
    return structuredClone(mockLogin);
  }
  return apiFetch<LoginResponse>("/account/enlace/verificar", {
    method: "POST",
    body: { token },
  });
}

/** 5. POST /gondola-suscripcion/checkout -> 202 { id } */
export async function crearCheckout(body: CheckoutBody): Promise<CheckoutResponse> {
  if (usaMocks) {
    await espera(700);
    return structuredClone(mockCheckout);
  }
  return apiFetch<CheckoutResponse>("/gondola-suscripcion/checkout", {
    method: "POST",
    body,
  });
}

/** 6. GET /gondola-suscripcion/:id */
export async function obtenerSuscripcion(id: string): Promise<SuscripcionEstado> {
  if (usaMocks) {
    await espera(400);
    return mockEstado(id);
  }
  return apiFetch<SuscripcionEstado>(`/gondola-suscripcion/${encodeURIComponent(id)}`);
}

/** Cotización del precio en pesos para el resumen de Pago. */
export async function obtenerCotizacion(): Promise<CotizacionResponse> {
  if (usaMocks) {
    await espera(300);
    return structuredClone(mockCotizacion);
  }
  return apiFetch<CotizacionResponse>("/gondola-suscripcion/cotizacion");
}

/** Extra: tracking de embudo, fire-and-forget. */
export function registrarVisita(visita: string, origen: string): void {
  if (usaMocks) return;
  void apiFetch("/gondola-suscripcion/visita", {
    method: "POST",
    body: { visita, origen },
  }).catch(() => {});
}
