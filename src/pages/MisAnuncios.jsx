import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { eliminarAnuncio, misAnuncios } from "../api/client.js";
import { useSesion } from "../lib/auth.js";
import BotonGoogle from "../components/BotonGoogle.jsx";

const ESTADO = {
  pendiente: { color: "var(--gold)", texto: "En revisión" },
  aprobado: { color: "var(--green)", texto: "Activo" },
  rechazado: { color: "var(--red-andino)", texto: "Rechazado" },
  expirado: { color: "var(--ink-3)", texto: "Expirado" },
};

/**
 * "Mis Anuncios" como su propia tab del bottom nav — antes vivía
 * solo dentro del menú de Perfil (todavía se puede llegar acá desde
 * ahí también, ver Perfil.jsx).
 */
export default function MisAnuncios() {
  const { sesion, iniciarSesionConCredential } = useSesion();
  const [anuncios, setAnuncios] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!sesion) return;
    misAnuncios(sesion.usuarioId)
      .then((d) => setAnuncios(d.anuncios))
      .catch((e) => setError(e.message));
  }, [sesion]);

  if (!sesion) {
    return (
      <div style={{ padding: "48px 24px", textAlign: "center" }}>
        <h2 style={{ fontFamily: "var(--font-heading)", fontSize: 20, marginBottom: 6 }}>Mis anuncios</h2>
        <p style={{ color: "var(--ink-3)", fontSize: 14, marginBottom: 24 }}>
          Inicia sesión para ver los anuncios que publicaste.
        </p>
        <div style={{ display: "flex", justifyContent: "center" }}>
          <BotonGoogle onCredential={iniciarSesionConCredential} />
        </div>
      </div>
    );
  }

  async function borrar(anuncioId) {
    const anteriores = anuncios;
    setAnuncios(anuncios.filter((a) => a.id !== anuncioId));
    try {
      await eliminarAnuncio(anuncioId, sesion.usuarioId);
    } catch (e) {
      setAnuncios(anteriores);
      setError(e.message);
    }
  }

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
          📢 Mis anuncios
        </span>
        <span style={{ flex: 1, height: 1, background: "linear-gradient(to right, var(--parch-3), transparent)" }} />
      </div>

      {error && <p style={{ color: "var(--red-andino)", fontSize: 14 }}>No se pudo cargar tu lista: {error}</p>}

      {anuncios === null && !error && <p style={{ color: "var(--ink-3)", fontSize: 14 }}>Cargando…</p>}

      {anuncios && anuncios.length === 0 && (
        <p style={{ color: "var(--ink-3)", fontSize: 14, textAlign: "center", padding: "24px 0" }}>
          Todavía no publicaste ningún anuncio.
        </p>
      )}

      {anuncios && anuncios.length > 0 && (
        <div style={{ display: "grid", gap: 10 }}>
          <AnimatePresence>
            {anuncios.map((anuncio) => (
              <MiAnuncioItem key={anuncio.id} anuncio={anuncio} onBorrar={borrar} />
            ))}
          </AnimatePresence>
        </div>
      )}
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
