import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  agregarAlerta,
  eliminarAlerta,
  listarAlertas,
  listarCategorias,
  listarNotificaciones,
  marcarNotificacionesLeidas,
} from "../api/client.js";
import { useSesion } from "../lib/auth.js";

/**
 * Modal de Alertas + Notificaciones — se abre desde la campana 🔔 de
 * la cabecera. Migrado del prototipo estático (overlay-alertas).
 */
export default function AlertasOverlay({ onCerrar, onAbrirAnuncio }) {
  const { sesion } = useSesion();

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onCerrar}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 100,
        background: "rgba(0,0,0,.5)",
        display: "flex",
        alignItems: "flex-end",
        justifyContent: "center",
      }}
    >
      <motion.div
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        transition={{ type: "spring", stiffness: 300, damping: 32 }}
        onClick={(e) => e.stopPropagation()}
        style={{
          width: "100%",
          maxWidth: 430,
          maxHeight: "85vh",
          overflowY: "auto",
          background: "var(--parch-0)",
          borderRadius: "var(--radius-lg) var(--radius-lg) 0 0",
          paddingBottom: 24,
        }}
      >
        <div style={{ width: 38, height: 4, background: "var(--parch-3)", borderRadius: 2, margin: "10px auto" }} />

        {!sesion ? (
          <div style={{ padding: "32px 20px", textAlign: "center" }}>
            <p style={{ fontSize: 14, color: "var(--ink-2)", fontWeight: 600, marginBottom: 4 }}>
              🔒 Inicia sesión con Google
            </p>
            <p style={{ fontSize: 13, color: "var(--ink-3)" }}>para usar alertas y notificaciones.</p>
          </div>
        ) : (
          <Contenido usuarioId={sesion.usuarioId} onAbrirAnuncio={onAbrirAnuncio} onCerrar={onCerrar} />
        )}
      </motion.div>
    </motion.div>
  );
}

