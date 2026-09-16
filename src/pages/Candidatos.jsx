import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { listarCandidatos, listarCategorias, verCandidatosEscaner } from "../api/client.js";
import { abrirLink } from "../lib/links.js";
import { useSesion } from "../lib/auth.js";
import { SkeletonLinea, SkeletonLista } from "../components/Skeleton.jsx";
import CampoSelect from "../components/CampoSelect.jsx";

export default function Candidatos() {
  const { sesion } = useSesion();
  const [modo, setModo] = useState("escaner"); // 'escaner' (automático, gratis) | 'manual'
  const [categorias, setCategorias] = useState([]);
  const [categoria, setCategoria] = useState("");
  const [candidatos, setCandidatos] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    listarCategorias().then((d) => setCategorias(d.categorias));
  }, []);

  // Modo escáner: automático según las categorías de mis propios anuncios — gratis.
  useEffect(() => {
    if (modo !== "escaner" || !sesion) return;
    setCandidatos(undefined);
    setError(null);
    verCandidatosEscaner(sesion.usuarioId)
      .then((d) => setCandidatos(d.candidatos))
      .catch((e) => setError(e.message));
  }, [modo, sesion]);

  // Modo manual: filtro por categoría elegida a mano.
  useEffect(() => {
    if (modo !== "manual") return;
    if (!categoria) {
      setCandidatos(null);
      return;
    }
    setCandidatos(undefined);
    setError(null);
    listarCandidatos(categoria)
      .then((d) => setCandidatos(d.candidatos))
      .catch((e) => setError(e.message));
  }, [modo, categoria]);

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

      <div style={{ display: "flex", gap: 6, marginBottom: 12 }}>
        <TogglePill activo={modo === "escaner"} onClick={() => setModo("escaner")}>
          🔍 Escáner (gratis)
        </TogglePill>
        <TogglePill activo={modo === "manual"} onClick={() => setModo("manual")}>
          Buscar por categoría
        </TogglePill>
      </div>

      {modo === "escaner" && (
        <p style={{ fontSize: 11.5, color: "var(--ink-3)", marginBottom: 12 }}>
          Candidatos que calzan con las categorías de tus propios anuncios — gratis por promoción de lanzamiento.
        </p>
      )}

      {modo === "manual" && (
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
              color: "var(--brown-2)",
              fontWeight: 700,
              textTransform: "uppercase",
              marginBottom: 5,
            }}
          >
            Filtrar por categoría
          </label>
          <CampoSelect
            value={categoria}
            onChange={setCategoria}
            options={categorias}
            placeholder="Elige una categoría"
          />
        </div>
      )}

      {modo === "manual" && !categoria && (
        <p style={{ color: "var(--ink-3)", fontSize: 14, textAlign: "center", padding: "24px 0" }}>
          Elige una categoría para ver los candidatos disponibles.
        </p>
      )}

      {error && <MensajeVacio icono="⚠️" titulo="Error" sub={error} />}

      {!error && candidatos === undefined && <SkeletonLista n={3} Componente={SkeletonLinea} />}

      {!error && candidatos && candidatos.length === 0 && (
        <MensajeVacio
          icono="👤"
          titulo="Sin candidatos"
          sub={modo === "escaner" ? "Nadie calza todavía con las categorías de tus anuncios." : "No hay perfiles para esta categoría aún."}
        />
      )}

      {!error && candidatos && candidatos.length > 0 && (
        <AnimatePresence>
          {candidatos.map((c) => (
            <TarjetaCandidato key={c.usuario_id} candidato={c} />
          ))}
        </AnimatePresence>
      )}
    </div>
  );
}

function TogglePill({ activo, onClick, children }) {
  return (
    <button
      onClick={onClick}
      style={{
        flex: 1,
        border: `1.5px solid ${activo ? "var(--brown)" : "var(--parch-3)"}`,
        background: activo ? "var(--brown)" : "transparent",
        color: activo ? "var(--gold-2)" : "var(--ink-2)",
        borderRadius: "var(--radius-pill)",
        padding: "8px 10px",
        fontFamily: "var(--font-serif)",
        fontSize: 12.5,
        fontWeight: activo ? 600 : 400,
        cursor: "pointer",
      }}
    >
      {children}
    </button>
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
        position: "relative",
        background: "var(--parch-0)",
        border: `1.5px solid ${candidato.es_vip ? "var(--gold)" : "var(--parch-2)"}`,
        borderRadius: "var(--radius-md)",
        padding: 13,
        marginBottom: 9,
        boxShadow: candidato.es_vip ? "0 0 0 1px var(--gold-2), var(--shadow-sm)" : "var(--shadow-sm)",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 5 }}>
        <span style={{ fontFamily: "var(--font-heading)", fontSize: 13, fontWeight: 700, color: "var(--ink)" }}>
          👤 {candidato.nombre || "Candidato"}
        </span>
        {candidato.es_vip && (
          <span
            style={{
              background: "linear-gradient(135deg, var(--gold), var(--gold-2))",
              color: "var(--brown)",
              borderRadius: "var(--radius-pill)",
              padding: "1px 8px",
              fontSize: 9.5,
              fontWeight: 700,
              letterSpacing: 0.5,
            }}
          >
            ✨ VIP
          </span>
        )}
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
