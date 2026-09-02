import { GoogleOAuthProvider, GoogleLogin } from "@react-oauth/google";

/**
 * Botón oficial de Google Identity Services.
 * Devuelve el `credential` que espera POST /account/login.
 */
export default function BotonGoogle({
  onCredential,
  onError,
}: {
  onCredential: (credential: string) => void;
  onError: (mensaje: string) => void;
}) {
  const clientId = import.meta.env["VITE_GOOGLE_CLIENT_ID"] as string | undefined;

  if (!clientId) {
    return (
      <div className="rounded-md border border-dashed p-3 text-xs text-muted-foreground">
        Configurá VITE_GOOGLE_CLIENT_ID para habilitar “Continuar con Google”.
      </div>
    );
  }

  return (
    <GoogleOAuthProvider clientId={clientId}>
      <div className="flex justify-center">
        <GoogleLogin
          width="320"
          text="continue_with"
          locale="es"
          onSuccess={(res) => {
            if (res.credential) onCredential(res.credential);
            else onError("No pudimos validar tu cuenta de Google. Probá con tu email.");
          }}
          onError={() => onError("No pudimos validar tu cuenta de Google. Probá con tu email.")}
        />
      </div>
    </GoogleOAuthProvider>
  );
}
