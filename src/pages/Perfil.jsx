import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { misAnuncios } from "../api/client.js";
import { useSesion } from "../lib/auth.js";
import { abrirLink } from "../lib/links.js";
import BotonGoogle from "../components/BotonGoogle.jsx";

/**
 * Menú de Perfil. "Mis Anuncios" y "Favoritos" ahora son tabs propias
 * del bottom nav — acá solo se usan sus datos para las stats y se
 * navega hacia ellas con onCambiarPestana.
 */
export default function Perfil({ onCambiarPestana, onAbrirAlertas }) {
  const { sesion, iniciarSesionConCredential, cerrarSesion } = useSesion();
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

      <MenuItem icono="📢" titulo="Mis Anuncios" sub="Ver y gestionar tus publicaciones" onClick={() => onCambiarPestana?.("mis-anuncios")} />
      <MenuItem icono="🔔" titulo="Notificaciones push" sub="Próximamente" onClick={() => proximamente("Notificaciones push")} />
      <MenuItem icono="➡️" titulo="Favoritos" sub="Anuncios que guardaste" onClick={() => onCambiarPestana?.("favoritos")} />
      <MenuItem icono="🪪" titulo="Mi Perfil de Candidato" sub="Que las empresas te encuentren" onClick={() => onCambiarPestana?.("perfil-candidato")} />
      <MenuItem icono="👥" titulo="Buscar Candidatos" sub="Ver quién busca trabajo" onClick={() => onCambiarPestana?.("candidatos")} />
      <MenuItem icono="🔔" titulo="Mis Alertas" sub="Categorías que sigues" onClick={onAbrirAlertas} />
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
