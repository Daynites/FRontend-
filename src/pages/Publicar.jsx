import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { listarCategorias, listarDistritos, publicarAnuncio } from "../api/client.js";
import { useSesion } from "../lib/auth.js";
import BotonGoogle from "../components/BotonGoogle.jsx";

const VACIO = {
  categoria: "",
  distrito: "",
  titulo: "",
  descripcion: "",
  whatsapp: "",
  requisitos: "",
  salario: "",
};

export default function Publicar() {
  const { sesion, iniciarSesionConCredential } = useSesion();

  if (!sesion) {
    return (
      <div style={{ padding: "48px 24px", textAlign: "center" }}>
        <h2
          style={{
            fontFamily: "var(--font-display)",
            fontSize: 20,
            marginBottom: 6,
          }}
        >
          Inicia sesión para publicar
        </h2>
        <p style={{ color: "var(--ink-soft)", fontSize: 14, marginBottom: 24 }}>
          Así podemos avisarte cuando tu anuncio sea aprobado.
        </p>
        <div style={{ display: "flex", justifyContent: "center" }}>
          <BotonGoogle onCredential={iniciarSesionConCredential} />
        </div>
      </div>
    );
  }

  return <FormularioAnuncio usuarioId={sesion.usuarioId} />;
}

function FormularioAnuncio({ usuarioId }) {
  const [categorias, setCategorias] = useState([]);
  const [distritos, setDistritos] = useState([]);
  const [datos, setDatos] = useState(VACIO);
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState(null);
  const [enviado, setEnviado] = useState(null); // { anuncio_id }

  useEffect(() => {
    listarCategorias().then((d) => setCategorias(d.categorias));
    listarDistritos().then((d) => setDistritos(d.distritos));
  }, []);

  const actualizar = (campo) => (e) =>
    setDatos((prev) => ({ ...prev, [campo]: e.target.value }));

  const elegirCategoria = (categoria) =>
    setDatos((prev) => ({ ...prev, categoria }));

  const elegirDistrito = (distrito) =>
    setDatos((prev) => ({ ...prev, distrito }));

  const listoParaEnviar =
    datos.categoria && datos.distrito && datos.titulo.trim() && datos.descripcion.trim() && datos.whatsapp.trim();

  async function enviar(e) {
    e.preventDefault();
    if (!listoParaEnviar || enviando) return;
    setEnviando(true);
    setError(null);
    try {
      const res = await publicarAnuncio({ usuario_id: usuarioId, ...datos });
      setEnviado(res);
      setDatos(VACIO);
    } catch (err) {
      setError(err.message);
    } finally {
      setEnviando(false);
    }
  }

  if (enviado) {
    return <ConfirmacionEnvio onPublicarOtro={() => setEnviado(null)} />;
  }

  return (
    <form onSubmit={enviar} style={{ padding: "16px 16px 32px" }}>
      <header style={{ marginBottom: 18 }}>
        <h1
          style={{
            margin: "0 0 2px",
            fontFamily: "var(--font-display)",
            fontSize: 24,
            fontWeight: 800,
          }}
        >
          Publicar anuncio
        </h1>
        <p style={{ margin: 0, fontSize: 13, color: "var(--ink-soft)" }}>
          Se revisa antes de publicarse — normalmente toma poco.
        </p>
      </header>

      <Campo etiqueta="Categoría">
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          {categorias.map((cat) => (
            <ChipSeleccion
              key={cat}
              activa={cat === datos.categoria}
              onClick={() => elegirCategoria(cat)}
            >
              {cat}
            </ChipSeleccion>
          ))}
        </div>
      </Campo>

      <Campo etiqueta="Distrito">
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          {distritos.map((dist) => (
            <ChipSeleccion
              key={dist}
              activa={dist === datos.distrito}
              onClick={() => elegirDistrito(dist)}
            >
              {dist}
            </ChipSeleccion>
          ))}
        </div>
      </Campo>

      <Campo etiqueta="Título">
        <input
          style={estiloInput}
          value={datos.titulo}
          onChange={actualizar("titulo")}
          placeholder="Ej. Se busca soldador con experiencia"
          maxLength={80}
          required
        />
      </Campo>

      <Campo etiqueta="Descripción">
        <textarea
          style={{ ...estiloInput, minHeight: 90, resize: "vertical" }}
          value={datos.descripcion}
          onChange={actualizar("descripcion")}
          placeholder="Detalla en qué consiste, horario, condiciones…"
          required
        />
      </Campo>

      <Campo etiqueta="WhatsApp de contacto">
        <input
          style={estiloInput}
          value={datos.whatsapp}
          onChange={actualizar("whatsapp")}
          placeholder="9XXXXXXXX"
          inputMode="numeric"
          required
        />
      </Campo>

      <Campo etiqueta="Requisitos (opcional)">
        <input
          style={estiloInput}
          value={datos.requisitos}
          onChange={actualizar("requisitos")}
          placeholder="Ej. Con experiencia mínima de 1 año"
        />
      </Campo>

      <Campo etiqueta="Salario (opcional)">
        <input
          style={estiloInput}
          value={datos.salario}
          onChange={actualizar("salario")}
          placeholder="Ej. S/ 1200 - 1500"
        />
      </Campo>

      {error && (
        <p style={{ color: "var(--berry)", fontSize: 13.5, marginTop: -6 }}>
          No se pudo publicar: {error}
        </p>
      )}

      <motion.button
        type="submit"
        disabled={!listoParaEnviar || enviando}
        whileTap={listoParaEnviar ? { scale: 0.98 } : {}}
        style={{
          width: "100%",
          marginTop: 8,
          padding: "13px 0",
          borderRadius: 12,
          border: "none",
          fontWeight: 700,
          fontSize: 15,
          color: "var(--paper)",
          background: listoParaEnviar ? "var(--ink)" : "var(--line)",
          cursor: listoParaEnviar ? "pointer" : "not-allowed",
        }}
      >
        {enviando ? "Publicando…" : "Publicar anuncio"}
      </motion.button>
    </form>
  );
}

