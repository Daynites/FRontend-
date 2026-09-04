import { useMemo } from "react";
import { motion } from "framer-motion";

const DURACION_MINIMA_MS = 2400;

/** Genera las 5 chispas una sola vez (posición/duración aleatoria, como en el prototipo). */
function generarParticulas() {
  return Array.from({ length: 5 }, () => {
    const duracion = 6 + Math.random() * 3;
    return {
      left: 20 + Math.random() * 60,
      drift: Math.random() * 40 - 20,
      duracion,
      delay: Math.random() * duracion,
      tamano: 2 + Math.random() * 1.5,
    };
  });
}

/**
 * Splash de bienvenida — migrado del prototipo estático (humo,
 * chispas subiendo, anillo dorado girando, logo respirando, flash de
 * salida). Se muestra `DURACION_MINIMA_MS` como mínimo y se puede
 * saltar tocando la pantalla.
 */
export default function SplashScreen({ onTerminar }) {
  const particulas = useMemo(generarParticulas, []);

  return (
    <motion.div
      onClick={onTerminar}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.6 }}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        background: "var(--brown)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
        cursor: "pointer",
      }}
    >
      {/* Humo dorado respirando */}
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          inset: "-20%",
          background:
            "radial-gradient(circle at 50% 55%, rgba(196,154,40,.35) 0%, transparent 60%), radial-gradient(circle at 40% 40%, rgba(122,80,32,.28) 0%, transparent 55%)",
          filter: "blur(30px)",
          animation: "sp-humo 6s ease-in-out infinite",
        }}
      />

      {/* Chispas subiendo */}
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          left: "50%",
          bottom: "50%",
          width: "min(60vw, 260px)",
          height: "min(60vw, 260px)",
          transform: "translate(-50%, 40%)",
        }}
      >
        {particulas.map((p, i) => (
          <div
            key={i}
            style={{
              position: "absolute",
              bottom: 0,
              left: `${p.left}%`,
              width: p.tamano,
              height: p.tamano,
              borderRadius: "50%",
              background: "var(--gold-3)",
              boxShadow: "0 0 5px 1.5px rgba(232,200,74,.85)",
              opacity: 0,
              "--drift": `${p.drift}px`,
              animation: `sp-subir ${p.duracion}s ease-in infinite, sp-parpadeo 1.6s ease-in-out infinite`,
              animationDelay: `${p.delay}s, 0s`,
            }}
          />
        ))}
      </div>

      {/* Logo con anillo y halo */}
      <div style={{ position: "relative", width: "min(72vw, 320px)", height: "min(72vw, 320px)", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div
          aria-hidden="true"
          style={{
            position: "absolute",
            inset: "-6%",
            borderRadius: "50%",
            padding: 3,
            background:
              "conic-gradient(from 0deg, transparent 0%, rgba(196,154,40,0) 70%, rgba(232,200,74,1) 82%, rgba(245,224,144,1) 86%, rgba(196,154,40,0) 92%, transparent 100%)",
            WebkitMask: "radial-gradient(farthest-side, transparent calc(100% - 4px), #000 calc(100% - 3px))",
            mask: "radial-gradient(farthest-side, transparent calc(100% - 4px), #000 calc(100% - 3px))",
            animation: "sp-girar 4s linear infinite",
            opacity: 0.9,
          }}
        />
        <div
          aria-hidden="true"
          style={{
            position: "absolute",
            inset: "2%",
            borderRadius: "50%",
            border: "2px solid rgba(232,200,74,.55)",
            animation: "sp-pulso 3.4s ease-out infinite",
          }}
        />
        <img
          src="/assets/logo_junin.webp"
          alt="Junín Anuncios"
          style={{
            position: "relative",
            zIndex: 2,
            width: "82%",
            height: "82%",
            objectFit: "contain",
            filter: "drop-shadow(0 0 22px rgba(232,200,74,.55))",
            animation: "sp-respirar 3.4s ease-in-out infinite",
          }}
        />
      </div>

      {/* Flash inicial */}
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          inset: 0,
          background: "radial-gradient(circle at 50% 50%, #fff 0%, rgba(255,255,255,.6) 25%, transparent 65%)",
          animation: "sp-flash 900ms ease-out 1",
          pointerEvents: "none",
        }}
      />

      <style>{`
        @keyframes sp-humo { 0%,100% { transform: scale(1) rotate(0deg); opacity:.7; } 50% { transform: scale(1.15) rotate(4deg); opacity:1; } }
        @keyframes sp-subir { 0% { transform: translateY(0) translateX(0); opacity:0; } 12% { opacity:.9; } 88% { opacity:.3; } 100% { transform: translateY(-180px) translateX(var(--drift,0px)); opacity:0; } }
        @keyframes sp-parpadeo { 0%,100% { filter: brightness(1); } 50% { filter: brightness(1.6); } }
        @keyframes sp-girar { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes sp-pulso { 0% { transform: scale(.9); opacity:0; } 15% { opacity:.9; } 60% { transform: scale(1.18); opacity:0; } 100% { opacity:0; } }
        @keyframes sp-respirar { 0%,100% { transform: scale(1); } 50% { transform: scale(1.025); } }
        @keyframes sp-flash { 0% { opacity:1; } 100% { opacity:0; } }
        @media (prefers-reduced-motion: reduce) {
          * { animation: none !important; }
        }
      `}</style>
    </motion.div>
  );
}

export { DURACION_MINIMA_MS };
