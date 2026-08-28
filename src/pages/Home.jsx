import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import AnuncioCard from "../components/AnuncioCard.jsx";
import { agregarFavorito, listarAnuncios, listarCategorias, listarDistritos, quitarFavorito } from "../api/client.js";
import { useNavegacion } from "../lib/navegacion.js";
import { useSesion } from "../lib/auth.js";

export default function Home() {
  const { abrirAnuncio } = useNavegacion();
  const { sesion } = useSesion();
  const [anuncios, setAnuncios] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [distritos, setDistritos] = useState([]);
  const [categoriaActiva, setCategoriaActiva] = useState(null);
  const [distritoActivo, setDistritoActivo] = useState(null);
  const [busqueda, setBusqueda] = useState("");
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  const [aviso, setAviso] = useState(null);
  const [dropdownAbierto, setDropdownAbierto] = useState(null); // 'categoria' | 'distrito' | null

  useEffect(() => {
    listarCategorias()
      .then((data) => setCategorias(data.categorias))
      .catch(() => {}); // el filtro es opcional; si falla, la lista igual carga
    listarDistritos()
      .then((data) => setDistritos(data.distritos))
      .catch(() => {});
  }, []);

  useEffect(() => {
    setCargando(true);
    setError(null);
    const t = setTimeout(() => {
      listarAnuncios({ categoria: categoriaActiva, distrito: distritoActivo, buscar: busqueda || undefined })
        .then((data) => setAnuncios(data.anuncios))
        .catch((e) => setError(e.message))
        .finally(() => setCargando(false));
    }, 300); // debounce, sobre todo para la búsqueda en vivo
    return () => clearTimeout(t);
  }, [categoriaActiva, distritoActivo, busqueda]);

  useEffect(() => {
    if (!aviso) return;
    const t = setTimeout(() => setAviso(null), 2200);
    return () => clearTimeout(t);
  }, [aviso]);

  async function alGuardar(anuncioId, nuevoEstado) {
    if (!sesion) {
      setAviso({ tipo: "error", texto: "Inicia sesión para guardar favoritos" });
      throw new Error("sin sesión");
    }
    try {
      if (nuevoEstado) {
        await agregarFavorito(anuncioId);
        setAviso({ tipo: "ok", texto: "Guardado en favoritos 📌" });
      } else {
        await quitarFavorito(anuncioId);
        setAviso({ tipo: "ok", texto: "Quitado de favoritos" });
      }
    } catch (e) {
      setAviso({ tipo: "error", texto: e.message });
      throw e;
    }
  }

  function elegirCategoria(cat) {
    setCategoriaActiva(cat);
    setDistritoActivo(null);
    setDropdownAbierto(null);
  }

  function elegirDistrito(dist) {
    setDistritoActivo(dist);
    setCategoriaActiva(null);
    setDropdownAbierto(null);
  }

  function todos() {
    setCategoriaActiva(null);
    setDistritoActivo(null);
  }

  return (
    <div style={{ padding: "10px 14px 16px", position: "relative" }}>
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
              background: aviso.tipo === "ok" ? "var(--green)" : "var(--red-andino)",
            }}
          >
            {aviso.texto}
          </motion.div>
        )}
      </AnimatePresence>

      <BarraBusqueda valor={busqueda} onCambiar={setBusqueda} />

      <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 0 10px" }}>
        <FiltroPill activa={!categoriaActiva && !distritoActivo} onClick={todos}>
          Todos
        </FiltroPill>
        <FiltroDropdown
          label={categoriaActiva ? `📂 ${categoriaActiva}` : "📂 Categoría ▾"}
          abierto={dropdownAbierto === "categoria"}
          onToggle={() => setDropdownAbierto((d) => (d === "categoria" ? null : "categoria"))}
          onCerrar={() => setDropdownAbierto(null)}
        >
          {categorias.map((cat) => (
            <DropdownItem key={cat} activa={cat === categoriaActiva} onClick={() => elegirCategoria(cat)}>
              {cat}
            </DropdownItem>
          ))}
        </FiltroDropdown>
        <FiltroDropdown
          label={distritoActivo ? `📍 ${distritoActivo}` : "📍 Distrito"}
          abierto={dropdownAbierto === "distrito"}
          onToggle={() => setDropdownAbierto((d) => (d === "distrito" ? null : "distrito"))}
          onCerrar={() => setDropdownAbierto(null)}
          alinearDerecha
        >
          {distritos.map((dist) => (
            <DropdownItem key={dist} activa={dist === distritoActivo} onClick={() => elegirDistrito(dist)}>
              📍 {dist}
            </DropdownItem>
          ))}
        </FiltroDropdown>
      </div>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          marginBottom: 10,
        }}
      >
        <span
          style={{
            fontFamily: "var(--font-heading)",
            fontSize: 10,
            letterSpacing: 2.5,
            color: "var(--gold)",
            textTransform: "uppercase",
          }}
        >
          📌 Anuncios vigentes
        </span>
        <span style={{ flex: 1, height: 1, background: "linear-gradient(to right, var(--parch-3), transparent)" }} />
      </div>

      {error && (
        <p style={{ color: "var(--red-andino)", fontSize: 14 }}>No se pudo cargar la lista: {error}</p>
      )}

      {!error && (
        <p style={{ fontSize: 12, color: "var(--ink-3)", margin: "0 0 10px" }}>
          {cargando ? "Cargando…" : `${anuncios.length} anuncio${anuncios.length === 1 ? "" : "s"} encontrado${anuncios.length === 1 ? "" : "s"}`}
        </p>
      )}

      {!cargando && anuncios.length === 0 && !error && (
        <p style={{ color: "var(--ink-3)", fontSize: 14, textAlign: "center", padding: "24px 0" }}>
          No hay anuncios con este filtro todavía.
        </p>
      )}

      <div style={{ display: "grid", gap: 14 }}>
        <AnimatePresence mode="popLayout">
          {anuncios.map((anuncio, i) => (
            <AnuncioCard
              key={anuncio.id}
              anuncio={anuncio}
              indice={i}
              onClick={() => abrirAnuncio(anuncio.id)}
              onGuardar={alGuardar}
            />
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}

function BarraBusqueda({ valor, onCambiar }) {
  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        aspectRatio: "950 / 105",
        filter: "drop-shadow(0 2px 6px rgba(122,80,32,.25))",
      }}
    >
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          inset: 0,
          background: "url('/assets/barra_busqueda.webp') center / 100% 100% no-repeat",
        }}
      />
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          alignItems: "center",
          padding: "0 16% 0 18%",
        }}
      >
        <input
          type="text"
          value={valor}
          onChange={(e) => onCambiar(e.target.value)}
          placeholder="Buscar puestos, distritos…"
          style={{
            width: "100%",
            border: "none",
            outline: "none",
            background: "transparent",
            fontFamily: "var(--font-serif)",
            fontSize: 13,
            color: "var(--ink)",
          }}
        />
      </div>
    </div>
  );
}