function ConfirmacionEnvio({ onPublicarOtro }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      style={{ padding: "56px 24px", textAlign: "center" }}
    >
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 260, damping: 16, delay: 0.05 }}
        style={{
          width: 56,
          height: 56,
          margin: "0 auto 16px",
          borderRadius: "50%",
          background: "var(--teal)",
          color: "var(--paper)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 26,
        }}
      >
        ✓
      </motion.div>
      <h2 style={{ fontFamily: "var(--font-display)", fontSize: 20, margin: "0 0 6px" }}>
        Anuncio enviado
      </h2>
      <p style={{ color: "var(--ink-soft)", fontSize: 14, marginBottom: 24 }}>
        Está en revisión. Te avisamos apenas se apruebe.
      </p>
      <button
        onClick={onPublicarOtro}
        style={{
          border: "1px solid var(--line)",
          background: "transparent",
          color: "var(--ink)",
          borderRadius: 10,
          padding: "10px 18px",
          fontWeight: 600,
          fontSize: 14,
        }}
      >
        Publicar otro anuncio
      </button>
    </motion.div>
  );
}

function Campo({ etiqueta, children }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <label
        style={{
          display: "block",
          fontSize: 12.5,
          fontWeight: 600,
          color: "var(--ink-soft)",
          marginBottom: 6,
        }}
      >
        {etiqueta}
      </label>
      {children}
    </div>
  );
}

function ChipSeleccion({ activa, onClick, children }) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      whileTap={{ scale: 0.95 }}
      style={{
        border: `1px solid ${activa ? "var(--terracota-ink)" : "var(--line)"}`,
        background: activa ? "rgba(189, 79, 44, 0.16)" : "transparent",
        color: activa ? "var(--terracota-ink)" : "var(--ink-soft)",
        borderRadius: 999,
        padding: "6px 12px",
        fontSize: 13,
        fontWeight: 600,
      }}
    >
      {children}
    </motion.button>
  );
}

const estiloInput = {
  width: "100%",
  border: "1px solid var(--line)",
  borderRadius: 10,
  padding: "10px 12px",
  fontSize: 14,
  fontFamily: "var(--font-body)",
  background: "var(--paper-raised)",
  color: "var(--ink)",
};
