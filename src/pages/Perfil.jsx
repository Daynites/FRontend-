import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { eliminarAnuncio, misAnuncios } from "../api/client.js";
import { useSesion } from "../lib/auth.js";
import { abrirLink } from "../lib/links.js";
import BotonGoogle from "../components/BotonGoogle.jsx";

const ESTADO = {
  pendiente: { color: "var(--gold)", texto: "En revisión" },
  aprobado: { color: "var(--green)", texto: "Activo" },
  rechazado: { color: "var(--red-andino)", texto: "Rechazado" },
  expirado: { color: "var(--ink-3)", texto: "Expirado" },
};

/**
 * Menú de Perfil — migrado del prototipo estático. Algunas opciones
 * (Notificaciones push, Mi Perfil de Candidato, Buscar Candidatos,
 * Mis Alertas) todavía no tienen pantalla ni backend detrás; se
 * marcan como "Próximamente" en vez de fingir que funcionan.
 */
export default function Perfil({ onCambiarPestana }) {
  const { sesion, iniciarSesionConCredential, cerrarSesion } = useSesion();
  const [vista, setVista] = useState("menu"); // 'menu' | 'mis-anuncios'
  const [misAnunciosData, setMisAnunciosData] = useState(null);
  const [aviso, setAviso] = useState(null);

  useEffect(() => {
    if (!sesion) return;
    misAnuncios(sesion.usuarioId)
      .then((d) => setMisAnunciosData(d.anuncios))
      .catch(() => {});
  }, [sesion]);

  useEffect(() => {
    if (!aviso) return;
    const t = setTimeout(() => setAviso(null), 2200);
    return () => clearTimeout(t);
  }, [aviso]);

  function proximamente(nombre) {
    setAviso(`${nombre} está en camino — todavía no está lista.`);
  }

  if (!sesion) {
    return (
      <div style={{ padding: "48px 24px", textAlign: "center" }}>
        <h2 style={{ fontFamily: "var(--font-heading)", fontSize: 20, marginBottom: 6 }}>
          Tu perfil
        </h2>
        <p style={{ color: "var(--ink-3)", fontSize: 14, marginBottom: 24 }}>
          Inicia sesión para ver tus anuncios publicados.
        </p>
        <div style={{ display: "flex", justifyContent: "center" }}>
          <BotonGoogle onCredential={iniciarSesionConCredential} />
        </div>
      </div>
    );
  }

  if (vista === "mis-anuncios") {
    return (
      <div style={{ padding: "14px 16px 32px" }}>
        <BotonVolver onClick={() => setVista("menu")} />
        <h2
          style={{
            fontFamily: "var(--font-heading)",
            fontSize: 16,
            fontWeight: 700,
            margin: "10px 0 14px",
            color: "var(--ink-2)",
          }}
        >
          📢 Mis anuncios
        </h2>
        <ListaMisAnuncios
          usuarioId={sesion.usuarioId}
          anuncios={misAnunciosData}
          onCambiar={setMisAnunciosData}
        />
      </div>
    );
  }

  const total = misAnunciosData?.length ?? null;
  const aprobados = misAnunciosData?.filter((a) => a.estado === "aprobado").length ?? null;

  return (
    <div style={{ padding: "14px 16px 32px", position: "relative" }}>
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
              color: "var(--parch-0)",
              background: "var(--brown-2)",
            }}
          >
            {aviso}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hero */}
      <div
        style={{
          position: "relative",
          overflow: "hidden",
          background: "linear-gradient(135deg, var(--brown), var(--brown-3))",
          borderRadius: "var(--radius-md)",
          padding: "20px 14px",
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
              "repeating-linear-gradient(90deg, var(--gold) 0px, var(--gold) 8px, var(--red-andino) 8px, var(--red-andino) 16px, var(--green) 16px, var(--green) 24px, var(--parch-2) 24px, var(--parch-2) 32px)",
          }}
        />
        <div
          style={{
            width: 66,
            height: 66,
            margin: "0 auto 10px",
            borderRadius: "50%",
            background: "linear-gradient(135deg, var(--gold), var(--brown-3))",
            border: "3px solid var(--gold-2)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 28,
          }}
        >
          👤
        </div>
        <div style={{ fontFamily: "var(--font-heading)", fontSize: 15, fontWeight: 700, color: "var(--gold-2)" }}>
          {sesion.nombre || "Mi Perfil"}
        </div>
        <div style={{ fontSize: 11, color: "var(--parch-3)", fontStyle: "italic", marginTop: 3, fontFamily: "var(--font-serif)" }}>
          {sesion.email}
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
        <StatBox n={total ?? "—"} label="Anuncios" />
        <StatBox n={aprobados ?? "—"} label="Aprobados" />
        <StatBox n="—" label="Alertas" />
      </div>

      <MenuItem icono="📢" titulo="Mis Anuncios" sub="Ver y gestionar tus publicaciones" onClick={() => setVista("mis-anuncios")} />
      <MenuItem icono="🔔" titulo="Notificaciones push" sub="Próximamente" onClick={() => proximamente("Notificaciones push")} />
      <MenuItem icono="➡️" titulo="Favoritos" sub="Anuncios que guardaste" onClick={() => onCambiarPestana?.("favoritos")} />
      <MenuItem icono="🪪" titulo="Mi Perfil de Candidato" sub="Próximamente" onClick={() => proximamente("Mi Perfil de Candidato")} />
      <MenuItem icono="👥" titulo="Buscar Candidatos" sub="Próximamente" onClick={() => proximamente("Buscar Candidatos")} />
      <MenuItem icono="🔔" titulo="Mis Alertas" sub="Próximamente" onClick={() => proximamente("Mis Alertas")} />
      <MenuItem icono="🆘" titulo="Soporte Daynite" sub="Contactar al equipo" onClick={() => abrirLink("https://wa.me/51920881860")} />
      <MenuItem
        icono="🚪"
        titulo="Cerrar sesión"
        sub="Salir de tu cuenta"
        onClick={() => {
          if (confirm("¿Cerrar sesión?")) cerrarSesion();
        }}
      />
    </div>
  );
}

