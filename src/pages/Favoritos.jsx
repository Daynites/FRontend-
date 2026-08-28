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
        <h2 style={{ fontFamily: "var(--font-heading)", fontSize: 20, marginBottom: 6 }}>Tus favoritos</h2>
        <p style={{ color: "var(--ink-3)", fontSize: 14, marginBottom: 24 }}>
          Inicia sesión para guardar y ver tus anuncios favoritos.
        </p>
        <div style={{ display: "flex", justifyContent: "center" }}>
          <BotonGoogle onCredential={iniciarSesionConCredential} />
        </div>
      </div>
    );
  }

  async function alGuardar(anuncioId, nuevoEstado) {
    if (nuevoEstado) return; // en esta pantalla solo se puede quitar
    try {
      await quitarFavorito(anuncioId);
      setAnuncios((prev) => prev.filter((a) => a.id !== anuncioId));
    } catch (e) {
      setError(e.message);
      throw e;
    }
  }

  return (
    <div style={{ padding: "14px 14px 16px" }}>
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
          📌 Tus favoritos
        </span>
        <span style={{ flex: 1, height: 1, background: "linear-gradient(to right, var(--parch-3), transparent)" }} />
      </div>

      {error && (
        <p style={{ color: "var(--red-andino)", fontSize: 14 }}>No se pudo cargar tu lista: {error}</p>
      )}

      {anuncios === null && !error && (
        <p style={{ color: "var(--ink-3)", fontSize: 14 }}>Cargando…</p>
      )}

      {anuncios && anuncios.length === 0 && (
        <p style={{ color: "var(--ink-3)", fontSize: 14, textAlign: "center", padding: "24px 0" }}>
          Todavía no guardaste ningún anuncio. Tocá el 📌 en Inicio para guardarlo acá.
        </p>
      )}

      {anuncios && anuncios.length > 0 && (
        <div style={{ display: "grid", gap: 14 }}>
          <AnimatePresence mode="popLayout">
            {anuncios.map((anuncio, i) => (
              <AnuncioCard
                key={anuncio.id}
                anuncio={anuncio}
                indice={i}
                onClick={() => abrirAnuncio(anuncio.id)}
                onGuardar={alGuardar}
                guardadoInicial
              />
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
