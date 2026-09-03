import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  adminActivos,
  adminAprobar,
  adminEliminarAnuncio,
  adminPendientes,
  adminRechazar,
  adminStats,
  adminUsuarios,
  adminVerComprobante,
} from "../api/client.js";

const TABS = [
  { id: "stats", label: "📊 Stats" },
  { id: "pendientes", label: "⏳ Pendientes" },
  { id: "activos", label: "✅ Activos" },
  { id: "usuarios", label: "👥 Usuarios" },
];

/**
 * Panel de Admin — conectado a los endpoints reales de /admin/*.
 * Solo visible para usuario_id en ADMIN_IDS (ver lib/auth.js), pero
 * eso es control de UI nada más: la validación de verdad tiene que
 * pasar por el backend.
 */
export default function Admin() {
  const [tab, setTab] = useState("stats");
  const [aviso, setAviso] = useState(null);

  useEffect(() => {
    if (!aviso) return;
    const t = setTimeout(() => setAviso(null), 2400);
    return () => clearTimeout(t);
  }, [aviso]);

  return (
    <div style={{ padding: "14px 14px 32px", position: "relative" }}>
      <AnimatePresence>
        {aviso && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            style={{
              position: "sticky",
              top: 8,
              zIndex: 10,
              marginBottom: 10,
              padding: "8px 12px",
              borderRadius: "var(--radius-sm)",
              fontSize: 13,
              fontWeight: 600,
              color: "#fff",
              background: aviso.tipo === "error" ? "var(--red-andino)" : "var(--green)",
            }}
          >
            {aviso.texto}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hero */}
      <div
        style={{
          position: "relative",
          overflow: "hidden",
          background: "linear-gradient(135deg, var(--brown) 0%, var(--brown-3) 100%)",
          borderRadius: "var(--radius-md)",
          padding: 16,
          textAlign: "center",
          marginBottom: 12,
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
              "repeating-linear-gradient(90deg, var(--red-andino) 0px, var(--red-andino) 8px, var(--gold) 8px, var(--gold) 16px, var(--green) 16px, var(--green) 24px, var(--parch-2) 24px, var(--parch-2) 32px)",
          }}
        />
        <div style={{ fontSize: 28, marginBottom: 4 }}>🛡</div>
        <div style={{ fontFamily: "var(--font-heading)", fontSize: 16, fontWeight: 700, color: "var(--gold-2)" }}>
          Panel Admin
        </div>
        <div style={{ fontSize: 11, color: "var(--parch-3)", fontStyle: "italic", marginTop: 2, fontFamily: "var(--font-serif)" }}>
          Daynite · Solo administradores
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: 6, marginBottom: 12, overflowX: "auto" }}>
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            style={{
              flexShrink: 0,
              padding: "7px 14px",
              borderRadius: "var(--radius-pill)",
              border: `1.5px solid ${tab === t.id ? "var(--brown)" : "var(--parch-3)"}`,
              background: tab === t.id ? "var(--brown)" : "var(--parch-0)",
              color: tab === t.id ? "var(--gold-2)" : "var(--ink-2)",
              fontFamily: "var(--font-serif)",
              fontSize: 12,
              fontWeight: tab === t.id ? 600 : 400,
              cursor: "pointer",
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "stats" && <PanelStats onError={(msg) => setAviso({ tipo: "error", texto: msg })} />}
      {tab === "pendientes" && (
        <PanelAnuncios
          tipo="pendiente"
          cargar={adminPendientes}
          vacio={{ icono: "✅", texto: "Sin pendientes" }}
          onAviso={setAviso}
        />
      )}
      {tab === "activos" && (
        <PanelAnuncios
          tipo="activo"
          cargar={adminActivos}
          vacio={{ icono: "📭", texto: "Sin anuncios activos" }}
          onAviso={setAviso}
        />
      )}
      {tab === "usuarios" && <PanelUsuarios onError={(msg) => setAviso({ tipo: "error", texto: msg })} />}
    </div>
  );
}

