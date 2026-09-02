import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { ClientOnly } from "@tanstack/react-router";
import { lazy, Suspense, useState } from "react";
import { FlowLayout } from "@/components/FlowLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { loginGoogle, pedirEnlace } from "@/lib/api/suscripcion";
import { guardarSesion } from "@/lib/sesion";

const BotonGoogle = lazy(() => import("@/components/BotonGoogle"));

export const Route = createFileRoute("/cuenta")({
  head: () => ({
    meta: [
      { title: "Crear tu cuenta — VistaShop" },
      { name: "description", content: "Entrá con Google o con tu email para empezar." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: Cuenta,
});

function Cuenta() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [enviado, setEnviado] = useState(false);

  async function conGoogle(credential: string) {
    setError("");
    try {
      const res = await loginGoogle(credential);
      guardarSesion(res);
      navigate({ to: "/negocio" });
    } catch (e) {
      setError((e as Error).message);
    }
  }

  async function conEmail(ev: React.FormEvent) {
    ev.preventDefault();
    setError("");
    setEnviando(true);
    try {
      await pedirEnlace(email.trim());
      setEnviado(true);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setEnviando(false);
    }
  }

  if (enviado) {
    return (
      <FlowLayout paso={0} titulo="Revisá tu correo">
        <div className="rounded-lg border p-5">
          <p className="text-sm">
            Te enviamos un enlace a <span className="font-medium">{email}</span>. Abrilo desde este
            celular o computadora para continuar.
          </p>
          <p className="mt-3 text-sm text-muted-foreground">El enlace vence en 10 minutos.</p>
          <Button variant="outline" className="mt-5" onClick={() => setEnviado(false)}>
            Usar otro email
          </Button>
        </div>
      </FlowLayout>
    );
  }

  return (
    <FlowLayout
      paso={0}
      titulo="Empecemos por tu cuenta"
      descripcion="Sin contraseñas. Entrás con Google o con un enlace a tu correo."
    >
      <div className="space-y-6">
        <ClientOnly fallback={<div className="h-10 animate-pulse rounded-md bg-muted" />}>
          <Suspense fallback={<div className="h-10 animate-pulse rounded-md bg-muted" />}>
            <BotonGoogle onCredential={conGoogle} onError={setError} />
          </Suspense>
        </ClientOnly>

        <div className="flex items-center gap-3">
          <span className="h-px flex-1 bg-border" />
          <span className="text-xs text-muted-foreground">o</span>
          <span className="h-px flex-1 bg-border" />
        </div>

        <form onSubmit={conEmail} className="space-y-3">
          <Label htmlFor="email">Tu email</Label>
          <Input
            id="email"
            type="email"
            required
            inputMode="email"
            autoComplete="email"
            placeholder="vos@tucomercio.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <Button type="submit" variant="outline" className="w-full" disabled={enviando}>
            {enviando ? "Enviando…" : "Continuar con tu email"}
          </Button>
        </form>

        {error && <p className="text-sm text-destructive">{error}</p>}
      </div>
    </FlowLayout>
  );
}
