import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { obtenerAnuncio } from "../api/client.js";
import { abrirLink, linkWhatsapp } from "../lib/links.js";

const ESTADO = {
  pendiente: { color: "var(--gold)", texto: "En revisión" },
  aprobado: { color: "var(--green)", texto: "Activo" },
  rechazado: { color: "var(--red-andino)", texto: "Rechazado" },
  expirado: { color: "var(--ink-3)", texto: "Expirado" },
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
    <div style={{ minHeight: "100%", display: "flex", flexDirection: "column", background: "var(--parch-0)" }}>
      <BarraSuperior onVolver={onVolver} />

      {error && (
        <p style={{ padding: 16, color: "var(--red-andino)", fontSize: 14 }}>
          No se pudo cargar el anuncio: {error}
        </p>
      )}

      {!anuncio && !error && (
        <p style={{ padding: 16, color: "var(--ink-3)", fontSize: 14 }}>Cargando…</p>
      )}

      {anuncio && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ flex: 1, paddingBottom: 100 }}
        >
          {/* Hero — mismo estilo que .modal-hero del prototipo */}
          <div
            style={{
              position: "relative",
              overflow: "hidden",
              margin: "0 12px 14px",
              borderRadius: "var(--radius-md)",
              padding: "16px 16px 16px 20px",
              background: "linear-gradient(135deg, var(--brown) 0%, var(--brown-3) 100%)",
            }}
          >
            <div
              aria-hidden="true"
              style={{
                position: "absolute",
                top: 0,
                bottom: 0,
                left: 0,
                width: 4,
                background:
                  "repeating-linear-gradient(to bottom, var(--gold) 0px, var(--gold) 6px, var(--red-andino) 6px, var(--red-andino) 12px)",
              }}
            />
            <div
              style={{
                fontFamily: "var(--font-heading)",
                fontSize: 9,
                letterSpacing: 2,
                color: "var(--gold-2)",
                textTransform: "uppercase",
                marginBottom: 5,
              }}
            >
              {anuncio.categoria}
            </div>
            <h1
              style={{
                margin: 0,
                fontFamily: "var(--font-heading)",
                fontSize: 17,
                fontWeight: 700,
                color: "var(--parch-1)",
                lineHeight: 1.3,
              }}
            >
              {anuncio.titulo}
            </h1>
            {ESTADO[anuncio.estado] && (
              <div
                style={{
                  marginTop: 6,
                  fontFamily: "var(--font-serif)",
                  fontSize: 12,
                  fontStyle: "italic",
                  color: ESTADO[anuncio.estado].color,
                  fontWeight: 600,
                }}
              >
                {ESTADO[anuncio.estado].texto}
              </div>
            )}
          </div>

          <div style={{ padding: "0 14px" }}>
            <InfoRow icono="📍" etiqueta="Distrito" valor={anuncio.distrito} />
            {anuncio.salario && <InfoRow icono="💰" etiqueta="Salario" valor={anuncio.salario} />}
            <InfoRow icono="📅" etiqueta="Publicado" valor={anuncio.fecha} ultimo />

            <SecLabel>📝 Descripción</SecLabel>
            <DescBox>{anuncio.descripcion}</DescBox>

            {anuncio.requisitos && (
              <>
                <SecLabel>✅ Requisitos</SecLabel>
                <DescBox>{anuncio.requisitos}</DescBox>
              </>
            )}
          </div>
        </motion.div>
      )}

      {anuncio && (
        <div
          style={{
            position: "sticky",
            bottom: 0,
            display: "flex",
            gap: 10,
            padding: "10px 14px calc(10px + env(safe-area-inset-bottom))",
            background: "linear-gradient(to top, var(--parch-0) 65%, transparent)",
          }}
        >
          <button
            onClick={onVolver}
            style={{
              background: "transparent",
              border: "1.5px solid var(--parch-3)",
              borderRadius: "var(--radius-pill)",
              padding: "11px 18px",
              fontFamily: "var(--font-serif)",
              fontSize: 13,
              color: "var(--ink-3)",
              cursor: "pointer",
            }}
          >
            ✕
          </button>
          <motion.button
            onClick={contactar}
            whileTap={{ scale: 0.98 }}
            style={{
              flex: 1,
              border: "none",
              borderRadius: "var(--radius-pill)",
              padding: "12px",
              fontFamily: "var(--font-serif)",
              fontWeight: 700,
              fontSize: 14,
              color: "#fff",
              background: "linear-gradient(135deg, #25d366, #128c7e)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              cursor: "pointer",
            }}
          >
            📲 Contactar WhatsApp
          </motion.button>
        </div>
      )}
    </div>
  );
}

function BarraSuperior({ onVolver }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "14px 16px 10px" }}>
      <button
        onClick={onVolver}
        aria-label="Volver"
        style={{
          border: "1.5px solid var(--parch-3)",
          background: "var(--parch-0)",
          borderRadius: 999,
          width: 34,
          height: 34,
          fontSize: 16,
          color: "var(--ink)",
          cursor: "pointer",
        }}
      >
        ←
      </button>
    </div>
  );
}

function InfoRow({ icono, etiqueta, valor, ultimo }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "flex-start",
        gap: 10,
        padding: "9px 0",
        borderBottom: ultimo ? "none" : "1px solid var(--parch-2)",
      }}
    >
      <span style={{ fontSize: 16, width: 22, flexShrink: 0, paddingTop: 1 }}>{icono}</span>
      <div>
        <div
          style={{
            fontFamily: "var(--font-heading)",
            fontSize: 10,
            letterSpacing: 0.5,
            textTransform: "uppercase",
            color: "var(--ink-3)",
          }}
        >
          {etiqueta}
        </div>
        <div style={{ fontFamily: "var(--font-serif)", fontSize: 13.5, fontWeight: 600, color: "var(--ink)", marginTop: 1 }}>
          {valor}
        </div>
      </div>
    </div>
  );
}

function SecLabel({ children }) {
  return (
    <div
      style={{
        fontFamily: "var(--font-heading)",
        fontSize: 10,
        letterSpacing: 2,
        color: "var(--gold)",
        textTransform: "uppercase",
        margin: "14px 0 6px",
      }}
    >
      {children}
    </div>
  );
}

function DescBox({ children }) {
  return (
    <div
      style={{
        background: "rgba(90,48,16,.05)",
        border: "1px solid var(--parch-2)",
        borderRadius: "var(--radius-sm)",
        padding: 12,
        fontFamily: "var(--font-serif)",
        fontSize: 13,
        color: "var(--ink-2)",
        lineHeight: 1.6,
        whiteSpace: "pre-wrap",
      }}
    >
      {children}
    </div>
  );
}
