import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { FlowLayout } from "@/components/FlowLayout";
import { Button } from "@/components/ui/button";
import { verificarEnlace } from "@/lib/api/suscripcion";
import { guardarSesion } from "@/lib/sesion";

export const Route = createFileRoute("/entrar")({
  validateSearch: (search: Record<string, unknown>) => ({
    t: typeof search['t'] === "string" ? (search['t'] as string) : "",
  }),
  head: () => ({
    meta: [
      { title: "Entrando — VistaShop" },
      { name: "description", content: "Validando tu enlace de acceso." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: Entrar,
});

function Entrar() {
  const { t } = Route.useSearch();
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const disparado = useRef(false);

  useEffect(() => {
    if (disparado.current) return;
    disparado.current = true;

    if (!t) {
      setError("El enlace no es válido. Pedí uno nuevo desde tu email.");
      return;
    }
    verificarEnlace(t)
      .then((res) => {
        guardarSesion(res);
        navigate({ to: "/negocio" });
      })
      .catch((e) => setError((e as Error).message));
  }, [t, navigate]);

  return (
    <FlowLayout paso={0} titulo={error ? "No pudimos entrar" : "Validando tu enlace…"}>
      {error ? (
        <div className="space-y-4">
          <p className="text-sm text-destructive">{error}</p>
          <Button onClick={() => navigate({ to: "/cuenta" })}>Pedir un enlace nuevo</Button>
        </div>
      ) : (
        <div className="flex items-center gap-3 text-sm text-muted-foreground">
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-muted-foreground border-t-transparent" />
          Un segundo, estamos verificando tu acceso.
        </div>
      )}
    </FlowLayout>
  );
}
