/**
 * Abre un link externo (ej. wa.me) en una pestaña nueva.
 *
 * Antes esto pasaba por tg.openLink() porque la app corría dentro
 * del WebView de Telegram como Mini App — eso ya no aplica, ahora
 * es una PWA standalone, así que un window.open() normal basta.
 */
export function abrirLink(url) {
  window.open(url, "_blank", "noopener,noreferrer");
}
