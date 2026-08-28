import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { obtenerAnuncio } from "../api/client.js";
import { abrirLink, linkWhatsapp } from "../lib/links.js";

const ESTADO = {
  pendiente: { color: "var(--marigold)", texto: "En revisión" },
  aprobado: { color: "var(--teal)", texto: "Activo" },
  rechazado: { color: "var(--berry)", texto: "Rechazado" },
  expirado: { color: "var(--ink-soft)", texto: "Expirado" },
};

export default function AnuncioDetalle({ anuncioId, onVolver }) {
  const [anuncio, setAnuncio] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    setAnuncio(null);
    setError(null);
    obtenerAnuncio(anuncioId)
      .then(setAnuncio)
      .catch((e) => setError(e.message));
  }, [anuncioId]);

  function contactar() {
    const mensaje = `Hola, vi tu anuncio "${anuncio.titulo}" en Junín Anuncios y me interesa.`;
    abrirLink(linkWhatsapp(anuncio.whatsapp, mensaje));
  }

  return (
    <div style={{ minHeight: "100%", display: "flex", flexDirection: "column" }}>
      <BarraSuperior onVolver={onVolver} />

      {error && (
        <p style={{ padding: 16, color: "var(--berry)", fontSize: 14 }}>
          No se pudo cargar el anuncio: {error}
        </p>
      )}

      {!anuncio && !error && (
        <p style={{ padding: 16, color: "var(--ink-soft)", fontSize: 14 }}>Cargando…</p>
      )}

      {anuncio && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ padding: "8px 20px 100px", flex: 1 }}
        >
          <span
            style={{
              display: "inline-block",
              fontSize: 12.5,
              fontWeight: 600,
              color: "var(--terracota-ink)",
              background: "rgba(189, 79, 44, 0.14)",
              borderRadius: 6,
              padding: "4px 10px",
              marginBottom: 14,
            }}
          >
            {anuncio.categoria}
          </span>

          <h1
            style={{
              margin: "0 0 8px",
              fontFamily: "var(--font-display)",
              fontSize: 24,
              fontWeight: 800,
              lineHeight: 1.2,
            }}
          >
            {anuncio.titulo}
          </h1>

          <div
            style={{
              display: "flex",
              gap: 14,
              fontSize: 13,
              color: "var(--ink-soft)",
              marginBottom: 20,
            }}
          >
            <span>📍 {anuncio.distrito}</span>
            <span>{anuncio.fecha}</span>
            {ESTADO[anuncio.estado] && (
              <span style={{ color: ESTADO[anuncio.estado].color, fontWeight: 600 }}>
                {ESTADO[anuncio.estado].texto}
              </span>
            )}
          </div>

          <Seccion titulo="Descripción">
            <p style={estiloParrafo}>{anuncio.descripcion}</p>
          </Seccion>

          {anuncio.requisitos && (
            <Seccion titulo="Requisitos">
              <p style={estiloParrafo}>{anuncio.requisitos}</p>
            </Seccion>
          )}

          {anuncio.salario && (
            <Seccion titulo="Salario">
              <p style={estiloParrafo}>{anuncio.salario}</p>
            </Seccion>
          )}
        </motion.div>
      )}

      {anuncio && (
        <div
          style={{
            position: "sticky",
            bottom: 0,
            padding: "12px 20px calc(12px + env(safe-area-inset-bottom))",
            background: "linear-gradient(to top, var(--paper) 60%, transparent)",
          }}
        >
          <motion.button
            onClick={contactar}
            whileTap={{ scale: 0.98 }}
            style={{
              width: "100%",
              padding: "14px 0",
              borderRadius: 12,
              border: "none",
              fontWeight: 700,
              fontSize: 15,
              color: "var(--paper)",
              background: "var(--teal)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              boxShadow: "var(--shadow-pin)",
            }}
          >
            💬 Contactar por WhatsApp
          </motion.button>
        </div>
      )}
    </div>
  );
}

function BarraSuperior({ onVolver }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "14px 16px 6px" }}>
      <button
        onClick={onVolver}
        aria-label="Volver"
        style={{
          border: "1px solid var(--line)",
          background: "var(--paper-raised)",
          borderRadius: 999,
          width: 34,
          height: 34,
          fontSize: 16,
          color: "var(--ink)",
        }}
      >
        ←
      </button>
    </div>
  );
}

function Seccion({ titulo, children }) {
  return (
    <div style={{ marginBottom: 18 }}>
      <h2
        style={{
          fontFamily: "var(--font-display)",
          fontSize: 13,
          fontWeight: 700,
          color: "var(--ink-soft)",
          margin: "0 0 6px",
          textTransform: "uppercase",
          letterSpacing: "0.03em",
        }}
      >
        {titulo}
      </h2>
      {children}
    </div>
  );
}

const estiloParrafo = {
  margin: 0,
  fontSize: 14.5,
  lineHeight: 1.55,
  color: "var(--ink)",
  whiteSpace: "pre-wrap",
};
