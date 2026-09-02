/**
 * Estado del flujo del lado del cliente. NO es auth propio:
 * simplemente guarda lo que devolvió la API real para reusarlo entre pantallas.
 */
import type { Perfil } from "@/lib/api/suscripcion";

const KEY_SESION = "vistashop.sesion";
const KEY_VISITA = "vistashop.visita";
const KEY_COMERCIO = "vistashop.nombreComercio";

export type Sesion = { accessToken: string; profile: Perfil };

const disponible = () => typeof window !== "undefined";

export function guardarSesion(sesion: Sesion) {
  if (!disponible()) return;
  sessionStorage.setItem(KEY_SESION, JSON.stringify(sesion));
}

export function leerSesion(): Sesion | null {
  if (!disponible()) return null;
  const raw = sessionStorage.getItem(KEY_SESION);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as Sesion;
  } catch {
    return null;
  }
}

export function guardarNombreComercio(nombre: string) {
  if (!disponible()) return;
  sessionStorage.setItem(KEY_COMERCIO, nombre);
}

export function leerNombreComercio(): string {
  if (!disponible()) return "";
  return sessionStorage.getItem(KEY_COMERCIO) ?? "";
}

/** Id de visita para tracking de embudo (se genera al entrar a la Landing). */
export function obtenerVisita(): string {
  if (!disponible()) return "";
  let visita = sessionStorage.getItem(KEY_VISITA);
  if (!visita) {
    visita = crypto.randomUUID();
    sessionStorage.setItem(KEY_VISITA, visita);
  }
  return visita;
}
