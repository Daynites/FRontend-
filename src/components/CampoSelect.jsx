import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

/**
 * Reemplazo del <select> nativo — el nativo toma el tema oscuro del
 * sistema/navegador (se ve como un picker de Android, no como parte
 * de la app). Este se ve igual en cualquier dispositivo.
 */
export default function CampoSelect({ value, onChange, options, placeholder = "Elige una opción" }) {
  const [abierto, setAbierto] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (!abierto) return;
    function alTocarFuera(e) {
      if (ref.current && !ref.current.contains(e.target)) setAbierto(false);
    }
    document.addEventListener("mousedown", alTocarFuera);
    return () => document.removeEventListener("mousedown", alTocarFuera);
  }, [abierto]);

  const seleccionada = options.find((o) => (typeof o === "string" ? o === value : o.value === value));
  const etiquetaSeleccionada = seleccionada
    ? typeof seleccionada === "string"
      ? seleccionada
      : seleccionada.label
    : null;

  return (
    <div ref={ref} style={{ position: "relative" }}>
      <button
        type="button"
        onClick={() => setAbierto((a) => !a)}
        style={{
          width: "100%",
          background: "#fff",
          border: "1.5px solid var(--parch-2)",
          borderRadius: "var(--radius-sm)",
          padding: "9px 12px",
          fontFamily: "var(--font-serif)",
          fontSize: 13,
          color: etiquetaSeleccionada ? "var(--ink)" : "var(--ink-3)",
          textAlign: "left",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 8,
          cursor: "pointer",
        }}
      >
        <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {etiquetaSeleccionada || placeholder}
        </span>
        <motion.span
          animate={{ rotate: abierto ? 180 : 0 }}
          transition={{ duration: 0.15 }}
          style={{ flexShrink: 0, color: "var(--parch-3)", fontSize: 11 }}
        >
          ▼
        </motion.span>
      </button>

      <AnimatePresence>
        {abierto && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.98 }}
            transition={{ duration: 0.15 }}
            style={{
              position: "absolute",
              top: "calc(100% + 5px)",
              left: 0,
              right: 0,
              maxHeight: 240,
              overflowY: "auto",
              background: "var(--parch-0)",
              border: "1.5px solid var(--parch-2)",
              borderRadius: "var(--radius-md)",
              boxShadow: "var(--shadow-lg)",
              zIndex: 30,
            }}
          >
            {options.map((o) => {
              const val = typeof o === "string" ? o : o.value;
              const label = typeof o === "string" ? o : o.label;
              const activa = val === value;
              return (
                <div
                  key={val}
                  onClick={() => {
                    onChange(val);
                    setAbierto(false);
                  }}
                  style={{
                    padding: "10px 14px",
                    fontFamily: "var(--font-serif)",
                    fontSize: 13,
                    color: activa ? "var(--gold-2)" : "var(--ink)",
                    background: activa ? "var(--brown)" : "transparent",
                    fontWeight: activa ? 600 : 400,
                    cursor: "pointer",
                    borderBottom: "1px solid var(--parch-2)",
                  }}
                >
                  {label}
                </div>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