function BotonVolver({ onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        border: "none",
        background: "none",
        color: "var(--brown-2)",
        fontFamily: "var(--font-serif)",
        fontSize: 14,
        fontWeight: 600,
        padding: 0,
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        gap: 4,
      }}
    >
      ‹ Volver
    </button>
  );
}

function StatBox({ n, label }) {
  return (
    <div
      style={{
        flex: 1,
        background: "var(--parch-0)",
        border: "1.5px solid var(--parch-2)",
        borderRadius: "var(--radius-sm)",
        padding: "10px 6px",
        textAlign: "center",
        boxShadow: "var(--shadow-sm)",
      }}
    >
      <div style={{ fontFamily: "var(--font-heading)", fontSize: 20, fontWeight: 700, color: "var(--ink)" }}>{n}</div>
      <div style={{ fontSize: 10, color: "var(--ink-3)", marginTop: 2 }}>{label}</div>
    </div>
  );
}

function MenuItem({ icono, titulo, sub, onClick }) {
  return (
    <motion.div
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      style={{
        background: "var(--parch-0)",
        border: "1.5px solid var(--parch-2)",
        borderRadius: "var(--radius-md)",
        padding: "13px 14px",
        marginBottom: 8,
        display: "flex",
        alignItems: "center",
        gap: 12,
        cursor: "pointer",
        boxShadow: "var(--shadow-sm)",
      }}
    >
      <div style={{ fontSize: 22, flexShrink: 0 }}>{icono}</div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontFamily: "var(--font-serif)", fontSize: 14, fontWeight: 600, color: "var(--ink)" }}>{titulo}</div>
        <div style={{ fontSize: 11, color: "var(--ink-3)", marginTop: 2 }}>{sub}</div>
      </div>
      <div style={{ fontSize: 18, color: "var(--parch-3)", flexShrink: 0 }}>›</div>
    </motion.div>
  );
}

function ListaMisAnuncios({ usuarioId, anuncios, onCambiar }) {
  const [error, setError] = useState(null);

  useEffect(() => {
    if (anuncios !== null) return;
    misAnuncios(usuarioId)
      .then((d) => onCambiar(d.anuncios))
      .catch((e) => setError(e.message));
  }, [usuarioId, anuncios, onCambiar]);

  async function borrar(anuncioId) {
    const anteriores = anuncios;
    onCambiar(anuncios.filter((a) => a.id !== anuncioId));
    try {
      await eliminarAnuncio(anuncioId, usuarioId);
    } catch {
      onCambiar(anteriores);
    }
  }

  if (error) {
    return <p style={{ color: "var(--red-andino)", fontSize: 14 }}>No se pudo cargar tu lista: {error}</p>;
  }

  if (anuncios === null) {
    return <p style={{ color: "var(--ink-3)", fontSize: 14 }}>Cargando…</p>;
  }

  if (anuncios.length === 0) {
    return <p style={{ color: "var(--ink-3)", fontSize: 14 }}>Todavía no publicaste ningún anuncio.</p>;
  }

  return (
    <div style={{ display: "grid", gap: 10 }}>
      <AnimatePresence>
        {anuncios.map((anuncio) => (
          <MiAnuncioItem key={anuncio.id} anuncio={anuncio} onBorrar={borrar} />
        ))}
      </AnimatePresence>
    </div>
  );
}

function MiAnuncioItem({ anuncio, onBorrar }) {
  const estado = ESTADO[anuncio.estado] ?? { color: "var(--ink-3)", texto: anuncio.estado };

  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -24, transition: { duration: 0.15 } }}
      style={{
        background: "var(--parch-0)",
        border: "1.5px solid var(--parch-2)",
        borderRadius: 12,
        padding: "12px 14px",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", gap: 8 }}>
        <h3 style={{ margin: 0, fontFamily: "var(--font-serif)", fontSize: 15, fontWeight: 600, lineHeight: 1.3 }}>
          {anuncio.titulo}
        </h3>
        <span style={{ flexShrink: 0, display: "flex", alignItems: "center", gap: 5, fontSize: 11.5, fontWeight: 700, color: estado.color }}>
          <span style={{ width: 6, height: 6, borderRadius: "50%", background: estado.color }} />
          {estado.texto}
        </span>
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 8, fontSize: 12, color: "var(--ink-3)" }}>
        <span>
          👁 {anuncio.vistas} vista{anuncio.vistas === 1 ? "" : "s"}
          {anuncio.estado === "aprobado" && anuncio.dias_restantes !== null && (
            <> · {anuncio.dias_restantes} día{anuncio.dias_restantes === 1 ? "" : "s"} restantes</>
          )}
        </span>
        <button
          onClick={() => onBorrar(anuncio.id)}
          style={{ border: "none", background: "none", color: "var(--red-andino)", fontSize: 12, fontWeight: 600, padding: 4, cursor: "pointer" }}
        >
          Eliminar
        </button>
      </div>
    </motion.article>
  );
}
