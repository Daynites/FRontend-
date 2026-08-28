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

/** Arma un link wa.me a partir del número guardado (asume Perú, +51). */
export function linkWhatsapp(numero, mensaje) {
  const digitos = numero.replace(/\D/g, "");
  const conPrefijo = digitos.startsWith("51") ? digitos : `51${digitos}`;
  const texto = encodeURIComponent(mensaje);
  return `https://wa.me/${conPrefijo}?text=${texto}`;
}
