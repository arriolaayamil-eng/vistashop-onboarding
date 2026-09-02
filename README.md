# VistaShop Onboarding

Vas a construir el frontend de la pantalla de suscripción de VistaShop — el flujo por el que un
comerciante se da de alta y paga $99 USD/mes. Es un proyecto de producción real, no un ejercicio.

Rol y alcance — leé esto primero

Vos construís SOLO el frontend. El backend (Express + MongoDB) ya existe, ya está en producción, y
ya fue verificado de punta a punta contra datos reales. Vos NO tocás nada de eso.

Prohibido terminantemente en este proyecto:





Supabase, Firebase, cualquier backend-as-a-service.



AWS, Vercel Functions, Netlify Functions, cualquier función serverless.



Cualquier base de datos (ni siquiera "para probar").



Auth propio, tokens propios, lógica de sesión propia — la sesión la resuelve la API real.



Server functions, persistencia de cualquier tipo del lado del build.



Almacenamiento en la nube (S3, Cloudinary, lo que sea) para imágenes.



Llamadas a APIs externas que no sean las 6 que te doy abajo (nada de Google Maps, nada de
verificación de mail por tu cuenta, nada de terceros que se te ocurran para "mejorar" el flujo).

Si te parece que falta algo para que la pantalla funcione "de verdad" (por ejemplo, enviar el mail del
enlace mágico), NO lo implementes vos: es responsabilidad del backend, que ya lo hace. Tu trabajo termina
en la llamada HTTP.

Stack





React + TypeScript + Vite + Tailwind + shadcn/ui.



Multi-página con ruteo file-based (no todo en un componente).



Mobile-first — el 70% de los comerciantes va a entrar desde el celular.



SEO básico por página (title, meta description, og:tags, lang="es") en la Landing únicamente (las
pantallas siguientes están detrás del inicio del flujo, no necesitan indexarse).



Capa de datos — un solo cliente API

Todo el flujo pega contra una API real que ya existe. Armá:





src/lib/api/client.ts: un apiFetch(path, options) único, que arma la URL con
import.meta.env.VITE_API_BASE_URL (viene de .env, no lo hardcodees), maneja JSON, y expone los
errores del backend ({ error: "..." }) de forma que la UI los pueda mostrar tal cual — son mensajes
ya pensados para mostrarse a un usuario real, no los reescribas.



src/lib/api/suscripcion.ts: las 6 funciones tipadas que llaman a los endpoints de abajo. Nada de
lógica de negocio acá — arman el request y devuelven la respuesta.



Mientras no tengas VITE_API_BASE_URL configurada (desarrollo visual, antes de conectar), estas
funciones devuelven datos mock con LA MISMA FORMA que la respuesta real documentada abajo — así el
swap a la API real cuando esté la URL es cambiar una variable de entorno, no reescribir componentes.



Los 6 endpoints reales — contrato exacto

Base: VITE_API_BASE_URL + /gondola-suscripcion o /account (van bajo el mismo dominio de API).

1. GET /gondola-suscripcion/terminos
Sin body. Devuelve { documentos: [...] } — para la suscripción son exactamente 2 documentos:
"Términos del servicio" y "Tratamiento de datos personales" (existe un tercer documento, "Condiciones
de compra", pero es del flujo del COMPRADOR — no aparece en esta respuesta, no lo agregues vos). Cada
item tiene esta forma: { documento, version, titulo, url, aceptado: false, borrador } — el campo
documento (valores "servicio" / "datos") es la clave que después usás para armar acepta en el
checkout. Renderá una casilla por documento, ninguna marcada por default (siempre llega
aceptado: false) — es requisito legal (I-11), no lo cambies aunque parezca mejor UX tenerlas
premarcadas. Si algún documento viene con borrador: true, el texto legal todavía es un placeholder
(BH-19) — no es un bug tuyo, no bloquees el flujo por eso. Llamalo al entrar a la pantalla de Pago.

2. POST /account/login (Google)
Body: el credential que devuelve el botón de Google (Google Identity Services / One Tap). Devuelve
{ accessToken, profile: { name, email, picture, role } }. Este es el botón primario de la pantalla
"Cuenta". Usá el SDK oficial de Google (@react-oauth/google o el script de Google Identity) — no
armes un botón que solo parezca de Google.

3. POST /account/enlace (fallback sin Google)
Body: { email, rol: "comerciante" }. Devuelve { enviado: true, expiraEn }. Es el botón secundario
"Continuar con tu email" — dispara un enlace mágico al correo. Mostrá un estado "revisá tu correo,
vence en 10 minutos" después de este call, no un formulario de código (esto NO es como el comprador,
que usa un código de 6 dígitos — el comerciante usa un link).

