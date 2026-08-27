/**
 * Wrapper del SDK de Telegram Mini Apps.
 *
 * `tg` viene del script global (telegram-web-app.js, cargado en index.html),
 * no del paquete @twa-dev/sdk — ese paquete solo tipa/envuelve el mismo
 * objeto `window.Telegram.WebApp`, así que usamos el global directo para
 * evitar duplicar la carga.
 */
const tg = typeof window !== "undefined" ? window.Telegram?.WebApp : undefined;

export function iniciarApp() {
  if (!tg) return;
  tg.ready();
  tg.expand();
}

export function usuarioTelegram() {
  return tg?.initDataUnsafe?.user ?? null;
}

/**
 * Abre un link externo (ej. wa.me) de forma segura dentro de Telegram.
 *
 * Fix ya validado en producción (index.html actual): en Telegram Desktop,
 * el WebView embebido bloquea navegación a URLs externas cargadas por
 * window.open() (ERR_BLOCKED_BY_RESPONSE). tg.openLink() delega la
 * apertura al cliente de Telegram, que sí sabe abrir el link afuera.
 */
export function abrirLink(url) {
  if (tg?.openLink) {
    tg.openLink(url);
  } else {
    // Fallback fuera de Telegram (ej. probando en el navegador normal)
    window.open(url, "_blank", "noopener,noreferrer");
  }
}

export function tema() {
  return tg?.colorScheme ?? "light";
}

export default tg;
