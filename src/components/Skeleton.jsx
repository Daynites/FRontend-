/**
 * Skeleton con efecto "shimmer" — reemplaza los "Cargando…" de texto
 * plano por una silueta que se parece a lo que va a aparecer. Se
 * siente mucho menos "colgado" mientras esperamos la respuesta del
 * backend.
 */
function Barra({ ancho = "100%", alto = 12, radio = 6, style }) {
  return (
    <div
      style={{
        width: ancho,
        height: alto,
        borderRadius: radio,
        background: "linear-gradient(90deg, var(--parch-2) 25%, var(--parch-1) 50%, var(--parch-2) 75%)",
        backgroundSize: "200% 100%",
        animation: "shimmer 1.4s ease-in-out infinite",
        ...style,
      }}
    />
  );
}

export function SkeletonCard() {
  return (
    <div
      style={{
        background: "var(--parch-0)",
        border: "1.5px solid var(--parch-2)",
        borderRadius: 6,
        padding: "14px 14px 12px",
      }}
    >
      <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
        <div style={{ flex: 1 }}>
          <Barra ancho="80%" alto={14} style={{ marginBottom: 7 }} />
          <Barra ancho="45%" alto={11} />
        </div>
        <Barra ancho={34} alto={34} radio="50%" style={{ flexShrink: 0 }} />
      </div>
      <Barra ancho="55%" alto={11} style={{ marginBottom: 14 }} />
      <div style={{ display: "flex", gap: 8 }}>
        <Barra ancho="100%" alto={38} radio={20} />
        <Barra ancho="100%" alto={38} radio={20} />
      </div>
      <style>{`
        @keyframes shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }
        @media (prefers-reduced-motion: reduce) {
          @keyframes shimmer { 0%,100% { background-position: 0 0; } }
        }
      `}</style>
    </div>
  );
}

export function SkeletonLinea() {
  return (
    <div
      style={{
        background: "var(--parch-0)",
        border: "1.5px solid var(--parch-2)",
        borderRadius: 12,
        padding: "12px 14px",
      }}
    >
      <Barra ancho="60%" alto={13} style={{ marginBottom: 8 }} />
      <Barra ancho="35%" alto={10} />
      <style>{`
        @keyframes shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }
      `}</style>
    </div>
  );
}

/** Lista de n skeletons con un pequeño espaciado, para listas de tarjetas o filas. */
export function SkeletonLista({ n = 3, Componente = SkeletonCard }) {
  return (
    <div style={{ display: "grid", gap: 12 }}>
      {Array.from({ length: n }, (_, i) => (
        <Componente key={i} />
      ))}
    </div>
  );
}
