import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { FlowLayout } from "@/components/FlowLayout";
import { Button } from "@/components/ui/button";
import { obtenerSuscripcion, type SuscripcionEstado } from "@/lib/api/suscripcion";

export const Route = createFileRoute("/confirmacion")({
  validateSearch: (search: Record<string, unknown>) => ({
    id: typeof search["id"] === "string" ? (search["id"] as string) : "",
  }),
  head: () => ({
    meta: [
      { title: "Tu tienda — VistaShop" },
      { name: "description", content: "Estado de tu suscripción a VistaShop." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: Confirmacion,
});

const MENSAJES = [
  "Estamos creando tu tienda…",
  "Reservando la dirección web de tu comercio…",
  "Configurando tu catálogo…",
  "Casi listo. Puede tardar un poco más de lo habitual…",
];

const TIMEOUT_MS = 60_000;
const INTERVALO_MS = 2500;

function Confirmacion() {
  const { id } = Route.useSearch();
  const navigate = useNavigate();
  const [estado, setEstado] = useState<SuscripcionEstado | null>(null);
  const [error, setError] = useState("");
  const [demorado, setDemorado] = useState(false);
  const [mensaje, setMensaje] = useState(0);

  useEffect(() => {
    if (!id) return;
    let vivo = true;
    const inicio = Date.now();

    const rotador = setInterval(() => {
      setMensaje((m) => Math.min(m + 1, MENSAJES.length - 1));
    }, 8000);

    async function consultar() {
      try {
        const res = await obtenerSuscripcion(id);
        if (!vivo) return;
        setEstado(res);
        if (res.listo) return;
      } catch (e) {
        if (!vivo) return;
        setError((e as Error).message);
      }
      if (!vivo) return;
      if (Date.now() - inicio >= TIMEOUT_MS) {
        setDemorado(true);
        return;
      }
      setTimeout(consultar, INTERVALO_MS);
    }
    consultar();

    return () => {
      vivo = false;
      clearInterval(rotador);
    };
  }, [id]);

  if (!id) {
    return (
      <FlowLayout paso={3} titulo="No encontramos tu suscripción">
        <Button onClick={() => navigate({ to: "/" })}>Volver al inicio</Button>
      </FlowLayout>
    );
  }

  if (estado?.listo) {
    const url = `https://${estado.slug}.vistashop.app`;
    const wa = `https://wa.me/?text=${encodeURIComponent(`Ya podés hacer tu pedido en ${url}`)}`;
    return (
      <FlowLayout paso={3} titulo="Tu tienda está lista">
        <div className="space-y-5">
          <div className="rounded-lg border p-4">
            <p className="text-xs text-muted-foreground">Tu dirección web</p>
            <a
              href={url}
              target="_blank"
              rel="noreferrer"
              className="mt-1 block break-all text-base font-medium underline"
            >
              {url}
            </a>
          </div>
          <Button asChild size="lg" className="w-full">
            <a href="/panel">Entrar a mi panel</a>
          </Button>
          <Button asChild variant="outline" size="lg" className="w-full">
            <a href={wa} target="_blank" rel="noreferrer">
              Compartir por WhatsApp
            </a>
          </Button>
        </div>
      </FlowLayout>
    );
  }

  if (demorado) {
    return (
      <FlowLayout paso={3} titulo="Esto puede tardar unos minutos">
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Seguimos procesando tu suscripción. Cuando tu tienda esté lista te llega un mail de
            confirmación — no hace falta que esperes en esta pantalla.
          </p>
          <div className="rounded-lg border p-4">
            <p className="text-xs text-muted-foreground">Guardá este enlace para volver</p>
            <p className="mt-1 break-all text-sm">
              {typeof window !== "undefined" ? window.location.href : ""}
            </p>
          </div>
          <Button
            variant="outline"
            onClick={() => {
              setDemorado(false);
              setEstado(null);
              navigate({ to: "/confirmacion", search: { id }, replace: true });
              window.location.reload();
            }}
          >
            Volver a consultar
          </Button>
        </div>
      </FlowLayout>
    );
  }

  return (
    <FlowLayout paso={3} titulo={MENSAJES[mensaje] ?? MENSAJES[0]!}>
      <div className="space-y-4">
        <div className="flex items-center gap-3 text-sm text-muted-foreground">
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-muted-foreground border-t-transparent" />
          Recibimos tu pago. No cierres esta pantalla.
        </div>
        <p className="text-xs text-muted-foreground">Suscripción #{id}</p>
        {error && <p className="text-sm text-destructive">{error}</p>}
      </div>
    </FlowLayout>
  );
}