function Contenido({ usuarioId, onAbrirAnuncio, onCerrar }) {
  const [notificaciones, setNotificaciones] = useState(null);
  const [alertas, setAlertas] = useState(null);
  const [categorias, setCategorias] = useState([]);
  const [nuevaCategoria, setNuevaCategoria] = useState("");
  const [error, setError] = useState(null);

  useEffect(() => {
    listarCategorias().then((d) => setCategorias(d.categorias));
    listarNotificaciones(usuarioId)
      .then((d) => {
        setNotificaciones(d.notificaciones);
        // Al abrir el modal se dan por leídas, igual que el prototipo.
        return marcarNotificacionesLeidas(usuarioId);
      })
      .catch((e) => setError(e.message));
    listarAlertas(usuarioId)
      .then((d) => setAlertas(d.alertas))
      .catch(() => {});
  }, [usuarioId]);

  async function alAgregar() {
    if (!nuevaCategoria) return;
    try {
      await agregarAlerta(usuarioId, nuevaCategoria);
      const d = await listarAlertas(usuarioId);
      setAlertas(d.alertas);
      setNuevaCategoria("");
    } catch (e) {
      setError(e.message);
    }
  }

  async function alQuitar(alertaId) {
    try {
      await eliminarAlerta(usuarioId, alertaId);
      setAlertas((prev) => prev.filter((a) => a.id !== alertaId));
    } catch (e) {
      setError(e.message);
    }
  }

  return (
    <div style={{ padding: "0 14px" }}>
      <SecLabel>🔔 Notificaciones</SecLabel>

      {error && <p style={{ color: "var(--red-andino)", fontSize: 13 }}>{error}</p>}

      {notificaciones === null && !error && (
        <p style={{ color: "var(--ink-3)", fontSize: 13, padding: "10px 0" }}>Cargando…</p>
      )}

      {notificaciones && notificaciones.length === 0 && (
        <p style={{ color: "var(--ink-3)", fontSize: 13, padding: "10px 0" }}>No tienes notificaciones todavía.</p>
      )}

      {notificaciones &&
        notificaciones.map((n, i) => (
          <div
            key={i}
            onClick={() => {
              if (!n.anuncio_id) return;
              onCerrar();
              onAbrirAnuncio(n.anuncio_id);
            }}
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 2,
              padding: "9px 0",
              borderBottom: "1px solid var(--parch-2)",
              opacity: n.leido ? 0.6 : 1,
              cursor: n.anuncio_id ? "pointer" : "default",
            }}
          >
            <span style={{ fontWeight: 700, fontSize: 13, color: "var(--ink)" }}>{n.titulo}</span>
            <span style={{ fontSize: 12, color: "var(--ink-3)" }}>{n.mensaje}</span>
            <span style={{ fontSize: 10, color: "var(--ink-3)" }}>{tiempoRelativo(n.fecha)}</span>
          </div>
        ))}

      <Ornamento>✦ Categorías con alerta ✦</Ornamento>

      {alertas === null && <p style={{ color: "var(--ink-3)", fontSize: 13 }}>Cargando…</p>}
      {alertas && alertas.length === 0 && (
        <p style={{ color: "var(--ink-3)", fontSize: 13, padding: "10px 0" }}>No tienes alertas activas.</p>
      )}
      {alertas &&
        alertas.map((a) => (
          <div
            key={a.id}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "8px 0",
              borderBottom: "1px solid var(--parch-2)",
            }}
          >
            <span
              style={{
                fontFamily: "var(--font-serif)",
                fontSize: 13,
                fontWeight: 600,
                color: "var(--brown)",
              }}
            >
              {a.categoria}
            </span>
            <button
              onClick={() => alQuitar(a.id)}
              style={{
                border: "1px solid var(--parch-3)",
                background: "transparent",
                borderRadius: "var(--radius-pill)",
                padding: "4px 10px",
                fontSize: 11.5,
                color: "var(--red-andino)",
                cursor: "pointer",
              }}
            >
              ✕ Quitar
            </button>
          </div>
        ))}

      <Ornamento>✦ Agregar alerta ✦</Ornamento>

      <select
        value={nuevaCategoria}
        onChange={(e) => setNuevaCategoria(e.target.value)}
        style={{
          width: "100%",
          background: "#fff",
          border: "1.5px solid var(--parch-2)",
          borderRadius: "var(--radius-sm)",
          padding: "9px 12px",
          fontFamily: "var(--font-serif)",
          fontSize: 13,
          color: "var(--ink)",
          marginBottom: 8,
        }}
      >
        <option value="">Elige una categoría</option>
        {categorias.map((cat) => (
          <option key={cat} value={cat}>
            {cat}
          </option>
        ))}
      </select>
      <button
        onClick={alAgregar}
        disabled={!nuevaCategoria}
        style={{
          width: "100%",
          background: nuevaCategoria ? "linear-gradient(135deg, var(--green), var(--green-2))" : "var(--parch-3)",
          border: "none",
          borderRadius: "var(--radius-pill)",
          padding: 11,
          color: "#fff",
          fontFamily: "var(--font-serif)",
          fontSize: 13,
          fontWeight: 700,
          cursor: nuevaCategoria ? "pointer" : "not-allowed",
        }}
      >
        + Agregar Alerta
      </button>
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
        margin: "4px 0 8px",
      }}
    >
      {children}
    </div>
  );
}

function Ornamento({ children }) {
  return (
    <div
      style={{
        textAlign: "center",
        fontSize: 11,
        color: "var(--parch-3)",
        margin: "14px 0 8px",
        letterSpacing: 1,
      }}
    >
      {children}
    </div>
  );
}

function tiempoRelativo(fechaISO) {
  const diffMs = Date.now() - new Date(fechaISO).getTime();
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 1) return "recién";
  if (diffMin < 60) return `hace ${diffMin} min`;
  const diffH = Math.floor(diffMin / 60);
  if (diffH < 24) return `hace ${diffH} h`;
  const diffD = Math.floor(diffH / 24);
  return `hace ${diffD} d`;
}
