import { motion } from "framer-motion";

const TABS = [
  { id: "inicio", label: "Inicio", icono: "🏠" },
  { id: "favoritos", label: "Favoritos", icono: "⭐" },
  { id: "publicar", label: "Publicar", icono: "➕" },
  { id: "perfil", label: "Perfil", icono: "👤" },
];

export default function BottomNav({ activa, onCambiar }) {
  return (
    <nav
      style={{
        position: "sticky",
        bottom: 0,
        display: "flex",
        justifyContent: "space-around",
        background: "var(--paper-raised)",
        borderTop: "1px solid var(--line)",
        padding: "8px 4px calc(8px + env(safe-area-inset-bottom))",
      }}
    >
      {TABS.map((tab) => {
        const esActiva = tab.id === activa;
        return (
          <button
            key={tab.id}
            onClick={() => onCambiar(tab.id)}
            style={{
              position: "relative",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 2,
              background: "none",
              border: "none",
              padding: "6px 12px",
              color: esActiva ? "var(--ink)" : "var(--ink-soft)",
              fontSize: 11,
              fontWeight: 600,
            }}
          >
            <span style={{ fontSize: 18 }}>{tab.icono}</span>
            {tab.label}
            {esActiva && (
              <motion.span
                layoutId="nav-indicador"
                style={{
                  position: "absolute",
                  bottom: -8,
                  width: 4,
                  height: 4,
                  borderRadius: "50%",
                  background: "var(--marigold)",
                }}
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
              />
            )}
          </button>
        );
      })}
    </nav>
  );
}