4. POST /account/enlace/verificar
Body: { token } (viene en la URL cuando el comerciante clickea el enlace del mail, como
?t=xxxxx). Devuelve { accessToken, profile }. Esta pantalla es la que se abre cuando alguien entra
desde el link del mail — necesitás una ruta tipo /entrar que lea el query param t y dispare esto
automáticamente al montar, mostrando un spinner mientras tanto.

5. POST /gondola-suscripcion/checkout
Body: { email, nombreComercio, tarjeta, acepta, visita }.





email: viene de la sesión ya iniciada (paso Cuenta).



nombreComercio: el único campo de la pantalla "Tu negocio".



tarjeta: un string, no un objeto — el token que devuelve el SDK Web de Mercado Pago después
de tokenizar la tarjeta en el navegador (ver la pantalla de Pago más abajo). El servidor nunca recibe
número, vencimiento ni CVV.



acepta: objeto con las claves exactas { servicio: true, datos: true } — construido dinámicamente
a partir del campo documento de cada item que devolvió /terminos (punto 1), no lo hardcodees.



visita: un id que generás vos en el cliente al entrar a la Landing (crypto.randomUUID(), guardado
en memoria/sessionStorage del lado de la app — no es dato de negocio, es tracking de funnel) y que
reusás en este call y en el punto 6.

Devuelve 202 con { id, ...} — es el id de la suscripción, NO hay comercio todavía. Nunca
muestres "tu tienda está lista" apenas llega esta respuesta.

6. GET /gondola-suscripcion/:id
Sin body. Devuelve { id, estado, slug, listo, ciclo, ultimoPago }. Llamalo en loop (cada 2-3
segundos, con un timeout razonable tipo 60 segundos) desde que termina el checkout. listo: true es
la única señal correcta de que el comercio existe — no lo infieras de estado. Cuando listo sea
true, slug es el subdominio real del comercio: ahí recién mostrás la pantalla de Confirmación.

Extra, sin bloquear el flujo: POST /gondola-suscripcion/visita con { visita, origen } —
disparalo (fire-and-forget, sin esperar respuesta ni mostrar nada) cuando alguien entra a la Landing.
Es tracking del embudo, no bloquea nada si falla.

Las 5 pantallas



1. Landing (pública, sin login)





Precio visible arriba: "$99 USD/mes, cobrado en pesos al día" — nunca escondas el precio para
"generar la llamada". El que entra ya sabe cuánto cuesta o se va.



Video autoplay, muteado, en loop, del recorrido de compra (usá <ImgSlot data-img-ref="#1 — video del recorrido de compra en VistaShop" alt="Recorrido de compra"> como placeholder — no generes ni
busques un video vos, el equipo lo integra después).



3 bullets de valor, en este orden y con esta idea, no la cambies:





Vendés más por pedido (nunca "tenés una tienda online" — ese ángulo ya lo cubre la competencia

más barata; el argumento acá es que el cliente arma un pedido más grande recorriendo, no
 buscando).



Tu propia dirección web.



Cobrás como ya cobrás (sin fricción de medio de pago nuevo).



Un solo CTA primario: "Empezar ahora". Sticky en mobile (fijo abajo al scrollear). Sin CTA
secundario, sin "conocé más", sin comparativas.



Palabras prohibidas en cualquier copy de esta pantalla o de todo el flujo: 3D, inmersivo,
metaverso, experiencia cinematográfica. Y cero testimonios o números de "comercios ya usando
VistaShop" — no hay data real todavía, inventar prueba social acá es mentir.



2. Cuenta





"Continuar con Google" — botón primario, un toque, endpoint 2.



"Continuar con tu email" — secundario, endpoint 3, sin contraseña nunca.



