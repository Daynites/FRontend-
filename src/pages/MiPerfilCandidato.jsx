import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { guardarPerfilCandidato, listarCategorias, listarDistritos, obtenerPerfilCandidato } from "../api/client.js";
import { useSesion } from "../lib/auth.js";
import BotonGoogle from "../components/BotonGoogle.jsx";

export default function MiPerfilCandidato() {
  const { sesion, iniciarSesionConCredential } = useSesion();

  if (!sesion) {
    return (
      <div style={{ padding: "48px 24px", textAlign: "center" }}>
        <h2 style={{ fontFamily: "var(--font-heading)", fontSize: 20, marginBottom: 6 }}>
          Mi Perfil de Candidato
        </h2>
        <p style={{ color: "var(--ink-3)", fontSize: 14, marginBottom: 24 }}>
          Inicia sesión para que las empresas puedan encontrarte.
        </p>
        <div style={{ display: "flex", justifyContent: "center" }}>
          <BotonGoogle onCredential={iniciarSesionConCredential} />
        </div>
      </div>
    );
  }

  return <PantallaCandidato usuarioId={sesion.usuarioId} />;
}

function PantallaCandidato({ usuarioId }) {
  const [perfil, setPerfil] = useState(undefined); // undefined = cargando, null = no tiene
  const [modoFormulario, setModoFormulario] = useState(false);

  useEffect(() => {
    obtenerPerfilCandidato(usuarioId)
      .then((d) => setPerfil(d.perfil ?? null))
      .catch(() => setPerfil(null));
  }, [usuarioId]);

  function alGuardar(nuevoPerfil) {
    setPerfil(nuevoPerfil);
    setModoFormulario(false);
  }

  return (
    <div style={{ padding: "14px 16px 32px" }}>
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
          🪪 Mi Perfil de Candidato
        </span>
        <span style={{ flex: 1, height: 1, background: "linear-gradient(to right, var(--parch-3), transparent)" }} />
      </div>

      {perfil === undefined && <p style={{ color: "var(--ink-3)", fontSize: 14 }}>Cargando…</p>}

      {perfil !== undefined && (!perfil || modoFormulario) && (
        <FormularioCandidato
          usuarioId={usuarioId}
          inicial={perfil}
          onGuardado={alGuardar}
          onCancelar={perfil ? () => setModoFormulario(false) : null}
        />
      )}

      {perfil !== undefined && perfil && !modoFormulario && (
        <VistaPerfil perfil={perfil} onEditar={() => setModoFormulario(true)} />
      )}
    </div>
  );
}

function VistaPerfil({ perfil, onEditar }) {
  const [reiniciando, setReiniciando] = useState(false);
  const categorias = perfil.categoria ? perfil.categoria.split(",").map((c) => c.trim()) : [];

  function eliminar() {
    if (!confirm("¿Seguro que quieres eliminar tu perfil de candidato?")) return;
    // NOTA: igual que en el prototipo estático, no hay endpoint para
    // borrar el perfil del servidor todavía — esto solo te devuelve al
    // formulario en blanco. Si guardas de nuevo, se sobrescribe.
    setReiniciando(true);
  }

  if (reiniciando) {
    return (
      <FormularioCandidato
        usuarioId={null}
        inicial={null}
        onGuardado={() => setReiniciando(false)}
        onCancelar={() => setReiniciando(false)}
        avisoAlAbrir="Formulario en blanco — guarda para reemplazar tu perfil anterior."
      />
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      style={{
        position: "relative",
        overflow: "hidden",
        background: "var(--parch-0)",
        border: "1.5px solid var(--parch-2)",
        borderRadius: "var(--radius-md)",
        padding: 16,
        boxShadow: "var(--shadow-md)",
      }}
    >
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: 3,
          background:
            "repeating-linear-gradient(90deg, var(--gold) 0px, var(--gold) 8px, var(--red-andino) 8px, var(--red-andino) 16px, var(--green) 16px, var(--green) 24px, var(--parch-2) 24px, var(--parch-2) 32px)",
        }}
      />

      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
        <div
          style={{
            width: 52,
            height: 52,
            flexShrink: 0,
            borderRadius: "50%",
            background: "linear-gradient(135deg, var(--gold), var(--brown-3))",
            border: "2px solid var(--gold-2)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 24,
          }}
        >
          👤
        </div>
        <div>
          <div style={{ fontFamily: "var(--font-heading)", fontSize: 15, fontWeight: 700, color: "var(--ink)" }}>
            Mi Perfil
          </div>
          <div style={{ fontFamily: "var(--font-serif)", fontSize: 13, color: "var(--ink-3)", fontStyle: "italic", marginTop: 2 }}>
            {perfil.puesto || "—"}
          </div>
        </div>
      </div>

      <div style={{ display: "flex", flexWrap: "wrap", gap: 5, marginBottom: 10 }}>
        {categorias.map((c) => (
          <span
            key={c}
            style={{
              background: "rgba(196,154,40,.15)",
              border: "1px solid rgba(196,154,40,.4)",
              borderRadius: "var(--radius-pill)",
              padding: "3px 10px",
              fontSize: 11,
              color: "var(--brown)",
              fontFamily: "var(--font-serif)",
            }}
          >
            {c}
          </span>
        ))}
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        {perfil.distrito && <FilaPerfil icono="📍" texto={perfil.distrito} />}
        {perfil.experiencia && <FilaPerfil icono="⏳" texto={perfil.experiencia} />}
        <FilaPerfil icono="📲" texto={perfil.whatsapp} />
      </div>

      <div style={{ display: "flex", gap: 8, marginTop: 14 }}>
        <BotonAccion onClick={onEditar} color="brown">
          ✏️ Editar perfil
        </BotonAccion>
        <BotonAccion onClick={eliminar} color="red" flexBasis={54}>
          🗑
        </BotonAccion>
      </div>
      <p style={{ fontSize: 11.5, color: "var(--ink-3)", textAlign: "center", marginTop: 10 }}>
        Tu perfil es visible para empresas que buscan candidatos.
      </p>
    </motion.div>
  );
}

