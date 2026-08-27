import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import AnuncioCard from "../components/AnuncioCard.jsx";
import { agregarFavorito, listarAnuncios, listarCategorias } from "../api/client.js";
import { useNavegacion } from "../lib/navegacion.js";
import { useSesion } from "../lib/auth.js";

export default function Home() {
  const { abrirAnuncio } = useNavegacion();
  const { sesion } = useSesion();
  const [anuncios, setAnuncios] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [categoriaActiva, setCategoriaActiva] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  const [aviso, setAviso] = useState(null);

  useEffect(() => {
    listarCategorias()
      .then((data) => setCategorias(data.categorias))
      .catch(() => {}); // el filtro es opcional; si falla, la lista igual carga
  }, []);

  useEffect(() => {
    setCargando(true);
    setError(null);
    listarAnuncios({ categoria: categoriaActiva })
      .then((data) => setAnuncios(data.anuncios))
      .catch((e) => setError(e.message))
      .finally(() => setCargando(false));
  }, [categoriaActiva]);

  useEffect(() => {
    if (!aviso) return;
    const t = setTimeout(() => setAviso(null), 2200);
    return () => clearTimeout(t);
  }, [aviso]);

  async function favoritear(anuncioId) {
    if (!sesion) {
      setAviso({ tipo: "error", texto: "Inicia sesión para guardar favoritos" });
      return;
    }
    try {
      await agregarFavorito(anuncioId);
      setAviso({ tipo: "ok", texto: "Guardado en favoritos ⭐" });
    } catch (e) {
      setAviso({ tipo: "error", texto: e.message });
    }
  }

  return (
    <div style={{ padding: "16px 16px 24px", position: "relative" }}>
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
              borderRadius: 10,
              fontSize: 13,
              fontWeight: 600,
              color: "var(--paper)",
              background: aviso.tipo === "ok" ? "var(--teal)" : "var(--berry)",
            }}
          >
            {aviso.texto}
          </motion.div>
        )}
      </AnimatePresence>

      <header style={{ marginBottom: 16 }}>
        <h1
          style={{
            margin: "0 0 2px",
            fontFamily: "var(--font-display)",
            fontSize: 26,
            fontWeight: 800,
          }}
        >
          Junín Anuncios
        </h1>
        <p style={{ margin: 0, fontSize: 13, color: "var(--ink-soft)" }}>
          Oportunidades cerca de ti — desliza una tarjeta a la derecha para guardarla
        </p>
      </header>

      <div
        style={{
          display: "flex",
          gap: 8,
          overflowX: "auto",
          paddingBottom: 4,
          marginBottom: 16,
          WebkitOverflowScrolling: "touch",
        }}
      >
        <FiltroPill
          activa={categoriaActiva === null}
          onClick={() => setCategoriaActiva(null)}
        >
          Todas
        </FiltroPill>
        {categorias.map((cat) => (
          <FiltroPill
            key={cat}
            activa={cat === categoriaActiva}
            onClick={() => setCategoriaActiva(cat)}
          >
            {cat}
          </FiltroPill>
        ))}
      </div>

      {error && (
        <p style={{ color: "var(--berry)", fontSize: 14 }}>
          No se pudo cargar la lista: {error}
        </p>
      )}

      {cargando ? (
        <p style={{ color: "var(--ink-soft)", fontSize: 14 }}>Cargando…</p>
      ) : anuncios.length === 0 ? (
        <p style={{ color: "var(--ink-soft)", fontSize: 14 }}>
          No hay anuncios en esta categoría todavía.
        </p>
      ) : (
        <div
          style={{
            display: "grid",
            gap: 12,
          }}
        >
          <AnimatePresence mode="popLayout">
            {anuncios.map((anuncio, i) => (
              <AnuncioCard
                key={anuncio.id}
                anuncio={anuncio}
                indice={i}
                onClick={() => abrirAnuncio(anuncio.id)}
                onFavoritar={favoritear}
              />
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}

function FiltroPill({ activa, onClick, children }) {
  return (
    <motion.button
      onClick={onClick}
      whileTap={{ scale: 0.95 }}
      style={{
        flexShrink: 0,
        border: `1px solid ${activa ? "var(--ink)" : "var(--line)"}`,
        background: activa ? "var(--ink)" : "transparent",
        color: activa ? "var(--paper)" : "var(--ink-soft)",
        borderRadius: 999,
        padding: "6px 14px",
        fontSize: 13,
        fontWeight: 600,
        whiteSpace: "nowrap",
      }}
    >
      {children}
    </motion.button>
  );
}
