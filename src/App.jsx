import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import BottomNav from "./components/BottomNav.jsx";
import Home from "./pages/Home.jsx";
import Publicar from "./pages/Publicar.jsx";
import Perfil from "./pages/Perfil.jsx";
import Favoritos from "./pages/Favoritos.jsx";
import AnuncioDetalle from "./pages/AnuncioDetalle.jsx";
import { iniciarApp } from "./lib/telegram.js";
import { NavegacionProvider } from "./lib/navegacion.js";

const PANTALLAS = {
  inicio: Home,
  favoritos: Favoritos,
  publicar: Publicar,
  perfil: Perfil,
};

export default function App() {
  const [pestana, setPestana] = useState("inicio");
  const [anuncioAbiertoId, setAnuncioAbiertoId] = useState(null);

  useEffect(() => {
    iniciarApp();
  }, []);

  const Pantalla = PANTALLAS[pestana];

  return (
    <NavegacionProvider value={{ abrirAnuncio: setAnuncioAbiertoId }}>
      <div style={{ display: "flex", flexDirection: "column", minHeight: "100%" }}>
        <main style={{ flex: 1 }}>
          <AnimatePresence mode="wait">
            {anuncioAbiertoId ? (
              <motion.div
                key="detalle"
                initial={{ opacity: 0, x: 24 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 24 }}
                transition={{ duration: 0.2 }}
              >
                <AnuncioDetalle
                  anuncioId={anuncioAbiertoId}
                  onVolver={() => setAnuncioAbiertoId(null)}
                />
              </motion.div>
            ) : (
              <motion.div
                key={pestana}
                initial={{ opacity: 0, x: 8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -8 }}
                transition={{ duration: 0.18 }}
              >
                <Pantalla />
              </motion.div>
            )}
          </AnimatePresence>
        </main>
        {!anuncioAbiertoId && <BottomNav activa={pestana} onCambiar={setPestana} />}
      </div>
    </NavegacionProvider>
  );
}
