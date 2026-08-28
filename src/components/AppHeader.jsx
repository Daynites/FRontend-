import FranjaAndina from "./FranjaAndina.jsx";

/**
 * Cabecera persistente en todas las pestañas: fondo de montañas,
 * logo con halo animado (brillo + anillo girando) y accesos rápidos
 * a alertas y perfil. Migrado del prototipo estático — por ahora la
 * campana es solo visual (sin datos de notificaciones todavía).
 */
export default function AppHeader({ onAbrirPerfil }) {
  return (
    <header
      style={{
        position: "relative",
        flexShrink: 0,
        minHeight: 150,
        padding: "12px 14px 8px",
        backgroundImage:
          "linear-gradient(180deg, rgba(13,7,0,.05) 0%, rgba(247,237,204,.10) 65%, rgba(247,237,204,.9) 100%), url('/assets/fondo_montanas.webp')",
        backgroundSize: "cover",
        backgroundPosition: "center 30%",
        borderBottom: "2px solid var(--parch-2)",
      }}
    >
      <FranjaAndina altura={3} />
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 8,
          paddingTop: 6,
        }}
      >
        <IconButton aria-label="Alertas">🔔</IconButton>

        <div style={{ flex: 1, display: "flex", justifyContent: "center" }}>
          <div
            style={{
              position: "relative",
              width: 128,
              height: 128,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <span
              aria-hidden="true"
              style={{
                position: "absolute",
                inset: -6,
                borderRadius: "50%",
                border: "2px dashed var(--gold-2)",
                opacity: 0.75,
                animation: "girar-halo 14s linear infinite",
              }}
            />
            <img
              src="/assets/logo_junin.webp"
              alt="Junín Anuncios · Daynite Startup"
              style={{
                width: 128,
                height: 128,
                objectFit: "contain",
                filter: "drop-shadow(0 4px 10px rgba(30,15,0,.45))",
                animation: "brillo-logo 3.4s ease-in-out infinite",
              }}
            />
          </div>
        </div>

        <IconButton aria-label="Perfil" onClick={onAbrirPerfil}>
          👤
        </IconButton>
      </div>

      <style>{`
        @keyframes girar-halo { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes brillo-logo {
          0%, 100% {
            filter: drop-shadow(0 4px 10px rgba(30,15,0,.45)) drop-shadow(0 0 3px rgba(232,200,74,.25));
            transform: scale(1);
          }
          50% {
            filter: drop-shadow(0 4px 10px rgba(30,15,0,.45)) drop-shadow(0 0 14px rgba(232,200,74,.8));
            transform: scale(1.035);
          }
        }
        @media (prefers-reduced-motion: reduce) {
          header img, header span[aria-hidden] { animation: none !important; }
        }
      `}</style>
    </header>
  );
}

function IconButton({ children, onClick, ...rest }) {
  return (
    <button
      onClick={onClick}
      style={{
        flexShrink: 0,
        width: 34,
        height: 34,
        borderRadius: "50%",
        border: "1.5px solid var(--parch-3)",
        background: "rgba(253,248,236,.7)",
        fontSize: 16,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        cursor: "pointer",
      }}
      {...rest}
    >
      {children}
    </button>
  );
}