function PanelStats({ onError }) {
  const [stats, setStats] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    adminStats()
      .then(setStats)
      .catch((e) => {
        setError(e.message);
        onError(`No se pudo cargar stats: ${e.message}`);
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (error) return <MensajeError texto={error} />;
  if (!stats) return <Cargando texto="Cargando estadísticas…" />;

  const items = [
    { n: stats.usuarios, l: "Usuarios", color: "var(--green)" },
    { n: stats.anuncios_total, l: "Anuncios total", color: "var(--brown)" },
    { n: stats.aprobados, l: "Aprobados", color: "var(--green)" },
    { n: stats.pendientes, l: "Pendientes", color: "var(--gold)" },
    { n: stats.rechazados, l: "Rechazados", color: "var(--red-andino)" },
    { n: stats.expirados, l: "Expirados", color: "var(--ink-3)" },
    { n: stats.alertas, l: "Alertas activas", color: "var(--ink-3)" },
    { n: stats.con_anuncios, l: "Usuarios activos", color: "var(--brown)" },
  ];

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
      {items.map((it) => (
        <div
          key={it.l}
          style={{
            background: "var(--parch-0)",
            border: "1.5px solid var(--parch-2)",
            borderRadius: "var(--radius-md)",
            padding: "14px 10px",
            textAlign: "center",
            boxShadow: "var(--shadow-sm)",
          }}
        >
          <div style={{ fontFamily: "var(--font-heading)", fontSize: 26, fontWeight: 700, color: it.color }}>
            {it.n}
          </div>
          <div style={{ fontSize: 10, color: "var(--ink-3)", marginTop: 3 }}>{it.l}</div>
        </div>
      ))}
    </div>
  );
}

function PanelAnuncios({ tipo, cargar, vacio, onAviso }) {
  const [anuncios, setAnuncios] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    setAnuncios(null);
    setError(null);
    cargar()
      .then((d) => setAnuncios(d.anuncios))
      .catch((e) => setError(e.message));
  }, [cargar]);

  async function verComprobante(id) {
    try {
      const url = await adminVerComprobante(id);
      if (!url) {
        onAviso({ tipo: "error", texto: "Este anuncio no tiene comprobante subido" });
        return;
      }
      window.open(url, "_blank", "noopener,noreferrer");
    } catch (e) {
      onAviso({ tipo: "error", texto: e.message });
    }
  }

  async function aprobar(id) {
    if (!confirm(`¿Aprobar anuncio #${id}?`)) return;
    try {
      await adminAprobar(id);
      onAviso({ texto: `Anuncio #${id} aprobado ✅` });
      setAnuncios((prev) => prev.filter((a) => a.id !== id));
    } catch (e) {
      onAviso({ tipo: "error", texto: e.message });
    }
  }

  async function rechazar(id) {
    if (!confirm(`¿Rechazar anuncio #${id}?`)) return;
    try {
      await adminRechazar(id);
      onAviso({ texto: `Anuncio #${id} rechazado ❌` });
      setAnuncios((prev) => prev.filter((a) => a.id !== id));
    } catch (e) {
      onAviso({ tipo: "error", texto: e.message });
    }
  }

  async function eliminar(id) {
    if (!confirm(`¿Eliminar anuncio #${id}?`)) return;
    try {
      await adminEliminarAnuncio(id);
      onAviso({ texto: `Anuncio #${id} eliminado 🗑` });
      setAnuncios((prev) => prev.filter((a) => a.id !== id));
    } catch (e) {
      onAviso({ tipo: "error", texto: e.message });
    }
  }

  if (error) return <MensajeError texto={error} />;
  if (!anuncios) return <Cargando texto={`Cargando ${tipo === "pendiente" ? "pendientes" : "activos"}…`} />;
  if (anuncios.length === 0) return <MensajeVacio icono={vacio.icono} texto={vacio.texto} />;

  return (
    <div>
      <AnimatePresence>
        {anuncios.map((a) => (
          <motion.div
            key={a.id}
            layout
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, x: -20, transition: { duration: 0.15 } }}
            style={{
              position: "relative",
              overflow: "hidden",
              background: "var(--parch-0)",
              border: "1.5px solid var(--parch-2)",
              borderRadius: "var(--radius-md)",
              padding: "12px 13px",
              marginBottom: 8,
              boxShadow: "var(--shadow-sm)",
            }}
          >
            <div
              aria-hidden="true"
              style={{
                position: "absolute",
                left: 0,
                top: 0,
                bottom: 0,
                width: 4,
                background: "linear-gradient(to bottom, var(--gold), var(--parch-3))",
              }}
            />
            <div style={{ display: "flex", alignItems: "flex-start", gap: 8, marginBottom: 6 }}>
              <span style={{ fontFamily: "var(--font-heading)", fontSize: 10, color: "var(--parch-3)", fontWeight: 700, paddingTop: 2 }}>
                #{a.id}
              </span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontFamily: "var(--font-serif)", fontSize: 14, fontWeight: 600, color: "var(--ink)" }}>
                  {a.titulo}
                </div>
                <div style={{ fontSize: 11, color: "var(--ink-3)", marginTop: 2 }}>
                  {a.categoria} · {a.distrito} · {a.fecha}
                </div>
                <div style={{ fontSize: 11, color: "var(--ink-3)" }}>
                  👤 ID: {a.usuario_id} · 📲 {a.whatsapp}
                </div>
              </div>
            </div>

            <div style={{ display: "flex", gap: 6, marginTop: 8 }}>
              {tipo === "pendiente" && (
                <>
                  <BotonAdmin onClick={() => verComprobante(a.id)} variante="ok">
                    🧾 Comprobante
                  </BotonAdmin>
                  <BotonAdmin onClick={() => aprobar(a.id)} variante="ok">
                    ✅ Aprobar
                  </BotonAdmin>
                  <BotonAdmin onClick={() => rechazar(a.id)} variante="no">
                    ❌ Rechazar
                  </BotonAdmin>
                </>
              )}
              <BotonAdmin onClick={() => eliminar(a.id)} variante="del">
                🗑 Eliminar
              </BotonAdmin>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}

