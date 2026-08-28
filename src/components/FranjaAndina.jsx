/**
 * Franja de rombos escalonados — referencia directa al borde textil
 * de la interfaz anterior, pero como patrón SVG repetible en vez de
 * una imagen raster: nítido a cualquier tamaño, liviano, y se puede
 * recolorear con CSS var() en vez de exportar un asset por color.
 */
export default function FranjaAndina({ color = "var(--terracota)", altura = 6 }) {
  return (
    <svg
      width="100%"
      height={altura}
      viewBox="0 0 32 8"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true"
      style={{ display: "block" }}
    >
      <pattern id="rombos-andinos" width="16" height="8" patternUnits="userSpaceOnUse">
        <path d="M0 4 L4 0 L8 4 L4 8 Z" fill={color} />
        <path d="M8 4 L12 0 L16 4 L12 8 Z" fill={color} opacity="0.45" />
      </pattern>
      <rect width="100%" height="100%" fill="url(#rombos-andinos)" />
    </svg>
  );
}