function FilaPerfil({ icono, texto }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 7, fontFamily: "var(--font-serif)", fontSize: 13, color: "var(--ink-2)" }}>
      <span>{icono}</span>
      <span>{texto}</span>
    </div>
  );
}

function BotonAccion({ children, onClick, color, flexBasis }) {
  const fondo =
    color === "brown"
      ? "linear-gradient(135deg, var(--brown), var(--brown-3))"
      : "linear-gradient(135deg, var(--red-andino), #a83232)";
  return (
    <button
      onClick={onClick}
      style={{
        flex: flexBasis ? `0 0 ${flexBasis}px` : 1,
        border: "none",
        borderRadius: "var(--radius-pill)",
        padding: 12,
        color: "#fff",
        fontFamily: "var(--font-heading)",
        fontSize: 13,
        fontWeight: 700,
        cursor: "pointer",
        background: fondo,
      }}
    >
      {children}
    </button>
  );
}

const VACIO = { puesto: "", categorias: [], distrito: "", experiencia: "", whatsapp: "" };

function FormularioCandidato({ usuarioId, inicial, onGuardado, onCancelar, avisoAlAbrir }) {
  const { sesion } = useSesion();
  const idReal = usuarioId ?? sesion?.usuarioId;
  const [categoriasDisponibles, setCategoriasDisponibles] = useState([]);
  const [distritos, setDistritos] = useState([]);
  const [datos, setDatos] = useState(() =>
    inicial
      ? {
          puesto: inicial.puesto || "",
          categorias: inicial.categoria ? inicial.categoria.split(",").map((c) => c.trim()) : [],
          distrito: inicial.distrito || "",
          experiencia: inicial.experiencia === "No especificada" ? "" : inicial.experiencia || "",
          whatsapp: inicial.whatsapp || "",
        }
      : VACIO
  );
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    listarCategorias().then((d) => setCategoriasDisponibles(d.categorias));
    listarDistritos().then((d) => setDistritos(d.distritos));
  }, []);

  function alternarCategoria(cat) {
    setDatos((prev) => ({
      ...prev,
      categorias: prev.categorias.includes(cat)
        ? prev.categorias.filter((c) => c !== cat)
        : [...prev.categorias, cat],
    }));
  }

  const listo = datos.puesto.trim() && datos.categorias.length > 0 && datos.whatsapp.trim();

  async function enviar(e) {
    e.preventDefault();
    if (!listo || enviando) return;
    setEnviando(true);
    setError(null);
    try {
      const body = {
        categoria: datos.categorias.join(", "),
        puesto: datos.puesto.trim(),
        distrito: datos.distrito || "",
        experiencia: datos.experiencia.trim() || "No especificada",
        whatsapp: datos.whatsapp.trim(),
        resena: inicial?.resena || "",
      };
      await guardarPerfilCandidato(idReal, body);
      onGuardado(body);
    } catch (err) {
      setError(err.message);
    } finally {
      setEnviando(false);
    }
  }

  return (
    <form onSubmit={enviar}>
      {avisoAlAbrir && (
        <p style={{ fontSize: 12.5, color: "var(--ink-3)", marginBottom: 10, fontStyle: "italic" }}>{avisoAlAbrir}</p>
      )}

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
        <Campo etiqueta="Puesto / Cargo que buscas *">
          <input
            style={estiloInput}
            value={datos.puesto}
            onChange={(e) => setDatos((p) => ({ ...p, puesto: e.target.value }))}
            placeholder="Ej: Cocinero, Operario Minero, Vendedor…"
            required
          />
        </Campo>

        <Campo etiqueta="Categorías laborales * (selecciona las que apliquen)">
          <div style={{ display: "flex", flexWrap: "wrap", gap: 7 }}>
            {categoriasDisponibles.map((cat) => (
              <button
                type="button"
                key={cat}
                onClick={() => alternarCategoria(cat)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 5,
                  background: datos.categorias.includes(cat) ? "var(--brown)" : "var(--parch-1)",
                  border: `1.5px solid ${datos.categorias.includes(cat) ? "var(--brown)" : "var(--parch-3)"}`,
                  borderRadius: "var(--radius-pill)",
                  padding: "6px 12px",
                  fontFamily: "var(--font-serif)",
                  fontSize: 12,
                  color: datos.categorias.includes(cat) ? "var(--gold-2)" : "var(--ink-2)",
                  fontWeight: datos.categorias.includes(cat) ? 600 : 400,
                  cursor: "pointer",
                }}
              >
                {cat}
              </button>
            ))}
          </div>
        </Campo>

        <Campo etiqueta="Distrito (opcional)">
          <select
            style={estiloInput}
            value={datos.distrito}
            onChange={(e) => setDatos((p) => ({ ...p, distrito: e.target.value }))}
          >
            <option value="">Sin preferencia de distrito</option>
            {distritos.map((d) => (
              <option key={d} value={d}>
                📍 {d}
              </option>
            ))}
          </select>
        </Campo>

        <Campo etiqueta="Experiencia (opcional)">
          <textarea
            style={{ ...estiloInput, height: 70, resize: "none" }}
            value={datos.experiencia}
            onChange={(e) => setDatos((p) => ({ ...p, experiencia: e.target.value }))}
            placeholder="Ej: 2 años en cocina, manejo de caja registradora, atención al cliente…"
          />
        </Campo>

        <Campo etiqueta="WhatsApp de contacto *" ultimo>
          <input
            style={estiloInput}
            value={datos.whatsapp}
            onChange={(e) => setDatos((p) => ({ ...p, whatsapp: e.target.value }))}
            placeholder="9XXXXXXXX"
            inputMode="numeric"
            required
          />
        </Campo>
      </div>

      {error && (
        <p style={{ color: "var(--red-andino)", fontSize: 13.5, marginBottom: 10 }}>No se pudo guardar: {error}</p>
      )}

      <div style={{ display: "flex", gap: 8 }}>
        {onCancelar && (
          <button
            type="button"
            onClick={onCancelar}
            style={{
              border: "1.5px solid var(--parch-3)",
              background: "transparent",
              color: "var(--ink-2)",
              borderRadius: "var(--radius-pill)",
              padding: "12px 16px",
              fontFamily: "var(--font-serif)",
              fontSize: 13,
              cursor: "pointer",
            }}
          >
            Cancelar
          </button>
        )}
        <motion.button
          type="submit"
          disabled={!listo || enviando}
          whileTap={listo ? { scale: 0.98 } : {}}
          style={{
            flex: 1,
            border: "none",
            borderRadius: "var(--radius-pill)",
            padding: 12,
            color: "#fff",
            fontFamily: "var(--font-heading)",
            fontSize: 13,
            fontWeight: 700,
            letterSpacing: 0.5,
            background: listo ? "linear-gradient(135deg, var(--green) 0%, var(--green-2) 100%)" : "var(--parch-3)",
            cursor: listo ? "pointer" : "not-allowed",
          }}
        >
          {enviando ? "Guardando…" : "🪪 Guardar Perfil"}
        </motion.button>
      </div>
      <p style={{ fontSize: 11.5, color: "var(--ink-3)", textAlign: "center", marginTop: 10 }}>
        Las empresas podrán contactarte directamente por WhatsApp.
      </p>
    </form>
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
