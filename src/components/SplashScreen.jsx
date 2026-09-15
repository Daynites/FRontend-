import { motion } from "framer-motion";

const DURACION_MINIMA_MS = 2600;

/**
 * Splash de bienvenida — "amanecer sobre las montañas". Una sola
 * pasada (nada de loops infinitos): el cielo pasa de noche a amanecer,
 * la cordillera se traza como con una pluma y luego se solidifica, el
 * sol se asoma detrás, y el logo se funde encima al final. Se puede
 * saltar tocando la pantalla.
 */
export default function SplashScreen({ onTerminar }) {
  return (
    <motion.div
      onClick={onTerminar}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.6 }}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        overflow: "hidden",
        cursor: "pointer",
        background: "linear-gradient(180deg, #0d1b3a 0%, #1c2f52 55%, #2c1810 100%)",
      }}
    >
      {/* Capa de amanecer — se funde encima del cielo nocturno */}
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          inset: 0,
          background:
            "linear-gradient(180deg, #2a2f5c 0%, #7a4a3a 45%, #c4762a 75%, #e8a23f 100%)",
          animation: "sp-amanecer 1.6s ease-in-out 0.2s forwards",
          opacity: 0,
        }}
      />

      {/* Sol asomándose */}
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          left: "50%",
          top: "58%",
          width: "34vw",
          maxWidth: 150,
          aspectRatio: "1",
          borderRadius: "50%",
          transform: "translate(-50%, 0)",
          background: "radial-gradient(circle, #fff1c2 0%, #f5c15a 45%, rgba(245,193,90,0) 75%)",
          boxShadow: "0 0 60px 20px rgba(245,193,90,.45)",
          opacity: 0,
          animation: "sp-sol 1.8s cubic-bezier(.2,.7,.3,1) 0.5s forwards",
        }}
      />

      {/* Cordillera — trazo de contorno */}
      <svg
        viewBox="0 0 400 200"
        preserveAspectRatio="none"
        style={{ position: "absolute", left: 0, right: 0, bottom: 0, width: "100%", height: "42%" }}
      >
        <path
          d="M0,160 L55,95 L95,135 L145,65 L185,115 L228,52 L278,122 L328,82 L400,140"
          fill="none"
          stroke="#f5d99a"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{
            strokeDasharray: 900,
            strokeDashoffset: 900,
            animation: "sp-trazo 1.3s ease-out 0.15s forwards",
            filter: "drop-shadow(0 0 4px rgba(245,217,154,.6))",
          }}
        />
      </svg>

      {/* Cordillera — silueta sólida, se asienta después del trazo y tapa la parte baja del sol */}
      <svg
        viewBox="0 0 400 200"
        preserveAspectRatio="none"
        style={{ position: "absolute", left: 0, right: 0, bottom: 0, width: "100%", height: "42%" }}
      >
        <path
          d="M0,160 L55,95 L95,135 L145,65 L185,115 L228,52 L278,122 L328,82 L400,140 L400,200 L0,200 Z"
          fill="#1c1006"
          style={{ opacity: 0, animation: "sp-silueta .7s ease-out 1.15s forwards" }}
        />
      </svg>

      {/* Logo, se funde encima al final */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <img
          src="/assets/logo_junin.webp"
          alt="Junín Anuncios"
          style={{
            width: "min(58vw, 250px)",
            filter: "drop-shadow(0 6px 20px rgba(0,0,0,.5))",
            opacity: 0,
            animation: "sp-logo 0.8s ease-out 1.7s forwards",
          }}
        />
      </div>

      <style>{`
        @keyframes sp-amanecer { from { opacity: 0; } to { opacity: 1; } }
        @keyframes sp-sol {
          0% { opacity: 0; transform: translate(-50%, 30px) scale(.85); }
          100% { opacity: 1; transform: translate(-50%, -55px) scale(1); }
        }
        @keyframes sp-trazo { to { stroke-dashoffset: 0; } }
        @keyframes sp-silueta { to { opacity: 1; } }
        @keyframes sp-logo {
          from { opacity: 0; transform: scale(.9) translateY(6px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }
        @media (prefers-reduced-motion: reduce) {
          * { animation: none !important; opacity: 1 !important; }
        }
      `}</style>
    </motion.div>
  );
}

export { DURACION_MINIMA_MS };
