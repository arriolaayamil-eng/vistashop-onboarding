import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Marca } from "@/components/FlowLayout";
import { obtenerVisita } from "@/lib/sesion";
import { registrarVisita } from "@/lib/api/suscripcion";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "VistaShop — Tu tienda que vende más por pedido | $99 USD/mes" },
      {
        name: "description",
        content:
          "VistaShop: tu propia dirección web, cobrás como ya cobrás y tus clientes arman pedidos más grandes recorriendo. $99 USD/mes, cobrado en pesos al día.",
      },
      { property: "og:title", content: "VistaShop — Vendés más por pedido" },
      {
        property: "og:description",
        content:
          "Tu propia dirección web y pedidos más grandes. $99 USD/mes, cobrado en pesos al día.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Landing,
});

const BULLETS = [
  {
    titulo: "Vendés más por pedido",
    texto:
      "Tu cliente recorre tu comercio y va sumando productos al pedido, en vez de buscar solo lo que vino a buscar.",
  },
  {
    titulo: "Tu propia dirección web",
    texto: "Un enlace propio de tu comercio para compartir por WhatsApp, redes o donde quieras.",
  },
  {
    titulo: "Cobrás como ya cobrás",
    texto: "Seguís con tus medios de pago actuales. Sin cambiar nada de cómo cobrás hoy.",
  },
];

function Landing() {
  useEffect(() => {
    registrarVisita(obtenerVisita(), document.referrer || "directo");
  }, []);

  return (
    <div className="flex min-h-screen flex-col bg-background pb-24 sm:pb-0">
      <header className="border-b">
        <div className="mx-auto w-full max-w-3xl px-5 py-4">
          <Marca />
        </div>
      </header>

      <main className="mx-auto w-full max-w-3xl flex-1 px-5 py-8">
        <p className="text-sm font-medium text-muted-foreground">
          $99 USD/mes, cobrado en pesos al día
        </p>
        <h1 className="mt-3 text-3xl font-semibold leading-tight tracking-tight sm:text-4xl">
          Tu comercio online, donde el cliente recorre y arma un pedido más grande
        </h1>
        <p className="mt-3 text-base text-muted-foreground">
          Alta en minutos. Cancelás cuando quieras.
        </p>

        <div className="mt-6 overflow-hidden rounded-lg border bg-muted">
          <ImgSlot
            data-img-ref="#1 — video del recorrido de compra en VistaShop"
            alt="Recorrido de compra"
          />
        </div>

        <ul className="mt-8 space-y-5">
          {BULLETS.map((b) => (
            <li key={b.titulo}>
              <h2 className="text-base font-medium">{b.titulo}</h2>
              <p className="mt-1 text-sm text-muted-foreground">{b.texto}</p>
            </li>
          ))}
        </ul>

        <div className="mt-10 hidden sm:block">
          <Button asChild size="lg">
            <Link to="/cuenta">Empezar ahora</Link>
          </Button>
        </div>
      </main>

      <footer className="hidden border-t px-5 py-6 text-center text-xs text-muted-foreground sm:block">
        VistaShop — Powered by Agentika
      </footer>

      {/* CTA sticky en mobile */}
      <div className="fixed inset-x-0 bottom-0 border-t bg-background/95 p-4 backdrop-blur sm:hidden">
        <Button asChild size="lg" className="w-full">
          <Link to="/cuenta">Empezar ahora</Link>
        </Button>
        <p className="mt-2 text-center text-xs text-muted-foreground">
          $99 USD/mes, cobrado en pesos al día
        </p>
      </div>
    </div>
  );
}

/** Placeholder del video: el equipo integra la pieza real más adelante. */
function ImgSlot(props: { "data-img-ref": string; alt: string }) {
  return (
    <div
      data-img-ref={props["data-img-ref"]}
      role="img"
      aria-label={props.alt}
      className="flex aspect-video w-full items-center justify-center text-xs text-muted-foreground"
    >
      {props.alt}
    </div>
  );
}