function PanelUsuarios({ onError }) {
  const [usuarios, setUsuarios] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    adminUsuarios(100)
      .then((d) => setUsuarios(d.usuarios))
      .catch((e) => {
        setError(e.message);
        onError(`No se pudo cargar usuarios: ${e.message}`);
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (error) return <MensajeError texto={error} />;
  if (!usuarios) return <Cargando texto="Cargando usuarios…" />;
  if (usuarios.length === 0) return <MensajeVacio icono="👥" texto="Sin usuarios" />;

  return (
    <div>
      {usuarios.map((u) => (
        <div
          key={u.id ?? u.telegram_id}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            padding: "10px 4px",
            borderBottom: "1px solid var(--parch-2)",
          }}
        >
          <span style={{ fontSize: 20, flexShrink: 0 }}>👤</span>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontFamily: "var(--font-serif)", fontSize: 13, fontWeight: 600, color: "var(--ink)" }}>
              {u.nombre || "Sin nombre"}
            </div>
            <div style={{ fontSize: 10, color: "var(--ink-3)", fontFamily: "monospace" }}>
              ID: {u.id ?? u.telegram_id}
            </div>
          </div>
          <div style={{ fontSize: 10, color: "var(--ink-3)", flexShrink: 0 }}>{u.fecha}</div>
        </div>
      ))}
    </div>
  );
}

function BotonAdmin({ children, onClick, variante }) {
  const estilos = {
    ok: { background: "linear-gradient(135deg, var(--green-2), var(--green))", color: "#fff", border: "none" },
    no: { background: "var(--parch-2)", color: "var(--ink)", border: "1.5px solid var(--parch-3)" },
    del: { background: "linear-gradient(135deg, var(--red-andino), #a83232)", color: "#fff", border: "none" },
  }[variante];

  return (
    <button
      onClick={onClick}
      style={{
        flex: 1,
        borderRadius: "var(--radius-pill)",
        padding: 8,
        fontFamily: "var(--font-serif)",
        fontSize: 12,
        fontWeight: 600,
        cursor: "pointer",
        ...estilos,
      }}
    >
      {children}
    </button>
  );
}

function Cargando({ texto }) {
  return <p style={{ color: "var(--ink-3)", fontSize: 14, textAlign: "center", padding: "24px 0" }}>{texto}</p>;
}

function MensajeError({ texto }) {
  return (
    <div
      style={{
        background: "var(--parch-0)",
        border: "1.5px solid var(--parch-2)",
        borderRadius: "var(--radius-md)",
        padding: 16,
        textAlign: "center",
      }}
    >
      <p style={{ margin: 0, fontSize: 13, color: "var(--red-andino)", fontWeight: 600 }}>
        No se pudo cargar: {texto}
      </p>
    </div>
  );
}

function MensajeVacio({ icono, texto }) {
  return (
    <div style={{ textAlign: "center", padding: "32px 0" }}>
      <div style={{ fontSize: 44, marginBottom: 10 }}>{icono}</div>
      <div style={{ fontFamily: "var(--font-serif)", fontSize: 14, color: "var(--ink-3)" }}>{texto}</div>
    </div>
  );
}