Nada de formulario de registro clásico (nombre + mail + contraseña + confirmar contraseña). Si
Lovable por default te arma eso, sacalo.



3. Tu negocio





Un solo campo: nombre del comercio. Nada más en esta pantalla — rubro, dirección, horarios,
zonas de entrega se completan DESPUÉS del pago, en el panel (fuera del alcance de este prompt).



CTA: "Continuar al pago".



4. Pago





Resumen de precio en pesos (llamada real a la API para la cotización — si no está conectada,
mock con un valor de ejemplo claramente marcado como tal en un comentario).



El formulario de tarjeta NO es un <input> tuyo. Integrá el SDK Web de Mercado Pago
(https://sdk.mercadopago.com/js/v2, o el paquete @mercadopago/sdk-react) usando una clave pública
de prueba en VITE_MP_PUBLIC_KEY. El SDK renderiza los campos de número/vencimiento/CVV en iframes
seguros de Mercado Pago —no son inputs tuyos, se estilizan solo con las opciones que da el SDK— y al
submitear devuelve un token (string). Ese token es el valor que va en tarjeta del checkout (punto
5): el servidor de Agentika nunca recibe el número de tarjeta. Es el mismo criterio que el botón de
Google del paso 2 — un SDK que corre en el cliente, no backend, no rompe la regla de "solo frontend".



Dos casillas separadas, ninguna premarcada, generadas desde /terminos (ver endpoint 1).



Microcopy de confianza: candado, "procesado de forma segura por Mercado Pago" (acá sí lo nombrás — es
quien tokeniza la tarjeta, es información real y esperable en un checkout), "cancelás cuando quieras".



CTA con el precio adentro: "Confirmar suscripción — $99/mes".



5. Confirmación (con espera intermedia — ver punto 6 de los endpoints)





Al tocar "Confirmar suscripción": pantalla de espera ("Estamos creando tu tienda…") con polling a
GET /gondola-suscripcion/:id. No es un loader de 1 segundo — puede tardar. Diseñalo para que no se
sienta roto a los 5, 10, 20 segundos (mensaje que cambia o progress indicativo, no una barra de
progreso falsa que promete un tiempo que no controlás).



Cuando listo: true: muestra el link real del subdominio (slug de la respuesta), un botón para
compartir por WhatsApp, y el CTA primario "Entrar a mi panel".



Si pasan 60 segundos sin listo: true: no digas que falló (puede estar procesando el pago todavía)
— mostrá que puede tardar unos minutos y que le llega un mail de confirmación, con un link para
volver a esta misma pantalla más tarde (guardá el id en la URL, no solo en memoria).



Estructura del código





src/mocks/data.ts — todos los datos de ejemplo aislados acá, con la misma forma que las respuestas
reales documentadas arriba.



src/lib/api/client.ts, src/lib/api/suscripcion.ts — como se especificó.



Componentes reusables entre pantallas (el layout con el logo "VistaShop — Powered by Agentika", el
stepper de progreso si lo usás, los botones de CTA).



Sin estética definida todavía — usá espaciado y tipografía neutros, prolijos, sin decidir paleta de
colores ni tipografía final. Eso se define en una pasada aparte una vez que esté la referencia visual.



Checklist antes de entregar





Cero dependencias de las prohibidas (Supabase/Firebase/AWS/Vercel-Netlify functions/Clerk-Auth0/DB).



Las 6 llamadas a la API están en src/lib/api/suscripcion.ts, tipadas, con mocks de la misma forma.



La pantalla 5 tiene el estado de espera con polling, no una transición instantánea.



La pantalla 3 tiene un solo campo.



El formulario de tarjeta usa el SDK de Mercado Pago (iframes del SDK) — cero inputs propios de

número/vencimiento/CVV, cero de esos datos viajando al backend de Agentika.



Cero apariciones de "3D", "inmersivo", "metaverso", "experiencia cinematográfica".



Cero testimonios, cero contadores de comercios, cero prueba social inventada.



Precio ($99/mes) visible en la Landing y en el CTA de pago, nunca escondido hasta el último paso.



Mobile-first verificado (probá el flujo completo en viewport de celular).

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/623a7505-3794-41e8-88c9-4c77b463c536).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
