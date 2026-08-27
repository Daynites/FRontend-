import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { eliminarAnuncio, misAnuncios } from "../api/client.js";
import { useSesion } from "../lib/auth.js";
import BotonGoogle from "../components/BotonGoogle.jsx";

const ESTADO = {
  pendiente: { color: "var(--marigold)", texto: "En revisión" },
  aprobado: { color: "var(--teal)", texto: "Activo" },
  rechazado: { color: "var(--berry)", texto: "Rechazado" },
  expirado: { color: "var(--ink-soft)", texto: "Expirado" },
};

export default function Perfil() {
  const { sesion, iniciarSesionConCredential, cerrarSesion } = useSesion();

  if (!sesion) {
    return (
      <div style={{ padding: "48px 24px", textAlign: "center" }}>
        <h2 style={{ fontFamily: "var(--font-display)", fontSize: 20, marginBottom: 6 }}>
          Tu perfil
        </h2>
        <p style={{ color: "var(--ink-soft)", fontSize: 14, marginBottom: 24 }}>
          Inicia sesión para ver tus anuncios publicados.
        </p>
        <div style={{ display: "flex", justifyContent: "center" }}>
          <BotonGoogle onCredential={iniciarSesionConCredential} />
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: "16px 16px 32px" }}>
      <header
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          marginBottom: 20,
        }}
      >
        <div>
          <h1
            style={{
              margin: "0 0 2px",
              fontFamily: "var(--font-display)",
              fontSize: 22,
              fontWeight: 800,
            }}
          >
            {sesion.nombre || "Tu perfil"}
          </h1>
          <p style={{ margin: 0, fontSize: 13, color: "var(--ink-soft)" }}>
            {sesion.email}
          </p>
        </div>
        <button
          onClick={cerrarSesion}
          style={{
            border: "1px solid var(--line)",
            background: "transparent",
            color: "var(--ink-soft)",
            borderRadius: 8,
            padding: "6px 10px",
            fontSize: 12,
            fontWeight: 600,
          }}
        >
          Salir
        </button>
      </header>

      <h2
        style={{
          fontFamily: "var(--font-display)",
          fontSize: 15,
          fontWeight: 700,
          margin: "0 0 12px",
          color: "var(--ink-soft)",
        }}
      >
        Mis anuncios
      </h2>

      <ListaMisAnuncios usuarioId={sesion.usuarioId} />
    </div>
  );
}

function ListaMisAnuncios({ usuarioId }) {
  const [anuncios, setAnuncios] = useState(null); // null = cargando
  const [error, setError] = useState(null);

  useEffect(() => {
    misAnuncios(usuarioId)
      .then((d) => setAnuncios(d.anuncios))
      .catch((e) => setError(e.message));
  }, [usuarioId]);

  async function borrar(anuncioId) {
    // Optimista: lo saco de la lista antes de que responda el servidor
    setAnuncios((prev) => prev.filter((a) => a.id !== anuncioId));
    try {
      await eliminarAnuncio(anuncioId, usuarioId);
    } catch {
      // Si falla, recargo la lista real en vez de dejarla desincronizada
      misAnuncios(usuarioId).then((d) => setAnuncios(d.anuncios));
    }
  }

  if (error) {
    return (
      <p style={{ color: "var(--berry)", fontSize: 14 }}>
        No se pudo cargar tu lista: {error}
      </p>
    );
  }

  if (anuncios === null) {
    return <p style={{ color: "var(--ink-soft)", fontSize: 14 }}>Cargando…</p>;
  }

  if (anuncios.length === 0) {
    return (
      <p style={{ color: "var(--ink-soft)", fontSize: 14 }}>
        Todavía no publicaste ningún anuncio.
      </p>
    );
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
  const estado = ESTADO[anuncio.estado] ?? { color: "var(--ink-soft)", texto: anuncio.estado };

  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -24, transition: { duration: 0.15 } }}
      style={{
        background: "var(--paper-raised)",
        border: "1px solid var(--line)",
        borderRadius: 12,
        padding: "12px 14px",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", gap: 8 }}>
        <h3
          style={{
            margin: 0,
            fontFamily: "var(--font-display)",
            fontSize: 15,
            fontWeight: 600,
            lineHeight: 1.3,
          }}
        >
          {anuncio.titulo}
        </h3>
        <span
          style={{
            flexShrink: 0,
            display: "flex",
            alignItems: "center",
            gap: 5,
            fontSize: 11.5,
            fontWeight: 700,
            color: estado.color,
          }}
        >
          <span
            style={{
              width: 6,
              height: 6,
              borderRadius: "50%",
              background: estado.color,
            }}
          />
          {estado.texto}
        </span>
      </div>

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginTop: 8,
          fontSize: 12,
          color: "var(--ink-soft)",
        }}
      >
        <span>
          👁 {anuncio.vistas} vista{anuncio.vistas === 1 ? "" : "s"}
          {anuncio.estado === "aprobado" && anuncio.dias_restantes !== null && (
            <> · {anuncio.dias_restantes} día{anuncio.dias_restantes === 1 ? "" : "s"} restantes</>
          )}
        </span>
        <button
          onClick={() => onBorrar(anuncio.id)}
          style={{
            border: "none",
            background: "none",
            color: "var(--berry)",
            fontSize: 12,
            fontWeight: 600,
            padding: 4,
          }}
        >
          Eliminar
        </button>
      </div>
    </motion.article>
  );
}
