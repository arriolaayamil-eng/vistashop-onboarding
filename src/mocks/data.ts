/**
 * Datos de ejemplo con LA MISMA FORMA que las respuestas reales de la API.
 * Se usan únicamente mientras VITE_API_BASE_URL no esté configurada.
 */
import type {
  CheckoutResponse,
  CotizacionResponse,
  EnlaceResponse,
  LoginResponse,
  SuscripcionEstado,
  TerminosResponse,
} from "@/lib/api/suscripcion";

export const mockTerminos: TerminosResponse = {
  documentos: [
    {
      documento: "servicio",
      version: "2024-05-01",
      titulo: "Términos del servicio",
      url: "https://agentika.example/legal/terminos-servicio",
      aceptado: false,
      borrador: false,
    },
    {
      documento: "datos",
      version: "2024-05-01",
      titulo: "Tratamiento de datos personales",
      url: "https://agentika.example/legal/datos-personales",
      aceptado: false,
      borrador: true,
    },
  ],
};

export const mockLogin: LoginResponse = {
  accessToken: "mock-access-token",
  profile: {
    name: "Comercio de prueba",
    email: "comerciante@ejemplo.com",
    picture: "",
    role: "comerciante",
  },
};

export const mockEnlace: EnlaceResponse = {
  enviado: true,
  expiraEn: 600,
};

export const mockCheckout: CheckoutResponse = {
  id: "sus_mock_0001",
};

/** Valor de ejemplo: cotización simulada, NO es el precio real en pesos. */
export const mockCotizacion: CotizacionResponse = {
  moneda: "ARS",
  monto: 128700,
  cotizacion: 1300,
  actualizado: "2026-09-02T00:00:00.000Z",
};

/** Simula el ciclo de creación: recién en la 3ª consulta `listo` es true. */
let mockPolls = 0;
export function mockEstado(id: string): SuscripcionEstado {
  mockPolls += 1;
  const listo = mockPolls >= 3;
  return {
    id,
    estado: listo ? "activa" : "procesando",
    slug: listo ? "comercio-de-prueba" : "",
    listo,
    ciclo: "mensual",
    ultimoPago: listo ? "2026-09-02T00:00:00.000Z" : null,
  };
}