function FiltroPill({ activa, onClick, children }) {
  return (
    <button
      onClick={onClick}
      style={{
        flexShrink: 0,
        border: `1.5px solid ${activa ? "var(--brown)" : "var(--parch-3)"}`,
        background: activa ? "var(--brown)" : "transparent",
        color: activa ? "var(--gold-2)" : "var(--ink-2)",
        borderRadius: "var(--radius-pill)",
        padding: "5px 14px",
        fontFamily: "var(--font-serif)",
        fontSize: 12.5,
        fontWeight: activa ? 600 : 400,
        cursor: "pointer",
        whiteSpace: "nowrap",
      }}
    >
      {children}
    </button>
  );
}

function FiltroDropdown({ label, abierto, onToggle, onCerrar, alinearDerecha, children }) {
  const ref = useRef(null);

  useEffect(() => {
    if (!abierto) return;
    function alTocarFuera(e) {
      if (ref.current && !ref.current.contains(e.target)) onCerrar();
    }
    document.addEventListener("mousedown", alTocarFuera);
    return () => document.removeEventListener("mousedown", alTocarFuera);
  }, [abierto, onCerrar]);

  return (
    <div ref={ref} style={{ position: "relative", flexShrink: 0 }}>
      <button
        onClick={onToggle}
        style={{
          background: "var(--brown)",
          border: "none",
          borderRadius: "var(--radius-pill)",
          padding: "7px 14px",
          color: "var(--gold-3)",
          fontFamily: "var(--font-serif)",
          fontSize: 13,
          cursor: "pointer",
          whiteSpace: "nowrap",
        }}
      >
        {label}
      </button>
      <AnimatePresence>
        {abierto && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.15 }}
            style={{
              position: "absolute",
              top: "calc(100% + 6px)",
              left: alinearDerecha ? "auto" : 0,
              right: alinearDerecha ? 0 : "auto",
              minWidth: 200,
              maxHeight: 260,
              overflowY: "auto",
              background: "var(--parch-0)",
              border: "1.5px solid var(--parch-3)",
              borderRadius: "var(--radius-md)",
              boxShadow: "var(--shadow-lg)",
              zIndex: 20,
            }}
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function DropdownItem({ activa, onClick, children }) {
  return (
    <div
      onClick={onClick}
      style={{
        padding: "10px 14px",
        fontFamily: "var(--font-serif)",
        fontSize: 13,
        color: activa ? "var(--gold-2)" : "var(--ink)",
        background: activa ? "var(--brown)" : "transparent",
        fontWeight: activa ? 600 : 400,
        cursor: "pointer",
        borderBottom: "1px solid var(--parch-2)",
      }}
    >
      {children}
    </div>
  );
}
