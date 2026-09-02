import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { FlowLayout } from "@/components/FlowLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { guardarNombreComercio, leerNombreComercio, leerSesion } from "@/lib/sesion";

export const Route = createFileRoute("/negocio")({
  head: () => ({
    meta: [
      { title: "Tu negocio — VistaShop" },
      { name: "description", content: "El nombre de tu comercio." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: Negocio,
});

function Negocio() {
  const navigate = useNavigate();
  const [nombre, setNombre] = useState("");

  useEffect(() => {
    setNombre(leerNombreComercio());
    if (!leerSesion()) navigate({ to: "/cuenta" });
  }, [navigate]);

  return (
    <FlowLayout
      paso={1}
      titulo="¿Cómo se llama tu comercio?"
      descripcion="Es lo único que necesitamos ahora. El resto lo completás después en tu panel."
    >
      <form
        className="space-y-5"
        onSubmit={(e) => {
          e.preventDefault();
          guardarNombreComercio(nombre.trim());
          navigate({ to: "/pago" });
        }}
      >
        <div className="space-y-2">
          <Label htmlFor="nombreComercio">Nombre del comercio</Label>
          <Input
            id="nombreComercio"
            required
            autoFocus
            maxLength={80}
            placeholder="Almacén Doña Rosa"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
          />
        </div>
        <Button type="submit" size="lg" className="w-full" disabled={!nombre.trim()}>
          Continuar al pago
        </Button>
      </form>
    </FlowLayout>
  );
}
