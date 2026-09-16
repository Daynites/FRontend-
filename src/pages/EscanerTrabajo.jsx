import { useEffect, useState } from "react";
import { AnimatePresence } from "framer-motion";
import AnuncioCard from "../components/AnuncioCard.jsx";
import { SkeletonLista } from "../components/Skeleton.jsx";
import { agregarFavorito, quitarFavorito, verAnunciosEscaner } from "../api/client.js";
import { useNavegacion } from "../lib/navegacion.js";
import { useSesion } from "../lib/auth.js";

/** Resultados del Escáner de Trabajo — anuncios que calzan con el perfil de candidato. */
export default function EscanerTrabajo({ onCambiarPestana }) {
  const { sesion } = useSesion();
  const { abrirAnuncio } = useNavegacion();
  const [anuncios, setAnuncios] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!sesion) return;
    verAnunciosEscaner(sesion.usuarioId)
      .then((d) => setAnuncios(d.anuncios))
      .catch((e) => setError(e.message));
  }, [sesion]);

  async function alGuardar(anuncioId, nuevoEstado) {
    if (nuevoEstado) await agregarFavorito(anuncioId);
    else await quitarFavorito(anuncioId);
  }

  return (
    <div style={{ padding: "14px 14px 32px" }}>
      <button
        onClick={() => onCambiarPestana?.("perfil-candidato")}
        style={{
          border: "1.5px solid var(--parch-3)",
          background: "var(--parch-0)",
          borderRadius: 999,
          width: 34,
          height: 34,
          fontSize: 16,
          color: "var(--ink)",
          cursor: "pointer",
          marginBottom: 10,
        }}
      >
        ←
      </button>

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
          🔍 Escáner de Trabajo
        </span>
        <span style={{ flex: 1, height: 1, background: "linear-gradient(to right, var(--parch-3), transparent)" }} />
      </div>

      {error && (
        <p style={{ color: "var(--red-andino)", fontSize: 14 }}>
          {error.includes("402") || error.includes("no está activo")
            ? "Tu Escáner de Trabajo no está activo o venció. Actívalo desde Mi Perfil de Candidato."
            : `No se pudo cargar: ${error}`}
        </p>
      )}

      {!anuncios && !error && <SkeletonLista n={3} />}

      {anuncios && anuncios.length === 0 && (
        <p style={{ color: "var(--ink-3)", fontSize: 14, textAlign: "center", padding: "24px 0" }}>
          Todavía no hay anuncios que calcen con tu perfil. Te avisamos apenas aparezca uno.
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
                onClick={() => abrirAnuncio(anuncio)}
                onGuardar={alGuardar}
              />
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
