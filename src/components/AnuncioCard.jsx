import { useState } from "react";
import { motion } from "framer-motion";
import { abrirLink, linkWhatsapp } from "../lib/links.js";

/**
 * Tarjeta "flyer de pergamino" — migrada del prototipo estático.
 * Antes esto se guardaba en favoritos deslizando la tarjeta; ahora
 * es un botón de pin 📌 explícito (más descubrible, y funciona igual
 * de bien con mouse que con dedo). "Postular" abre WhatsApp directo
 * con un mensaje precargado, sin pasar por el detalle.
 */
export default function AnuncioCard({
  anuncio,
  indice = 0,
  onClick,
  onGuardar,
  guardadoInicial = false,
}) {
  const [guardado, setGuardado] = useState(guardadoInicial);
  const [guardando, setGuardando] = useState(false);

  async function alTocarPin(e) {
    e.stopPropagation();
    if (!onGuardar || guardando) return;
    setGuardando(true);
    const nuevoEstado = !guardado;
    try {
      await onGuardar(anuncio.id, nuevoEstado);
      setGuardado(nuevoEstado);
    } finally {
      setGuardando(false);
    }
  }

  function postular(e) {
    e.stopPropagation();
    const mensaje = `Hola, me interesa el puesto de "${anuncio.titulo}" que vi en Junín Anuncios 👋`;
    abrirLink(linkWhatsapp(anuncio.whatsapp, mensaje));
  }

  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.96 }}
      whileTap={{ scale: 0.985 }}
      transition={{ type: "spring", stiffness: 340, damping: 30 }}
      onClick={onClick}
      style={{
        position: "relative",
        background: "url('/assets/card_marco.webp') center / 100% 100% no-repeat",
        borderRadius: 6,
        padding: "14px 14px 12px",
        boxShadow: "var(--shadow-md)",
        cursor: "pointer",
      }}
    >
      <div style={{ display: "flex", alignItems: "flex-start", gap: 8, marginBottom: 6 }}>
        <span
          style={{
            fontFamily: "var(--font-heading)",
            fontSize: 11,
            fontWeight: 700,
            color: "var(--parch-3)",
            flexShrink: 0,
            paddingTop: 2,
          }}
        >
          {String(indice + 1).padStart(2, "0")}.
        </span>

        <div style={{ flex: 1, minWidth: 0 }}>
          <h3
            style={{
              margin: 0,
              fontFamily: "var(--font-serif)",
              fontSize: 15,
              fontWeight: 600,
              color: "var(--ink)",
              lineHeight: 1.3,
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
            }}
          >
            {anuncio.titulo}
          </h3>
          <p
            style={{
              margin: "1px 0 0",
              fontFamily: "var(--font-serif)",
              fontSize: 12,
              fontStyle: "italic",
              color: "var(--ink-3)",
            }}
          >
            {anuncio.categoria}
          </p>
        </div>

        {onGuardar && (
          <button
            onClick={alTocarPin}
            aria-label={guardado ? "Quitar de favoritos" : "Guardar en favoritos"}
            aria-pressed={guardado}
            disabled={guardando}
            style={{
              flexShrink: 0,
              width: 34,
              height: 34,
              borderRadius: "50%",
              border: `1.5px solid ${guardado ? "var(--red-andino)" : "var(--parch-3)"}`,
              background: guardado ? "rgba(139,32,32,.08)" : "none",
              fontSize: 15,
              cursor: guardando ? "default" : "pointer",
              opacity: guardando ? 0.6 : 1,
            }}
          >
            📌
          </button>
        )}
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 3, marginBottom: 10 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12, color: "var(--ink-2)" }}>
          <span style={{ width: 16, textAlign: "center", fontSize: 13 }}>📍</span>
          {anuncio.distrito}
        </div>
        {anuncio.salario && (
          <div>
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 3,
                background: "rgba(30,107,52,.1)",
                border: "1px solid rgba(30,107,52,.25)",
                borderRadius: "var(--radius-pill)",
                padding: "2px 10px",
                fontSize: 12,
                color: "var(--green)",
                fontWeight: 600,
              }}
            >
              💰 {anuncio.salario}
            </span>
          </div>
        )}
      </div>

      <div style={{ display: "flex", gap: 8 }}>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onClick?.();
          }}
          style={{
            flex: 1,
            border: "none",
            background: "url('/assets/btn_tallado_dorado.webp') center / 100% 100% no-repeat",
            color: "var(--brown)",
            textShadow: "0 1px 1px rgba(255,255,255,.4)",
            fontFamily: "var(--font-heading)",
            fontSize: 11,
            fontWeight: 600,
            letterSpacing: 1,
            textTransform: "uppercase",
            padding: "12px 0",
            cursor: "pointer",
          }}
        >
          👁 Ver detalles
        </button>
        <button
          onClick={postular}
          style={{
            flex: 1,
            border: "none",
            background: "url('/assets/btn_tallado_bronce.webp') center / 100% 100% no-repeat",
            color: "var(--gold-3)",
            textShadow: "0 1px 2px rgba(0,0,0,.5)",
            fontFamily: "var(--font-heading)",
            fontSize: 11,
            fontWeight: 600,
            letterSpacing: 1,
            textTransform: "uppercase",
            padding: "12px 0",
            cursor: "pointer",
          }}
        >
          Postular
        </button>
      </div>
    </motion.article>
  );
}
