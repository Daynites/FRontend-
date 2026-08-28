import { motion, useMotionValue, useTransform } from "framer-motion";
import FranjaAndina from "./FranjaAndina.jsx";

const COLOR_PIN = {
  aprobado: "var(--teal)",
  pendiente: "var(--marigold)",
  rechazado: "var(--berry)",
  expirado: "var(--ink-soft)",
};

const UMBRAL_SWIPE = 90;

/**
 * Tarjeta con look de "flyer pineado en un tablón", ahora con acento
 * andino: franja de rombos escalonados arriba (FranjaAndina) en vez
 * de un borde plano, y la categoría en terracota en vez de dorado.
 *
 * Swipe a la derecha = favorito (como en la versión anterior de la app).
 * Si no hay `onFavoritar`, la tarjeta simplemente no arrastra.
 */
export default function AnuncioCard({ anuncio, indice = 0, onClick, onFavoritar }) {
  const inclinacion = indice % 2 === 0 ? -0.6 : 0.6;
  const x = useMotionValue(0);
  const opacidadCorazon = useTransform(x, [0, UMBRAL_SWIPE], [0, 1]);
  const escalaCorazon = useTransform(x, [0, UMBRAL_SWIPE], [0.6, 1.1]);

  function alSoltar(_, info) {
    if (onFavoritar && info.offset.x > UMBRAL_SWIPE) {
      onFavoritar(anuncio.id);
    }
  }

  return (
    <div style={{ position: "relative" }}>
      {onFavoritar && (
        <motion.span
          aria-hidden="true"
          style={{
            position: "absolute",
            top: "50%",
            left: 14,
            translateY: "-50%",
            fontSize: 22,
            opacity: opacidadCorazon,
            scale: escalaCorazon,
            pointerEvents: "none",
          }}
        >
          ⭐
        </motion.span>
      )}

      <motion.article
        layout
        drag={onFavoritar ? "x" : false}
        dragDirectionLock
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={{ left: 0, right: 0.55 }}
        onDragEnd={alSoltar}
        style={{ x }}
        initial={{ opacity: 0, y: 14, rotate: 0 }}
        animate={{ opacity: 1, y: 0, rotate: inclinacion }}
        exit={{ opacity: 0, scale: 0.96 }}
        whileHover={{ rotate: 0, y: -3 }}
        whileTap={{ scale: 0.98 }}
        transition={{ type: "spring", stiffness: 340, damping: 28 }}
        onClick={onClick}
      >
        <div
          style={{
            position: "relative",
            background: "var(--paper-raised)",
            border: "1px solid var(--line)",
            borderRadius: "var(--radius-card)",
            boxShadow: "var(--shadow-pin)",
            overflow: "hidden",
            cursor: "pointer",
          }}
        >
          <FranjaAndina
            color={indice % 2 === 0 ? "var(--terracota)" : "var(--marigold)"}
          />

          <div style={{ position: "relative", padding: "16px 16px 16px" }}>
            <span
              aria-hidden="true"
              style={{
                position: "absolute",
                top: 4,
                left: 14,
                width: 8,
                height: 8,
                borderRadius: "50%",
                background: COLOR_PIN[anuncio.estado] ?? "var(--ink-soft)",
              }}
            />

            <span
              style={{
                display: "inline-block",
                fontFamily: "var(--font-body)",
                fontSize: 12,
                fontWeight: 600,
                letterSpacing: "0.02em",
                color: "var(--terracota-ink)",
                background: "rgba(189, 79, 44, 0.14)",
                borderRadius: 6,
                padding: "3px 8px",
                marginBottom: 10,
              }}
            >
              {anuncio.categoria}
            </span>

            <h3
              style={{
                margin: "0 0 4px",
                fontFamily: "var(--font-display)",
                fontSize: 18,
                fontWeight: 600,
                lineHeight: 1.25,
              }}
            >
              {anuncio.titulo}
            </h3>

            <p
              style={{
                margin: "0 0 10px",
                fontSize: 14,
                color: "var(--ink-soft)",
                lineHeight: 1.4,
              }}
            >
              {anuncio.descripcion}
            </p>

            <footer
              style={{
                display: "flex",
                justifyContent: "space-between",
                fontSize: 12.5,
                color: "var(--ink-soft)",
              }}
            >
              <span>📍 {anuncio.distrito}</span>
              <span>{anuncio.fecha}</span>
            </footer>
          </div>
        </div>
      </motion.article>
    </div>
  );
}
