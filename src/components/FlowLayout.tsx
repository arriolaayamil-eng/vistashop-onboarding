import type { ReactNode } from "react";
import { Link } from "@tanstack/react-router";

export function Marca({ className = "" }: { className?: string }) {
  return (
    <Link to="/" className={`flex items-baseline gap-2 ${className}`}>
      <span className="text-base font-semibold tracking-tight">VistaShop</span>
      <span className="text-xs text-muted-foreground">Powered by Agentika</span>
    </Link>
  );
}

const PASOS = ["Cuenta", "Tu negocio", "Pago", "Listo"];

export function Stepper({ paso }: { paso: number }) {
  return (
    <ol className="flex items-center gap-2" aria-label="Progreso">
      {PASOS.map((nombre, i) => {
        const activo = i === paso;
        const hecho = i < paso;
        return (
          <li key={nombre} className="flex items-center gap-2">
            <span
              className={`flex h-6 w-6 items-center justify-center rounded-full border text-xs ${
                activo
                  ? "border-foreground bg-foreground text-background"
                  : hecho
                    ? "border-foreground/40 text-foreground/70"
                    : "border-border text-muted-foreground"
              }`}
            >
              {i + 1}
            </span>
            <span
              className={`hidden text-xs sm:inline ${activo ? "text-foreground" : "text-muted-foreground"}`}
            >
              {nombre}
            </span>
            {i < PASOS.length - 1 && <span className="h-px w-4 bg-border sm:w-6" />}
          </li>
        );
      })}
    </ol>
  );
}

export function FlowLayout({
  paso,
  titulo,
  descripcion,
  children,
}: {
  paso: number;
  titulo: string;
  descripcion?: string;
  children: ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="border-b">
        <div className="mx-auto flex w-full max-w-xl flex-col gap-3 px-5 py-4">
          <Marca />
          <Stepper paso={paso} />
        </div>
      </header>
      <main className="mx-auto w-full max-w-xl flex-1 px-5 py-8">
        <h1 className="text-2xl font-semibold tracking-tight">{titulo}</h1>
        {descripcion && <p className="mt-2 text-sm text-muted-foreground">{descripcion}</p>}
        <div className="mt-6">{children}</div>
      </main>
      <footer className="border-t px-5 py-5 text-center text-xs text-muted-foreground">
        VistaShop — Powered by Agentika
      </footer>
    </div>
  );
}
