/**
 * Cenefa andina — franja a rayas repetidas (rojo / oro / verde /
 * pergamino), igual a la del prototipo estático original. Se usa
 * como borde decorativo en la cabecera, el modal de detalle y el
 * bottom nav.
 *
 * Antes esto era un patrón de rombos en SVG; se reemplaza por esta
 * versión a rayas para calzar con el diseño de referencia (Fase 1).
 */
export default function FranjaAndina({ altura = 3 }) {
  return (
    <div
      aria-hidden="true"
      style={{
        width: "100%",
        height: altura,
        flexShrink: 0,
        background:
          "repeating-linear-gradient(90deg, var(--red-andino) 0px, var(--red-andino) 8px, var(--gold) 8px, var(--gold) 16px, var(--green) 16px, var(--green) 24px, var(--parch-2) 24px, var(--parch-2) 32px)",
      }}
    />
  );
}
