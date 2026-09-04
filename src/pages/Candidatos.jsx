import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { listarCandidatos, listarCategorias } from "../api/client.js";
import { abrirLink } from "../lib/links.js";

export default function Candidatos() {
  const [categorias, setCategorias] = useState([]);
  const [categoria, setCategoria] = useState("");
  const [candidatos, setCandidatos] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    listarCategorias().then((d) => setCategorias(d.categorias));
  }, []);

  useEffect(() => {
    if (!categoria) {
      setCandidatos(null);
      return;
    }
    setCandidatos(undefined); // cargando
    setError(null);
    listarCandidatos(categoria)
      .then((d) => setCandidatos(d.candidatos))
      .catch((e) => setError(e.message));
  }, [categoria]);

  return (
    <div style={{ padding: "14px 14px 32px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
        <span
          style={{
            fontFamily: "var(--font-heading)",
            fontSize: 10,
            letterSpacing: 2.5,
            color: "var(--gold)",
            textTransform: "uppercase",
          }}
        >
          👥 Candidatos
        </span>
        <span style={{ flex: 1, height: 1, background: "linear-gradient(to right, var(--parch-3), transparent)" }} />
      </div>

      <div
        style={{
          background: "var(--parch-0)",
          border: "1.5px solid var(--parch-2)",
          borderRadius: "var(--radius-md)",
          padding: 14,
          marginBottom: 14,
          boxShadow: "var(--shadow-sm)",
        }}
      >
        <label
          style={{
            display: "block",
            fontFamily: "var(--font-heading)",
            fontSize: 9.5,
            letterSpacing: 1.5,
            color: "var(--gold)",
            textTransform: "uppercase",
            marginBottom: 5,
          }}
        >
          Filtrar por categoría
        </label>
        <select
          value={categoria}
          onChange={(e) => setCategoria(e.target.value)}
          style={{
            width: "100%",
            background: "#fff",
            border: "1.5px solid var(--parch-2)",
            borderRadius: "var(--radius-sm)",
            padding: "9px 12px",
            fontFamily: "var(--font-serif)",
            fontSize: 13,
            color: "var(--ink)",
            outline: "none",
          }}
        >
          <option value="">Elige una categoría</option>
          {categorias.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
      </div>

      {!categoria && (
        <p style={{ color: "var(--ink-3)", fontSize: 14, textAlign: "center", padding: "24px 0" }}>
          Elige una categoría para ver los candidatos disponibles.
        </p>
      )}

      {categoria && error && (
        <MensajeVacio icono="⚠️" titulo="Error" sub={error} />
      )}

      {categoria && candidatos === undefined && !error && (
        <p style={{ color: "var(--ink-3)", fontSize: 14, textAlign: "center", padding: "24px 0" }}>
          Buscando candidatos…
        </p>
      )}

      {categoria && candidatos && candidatos.length === 0 && (
        <MensajeVacio icono="👤" titulo="Sin candidatos" sub="No hay perfiles para esta categoría aún." />
      )}

      {categoria && candidatos && candidatos.length > 0 && (
        <AnimatePresence>
          {candidatos.map((c, i) => (
            <TarjetaCandidato key={i} candidato={c} />
          ))}
        </AnimatePresence>
      )}
    </div>
  );
}

function TarjetaCandidato({ candidato }) {
  const numero = candidato.whatsapp
    ? candidato.whatsapp.startsWith("51")
      ? candidato.whatsapp
      : `51${candidato.whatsapp}`
    : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      style={{
        background: "var(--parch-0)",
        border: "1.5px solid var(--parch-2)",
        borderRadius: "var(--radius-md)",
        padding: 13,
        marginBottom: 9,
        boxShadow: "var(--shadow-sm)",
      }}
    >
      <div style={{ fontFamily: "var(--font-heading)", fontSize: 13, fontWeight: 700, color: "var(--ink)", marginBottom: 5 }}>
        👤 {candidato.nombre || "Candidato"}
      </div>
      <FilaCand icono="📂" texto={candidato.categoria} />
      {candidato.puesto && <FilaCand icono="💼" texto={candidato.puesto} />}
      <FilaCand icono="📍" texto={candidato.distrito} />
      <FilaCand icono="⏳" texto={candidato.experiencia} />
      {candidato.resena && (
        <p style={{ fontFamily: "var(--font-serif)", fontSize: 12, fontStyle: "italic", color: "var(--ink-3)", margin: "6px 0 0" }}>
          "{candidato.resena}"
        </p>
      )}
      {numero && (
        <button
          onClick={() => abrirLink(`https://wa.me/${numero}`)}
          style={{
            marginTop: 10,
            width: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 5,
            background: "linear-gradient(135deg, #25d366, #128c7e)",
            border: "none",
            borderRadius: "var(--radius-pill)",
            padding: 9,
            color: "#fff",
            fontFamily: "var(--font-serif)",
            fontSize: 12,
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          📲 Contactar por WhatsApp
        </button>
      )}
    </motion.div>
  );
}

function FilaCand({ icono, texto }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12, color: "var(--ink-2)", marginBottom: 3 }}>
      <span>{icono}</span>
      {texto}
    </div>
  );
}

function MensajeVacio({ icono, titulo, sub }) {
  return (
    <div style={{ textAlign: "center", padding: "32px 0" }}>
      <div style={{ fontSize: 44, marginBottom: 10 }}>{icono}</div>
      <div style={{ fontFamily: "var(--font-serif)", fontSize: 14, fontWeight: 600, color: "var(--ink-2)" }}>{titulo}</div>
      {sub && <div style={{ fontSize: 12, color: "var(--ink-3)", marginTop: 4 }}>{sub}</div>}
    </div>
  );
}
