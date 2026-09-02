import { createFileRoute, useNavigate, ClientOnly } from "@tanstack/react-router";
import { lazy, Suspense, useEffect, useState } from "react";
import { Lock } from "lucide-react";
import { FlowLayout } from "@/components/FlowLayout";
import { Checkbox } from "@/components/ui/checkbox";
import {
  crearCheckout,
  obtenerCotizacion,
  obtenerTerminos,
  type CotizacionResponse,
  type DocumentoLegal,
} from "@/lib/api/suscripcion";
import { leerNombreComercio, leerSesion, obtenerVisita } from "@/lib/sesion";

const FormularioTarjeta = lazy(() => import("@/components/FormularioTarjeta"));

export const Route = createFileRoute("/pago")({
  head: () => ({
    meta: [
      { title: "Pago — VistaShop" },
      { name: "description", content: "Confirmá tu suscripción de $99 USD/mes." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: Pago,
});

function Pago() {
  const navigate = useNavigate();
  const [documentos, setDocumentos] = useState<DocumentoLegal[]>([]);
  const [aceptados, setAceptados] = useState<Record<string, boolean>>({});
  const [cotizacion, setCotizacion] = useState<CotizacionResponse | null>(null);
  const [error, setError] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [email, setEmail] = useState("");

  useEffect(() => {
    const sesion = leerSesion();
    if (!sesion) {
      navigate({ to: "/cuenta" });
      return;
    }
    setEmail(sesion.profile.email);

    obtenerTerminos()
      .then((res) => {
        setDocumentos(res.documentos);
        // Nunca premarcadas: siempre llegan con aceptado: false (requisito legal I-11).
        setAceptados(
          Object.fromEntries(res.documentos.map((d) => [d.documento, d.aceptado])) as Record<
            string,
            boolean
          >,
        );
      })
      .catch((e) => setError((e as Error).message));

    obtenerCotizacion()
      .then(setCotizacion)
      .catch(() => setCotizacion(null));
  }, [navigate]);

  const todoAceptado = documentos.length > 0 && documentos.every((d) => aceptados[d.documento]);

  async function confirmar(tarjeta: string) {
    if (!todoAceptado) {
      setError("Para continuar tenés que aceptar los dos documentos.");
      return;
    }
    setError("");
    setEnviando(true);
    try {
      const acepta = Object.fromEntries(
        documentos.map((d) => [d.documento, aceptados[d.documento] === true]),
      );
      const res = await crearCheckout({
        email,
        nombreComercio: leerNombreComercio(),
        tarjeta,
        acepta,
        visita: obtenerVisita(),
      });
      navigate({ to: "/confirmacion", search: { id: res.id } });
    } catch (e) {
      setError((e as Error).message);
      setEnviando(false);
    }
  }

  const montoPesos = cotizacion
    ? new Intl.NumberFormat("es-AR", {
        style: "currency",
        currency: cotizacion.moneda,
        maximumFractionDigits: 0,
      }).format(cotizacion.monto)
    : null;

  return (
    <FlowLayout paso={2} titulo="Confirmá tu suscripción">
      <div className="space-y-6">
        <section className="rounded-lg border p-4">
          <div className="flex items-baseline justify-between">
            <span className="text-sm">Suscripción VistaShop</span>
            <span className="text-sm font-medium">$99 USD/mes</span>
          </div>
          <p className="mt-2 text-sm text-muted-foreground">
            {montoPesos
              ? `Se cobra en pesos al día: aprox. ${montoPesos} por mes.`
              : "Cobrado en pesos al cambio del día."}
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-sm font-medium">Datos de la tarjeta</h2>
          <p className="text-xs text-muted-foreground">
            Marcá las dos casillas de abajo y completá la tarjeta: el botón dice “Confirmar
            suscripción — $99/mes”.
          </p>
          <ClientOnly fallback={<div className="h-40 animate-pulse rounded-md bg-muted" />}>
            <Suspense fallback={<div className="h-40 animate-pulse rounded-md bg-muted" />}>
              <FormularioTarjeta
                deshabilitado={!todoAceptado || enviando}
                monto={cotizacion?.monto ?? 0}
                email={email}
                onToken={confirmar}
                onError={setError}
              />
            </Suspense>
          </ClientOnly>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Lock className="h-3.5 w-3.5" />
            Procesado de forma segura por Mercado Pago. Cancelás cuando quieras.
          </div>
        </section>

        <section className="space-y-3">
          {documentos.map((d) => (
            <label key={d.documento} className="flex items-start gap-3 text-sm">
              <Checkbox
                checked={aceptados[d.documento] === true}
                onCheckedChange={(v) =>
                  setAceptados((prev) => ({ ...prev, [d.documento]: v === true }))
                }
              />
              <span>
                Acepto los{" "}
                <a href={d.url} target="_blank" rel="noreferrer" className="underline">
                  {d.titulo}
                </a>{" "}
                <span className="text-muted-foreground">(v{d.version})</span>
                {d.borrador && (
                  <span className="ml-1 text-xs text-muted-foreground">— texto preliminar</span>
                )}
              </span>
            </label>
          ))}
        </section>

        {error && <p className="text-sm text-destructive">{error}</p>}

        {enviando && <p className="text-sm text-muted-foreground">Procesando tu pago…</p>}
      </div>
    </FlowLayout>
  );
}
