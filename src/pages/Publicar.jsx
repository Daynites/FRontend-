import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { listarCategorias, listarDistritos, publicarAnuncio, subirComprobante } from "../api/client.js";
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
        <h2 style={{ fontFamily: "var(--font-heading)", fontSize: 20, marginBottom: 6 }}>
          Inicia sesión para publicar
        </h2>
        <p style={{ color: "var(--ink-3)", fontSize: 14, marginBottom: 24 }}>
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
  const [comprobante, setComprobante] = useState(null); // File
  const [previewComprobante, setPreviewComprobante] = useState(null); // object URL
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState(null);
  const [enviado, setEnviado] = useState(null); // { anuncio_id }

  useEffect(() => {
    listarCategorias().then((d) => setCategorias(d.categorias));
    listarDistritos().then((d) => setDistritos(d.distritos));
  }, []);

  const actualizar = (campo) => (e) =>
    setDatos((prev) => ({ ...prev, [campo]: e.target.value }));

  function alElegirComprobante(e) {
    const archivo = e.target.files[0];
    if (previewComprobante) URL.revokeObjectURL(previewComprobante);
    if (!archivo) {
      setComprobante(null);
      setPreviewComprobante(null);
      return;
    }
    setComprobante(archivo);
    setPreviewComprobante(URL.createObjectURL(archivo));
  }

  useEffect(() => {
    return () => {
      if (previewComprobante) URL.revokeObjectURL(previewComprobante);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const listoParaEnviar =
    datos.categoria &&
    datos.distrito &&
    datos.titulo.trim() &&
    datos.descripcion.trim() &&
    datos.whatsapp.trim() &&
    comprobante;

  async function enviar(e) {
    e.preventDefault();
    if (!listoParaEnviar || enviando) return;
    setEnviando(true);
    setError(null);
    try {
      const res = await publicarAnuncio({ usuario_id: usuarioId, ...datos });
      try {
        await subirComprobante(res.anuncio_id, comprobante);
        setEnviado({ ...res, comprobanteSubido: true });
      } catch {
        // El anuncio ya se creó — no perdemos eso aunque falle la
        // imagen. Se puede reintentar subiéndola desde Mis Anuncios
        // cuando esa función exista ahí también.
        setEnviado({ ...res, comprobanteSubido: false });
      }
      setDatos(VACIO);
      if (previewComprobante) URL.revokeObjectURL(previewComprobante);
      setComprobante(null);
      setPreviewComprobante(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setEnviando(false);
    }
  }

  if (enviado) {
    return <ConfirmacionEnvio onPublicarOtro={() => setEnviado(null)} comprobanteSubido={enviado.comprobanteSubido} />;
  }

  return (
    <form onSubmit={enviar} style={{ padding: "14px 14px 32px" }}>
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
          📢 Nuevo anuncio
        </span>
        <span style={{ flex: 1, height: 1, background: "linear-gradient(to right, var(--parch-3), transparent)" }} />
      </div>

      <div
        style={{
          background: "var(--parch-0)",
          border: "1.5px solid var(--parch-2)",
          borderRadius: "var(--radius-md)",
          padding: 14,
          marginBottom: 12,
          boxShadow: "var(--shadow-sm)",
        }}
      >
        <Campo etiqueta="Categoría">
          <select style={estiloInput} value={datos.categoria} onChange={actualizar("categoria")} required>
            <option value="" disabled>
              Elige una categoría
            </option>
            {categorias.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </Campo>

        <Campo etiqueta="Distrito">
          <select style={estiloInput} value={datos.distrito} onChange={actualizar("distrito")} required>
            <option value="" disabled>
              Elige un distrito
            </option>
            {distritos.map((dist) => (
              <option key={dist} value={dist}>
                {dist}
              </option>
            ))}
          </select>
        </Campo>

        <Campo etiqueta="Título del puesto">
          <input
            style={estiloInput}
            value={datos.titulo}
            onChange={actualizar("titulo")}
            placeholder="Ej: Operario Minero, Mesero…"
            maxLength={80}
            required
          />
        </Campo>

        <Campo etiqueta="Descripción">
          <textarea
            style={{ ...estiloInput, height: 85, resize: "none" }}
            value={datos.descripcion}
            onChange={actualizar("descripcion")}
            placeholder="Horario, beneficios, detalles…"
            required
          />
        </Campo>

        <Campo etiqueta="Requisitos (opcional)">
          <textarea
            style={{ ...estiloInput, height: 70, resize: "none" }}
            value={datos.requisitos}
            onChange={actualizar("requisitos")}
            placeholder="Experiencia, documentos…"
          />
        </Campo>

        <Campo etiqueta="Salario (opcional)">
          <input
            style={estiloInput}
            value={datos.salario}
            onChange={actualizar("salario")}
            placeholder="Ej: S/ 1,200 o Según convenio"
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

        <Campo etiqueta="Comprobante de pago" ultimo>
          <input
            type="file"
            accept="image/png,image/jpeg,image/webp"
            onChange={alElegirComprobante}
            style={{ ...estiloInput, padding: "7px 10px" }}
            required
          />
          <p style={{ fontSize: 11, color: "var(--ink-3)", margin: "5px 0 0" }}>
            Foto o captura de tu Yape/Plin/transferencia. Sin comprobante, el anuncio no se revisa.
          </p>
          {previewComprobante && (
            <img
              src={previewComprobante}
              alt="Vista previa del comprobante"
              style={{
                marginTop: 8,
                maxWidth: 160,
                maxHeight: 160,
                borderRadius: "var(--radius-sm)",
                border: "1.5px solid var(--parch-2)",
                display: "block",
              }}
            />
          )}
        </Campo>
      </div>

      {error && (
        <p style={{ color: "var(--red-andino)", fontSize: 13.5, marginTop: -4, marginBottom: 10 }}>
          No se pudo publicar: {error}
        </p>
      )}

      <motion.button
        type="submit"
        disabled={!listoParaEnviar || enviando}
        whileTap={listoParaEnviar ? { scale: 0.98 } : {}}
        style={{
          width: "100%",
          border: "none",
          borderRadius: "var(--radius-pill)",
          padding: 14,
          color: "#fff",
          fontFamily: "var(--font-heading)",
          fontSize: 14,
          fontWeight: 700,
          letterSpacing: 1,
          background: listoParaEnviar
            ? "linear-gradient(135deg, var(--green) 0%, var(--green-2) 100%)"
            : "var(--parch-3)",
          boxShadow: listoParaEnviar ? "0 4px 14px rgba(30,107,52,.3)" : "none",
          cursor: listoParaEnviar ? "pointer" : "not-allowed",
        }}
      >
        {enviando ? "Publicando…" : "📢 Enviar para revisión"}
      </motion.button>
      <p style={{ fontSize: 11.5, color: "var(--ink-3)", textAlign: "center", marginTop: 10 }}>
        Tu anuncio será aprobado por el equipo Daynite antes de publicarse.
      </p>
    </form>
  );
}

function ConfirmacionEnvio({ onPublicarOtro, comprobanteSubido }) {
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
          background: comprobanteSubido ? "var(--green)" : "var(--gold)",
          color: "#fff",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 26,
        }}
      >
        {comprobanteSubido ? "✓" : "⚠️"}
      </motion.div>
      <h2 style={{ fontFamily: "var(--font-heading)", fontSize: 20, margin: "0 0 6px" }}>
        {comprobanteSubido ? "Anuncio enviado" : "Anuncio creado"}
      </h2>
      <p style={{ color: "var(--ink-3)", fontSize: 14, marginBottom: 24 }}>
        {comprobanteSubido
          ? "Está en revisión. Te avisamos apenas se apruebe."
          : "El comprobante no se pudo subir. Contacta a soporte desde tu Perfil para completarlo — sin eso no se revisa."}
      </p>
      <button
        onClick={onPublicarOtro}
        style={{
          border: "1.5px solid var(--parch-3)",
          background: "transparent",
          color: "var(--ink-2)",
          borderRadius: "var(--radius-pill)",
          padding: "10px 18px",
          fontFamily: "var(--font-serif)",
          fontWeight: 600,
          fontSize: 14,
          cursor: "pointer",
        }}
      >
        Publicar otro anuncio
      </button>
    </motion.div>
  );
}

function Campo({ etiqueta, ultimo, children }) {
  return (
    <div style={{ marginBottom: ultimo ? 0 : 10 }}>
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
        {etiqueta}
      </label>
      {children}
    </div>
  );
}

const estiloInput = {
  width: "100%",
  background: "#fff",
  border: "1.5px solid var(--parch-2)",
  borderRadius: "var(--radius-sm)",
  padding: "9px 12px",
  fontFamily: "var(--font-serif)",
  fontSize: 13,
  color: "var(--ink)",
  outline: "none",
};
