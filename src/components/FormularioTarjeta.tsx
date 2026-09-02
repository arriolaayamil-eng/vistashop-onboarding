import { useEffect, useState } from "react";
import { initMercadoPago, CardPayment } from "@mercadopago/sdk-react";

/**
 * SDK Web de Mercado Pago: los campos de número, vencimiento y CVV se renderizan
 * en iframes de Mercado Pago. Acá solo recibimos el token (string).
 */
export default function FormularioTarjeta({
  monto,
  email,
  deshabilitado,
  onToken,
  onError,
}: {
  monto: number;
  email: string;
  deshabilitado: boolean;
  onToken: (token: string) => void;
  onError: (mensaje: string) => void;
}) {
  const publicKey = import.meta.env["VITE_MP_PUBLIC_KEY"] as string | undefined;
  const [listo, setListo] = useState(false);

  useEffect(() => {
    if (publicKey) {
      initMercadoPago(publicKey, { locale: "es-AR" });
      setListo(true);
    }
  }, [publicKey]);

  if (!publicKey) {
    return (
      <div className="rounded-md border border-dashed p-3 text-xs text-muted-foreground">
        Configurá VITE_MP_PUBLIC_KEY (clave pública de prueba) para renderizar el formulario seguro
        de Mercado Pago.
      </div>
    );
  }

  if (!listo) return <div className="h-40 animate-pulse rounded-md bg-muted" />;

  return (
    <div className={deshabilitado ? "pointer-events-none opacity-50" : undefined}>
    <CardPayment
      initialization={{ amount: monto, payer: { email } }}
      customization={{
        visual: {
          hidePaymentButton: false,
          style: { theme: "default" },
          texts: { formSubmit: "Confirmar suscripción — $99/mes" },
        },
      }}
      onSubmit={async (formData) => {
        const token = (formData as { token?: string }).token;
        if (token) onToken(token);
        else onError("No pudimos validar la tarjeta. Revisá los datos e intentá de nuevo.");
      }}
      onError={() => onError("No pudimos validar la tarjeta. Revisá los datos e intentá de nuevo.")}
    />
    </div>
  );
}
