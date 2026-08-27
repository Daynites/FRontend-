import { useEffect, useState } from "react";
import { AnimatePresence } from "framer-motion";
import AnuncioCard from "../components/AnuncioCard.jsx";
import { listarFavoritos, quitarFavorito } from "../api/client.js";
import { useSesion } from "../lib/auth.js";
import { useNavegacion } from "../lib/navegacion.js";
import BotonGoogle from "../components/BotonGoogle.jsx";

export default function Favoritos() {
  const { sesion, iniciarSesionConCredential } = useSesion();
  const { abrirAnuncio } = useNavegacion();
  const [anuncios, setAnuncios] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!sesion) return;
    listarFavoritos()
      .then((d) => setAnuncios(d.anuncios))
      .catch((e) => setError(e.message));
  }, [sesion]);

  if (!sesion) {
    return (
      <div style={{ padding: "48px 24px", textAlign: "center" }}>
        <h2 style={{ fontFamily: "var(--font-display)", fontSize: 20, marginBottom: 6 }}>
          Tus favoritos
        </h2>
        <p style={{ color: "var(--ink-soft)", fontSize: 14, marginBottom: 24 }}>
          Inicia sesión para guardar y ver tus anuncios favoritos.
        </p>
        <div style={{ display: "flex", justifyContent: "center" }}>
          <BotonGoogle onCredential={iniciarSesionConCredential} />
        </div>
      </div>
    );
  }

  async function quitar(anuncioId) {
    setAnuncios((prev) => prev.filter((a) => a.id !== anuncioId));
    try {
      await quitarFavorito(anuncioId);
    } catch {
      listarFavoritos().then((d) => setAnuncios(d.anuncios));
    }
  }

  return (
    <div style={{ padding: "16px 16px 24px" }}>
      <header style={{ marginBottom: 16 }}>
        <h1
          style={{
            margin: "0 0 2px",
            fontFamily: "var(--font-display)",
            fontSize: 24,
            fontWeight: 800,
          }}
        >
          Tus favoritos
        </h1>
        <p style={{ margin: 0, fontSize: 13, color: "var(--ink-soft)" }}>
          Desliza a la derecha en Inicio para agregar más
        </p>
      </header>

      {error && (
        <p style={{ color: "var(--berry)", fontSize: 14 }}>
          No se pudo cargar tu lista: {error}
        </p>
      )}

      {anuncios === null && !error && (
        <p style={{ color: "var(--ink-soft)", fontSize: 14 }}>Cargando…</p>
      )}

      {anuncios && anuncios.length === 0 && (
        <p style={{ color: "var(--ink-soft)", fontSize: 14 }}>
          Todavía no guardaste ningún anuncio.
        </p>
      )}

      {anuncios && anuncios.length > 0 && (
        <div style={{ display: "grid", gap: 12 }}>
          <AnimatePresence mode="popLayout">
            {anuncios.map((anuncio, i) => (
              <div key={anuncio.id} style={{ position: "relative" }}>
                <AnuncioCard
                  anuncio={anuncio}
                  indice={i}
                  onClick={() => abrirAnuncio(anuncio.id)}
                />
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    quitar(anuncio.id);
                  }}
                  aria-label="Quitar de favoritos"
                  style={{
                    position: "absolute",
                    top: 10,
                    right: 10,
                    border: "1px solid var(--line)",
                    background: "var(--paper-raised)",
                    borderRadius: 999,
                    width: 26,
                    height: 26,
                    fontSize: 13,
                    color: "var(--berry)",
                  }}
                >
                  ✕
                </button>
              </div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
