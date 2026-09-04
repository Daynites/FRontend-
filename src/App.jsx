import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import AppHeader from "./components/AppHeader.jsx";
import BottomNav from "./components/BottomNav.jsx";
import Home from "./pages/Home.jsx";
import Publicar from "./pages/Publicar.jsx";
import Perfil from "./pages/Perfil.jsx";
import Favoritos from "./pages/Favoritos.jsx";
import MisAnuncios from "./pages/MisAnuncios.jsx";
import Candidatos from "./pages/Candidatos.jsx";
import MiPerfilCandidato from "./pages/MiPerfilCandidato.jsx";
import Admin from "./pages/Admin.jsx";
import AnuncioDetalle from "./pages/AnuncioDetalle.jsx";
import AlertasOverlay from "./components/AlertasOverlay.jsx";
import SplashScreen, { DURACION_MINIMA_MS } from "./components/SplashScreen.jsx";
import { NavegacionProvider } from "./lib/navegacion.js";
import { esAdmin, useSesion } from "./lib/auth.js";
import { listarNotificaciones } from "./api/client.js";

const PANTALLAS = {
  inicio: Home,
  favoritos: Favoritos,
  "mis-anuncios": MisAnuncios,
  candidatos: Candidatos,
  "perfil-candidato": MiPerfilCandidato,
  publicar: Publicar,
  perfil: Perfil,
  admin: Admin,
};

export default function App() {
  const { sesion } = useSesion();
  const usuarioEsAdmin = esAdmin(sesion);
  const [pestana, setPestana] = useState("inicio");
  const [anuncioAbiertoId, setAnuncioAbiertoId] = useState(null);
  const [alertasAbiertas, setAlertasAbiertas] = useState(false);
  const [hayNoLeidas, setHayNoLeidas] = useState(false);
  const [mostrarSplash, setMostrarSplash] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setMostrarSplash(false), DURACION_MINIMA_MS);
    return () => clearTimeout(t);
  }, []);

  // Chequeo liviano al iniciar sesión, solo para el punto rojo de la
  // campana — la lista completa se trae al abrir el overlay.
  useEffect(() => {
    if (!sesion) {
      setHayNoLeidas(false);
      return;
    }
    listarNotificaciones(sesion.usuarioId)
      .then((d) => setHayNoLeidas(d.no_leidas > 0))
      .catch(() => {});
  }, [sesion]);

  // Por si cierra sesión (o cambia de cuenta) estando en Admin.
  useEffect(() => {
    if (pestana === "admin" && !usuarioEsAdmin) setPestana("inicio");
  }, [pestana, usuarioEsAdmin]);

  const Pantalla = PANTALLAS[pestana];

  return (
    <NavegacionProvider value={{ abrirAnuncio: setAnuncioAbiertoId }}>
      <div style={{ display: "flex", flexDirection: "column", minHeight: "100%" }}>
        {!anuncioAbiertoId && (
          <AppHeader
            onAbrirPerfil={() => setPestana("perfil")}
            onAbrirAlertas={() => {
              if (!sesion) {
                setAlertasAbiertas(true); // el overlay ya muestra el aviso de login
                return;
              }
              setHayNoLeidas(false);
              setAlertasAbiertas(true);
            }}
            hayNoLeidas={hayNoLeidas}
          />
        )}
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
                <Pantalla onCambiarPestana={setPestana} onAbrirAlertas={() => setAlertasAbiertas(true)} />
              </motion.div>
            )}
          </AnimatePresence>
        </main>
        {!anuncioAbiertoId && <BottomNav activa={pestana} onCambiar={setPestana} mostrarAdmin={usuarioEsAdmin} />}
      </div>

      <AnimatePresence>
        {alertasAbiertas && (
          <AlertasOverlay
            onCerrar={() => setAlertasAbiertas(false)}
            onAbrirAnuncio={(id) => setAnuncioAbiertoId(id)}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {mostrarSplash && <SplashScreen onTerminar={() => setMostrarSplash(false)} />}
      </AnimatePresence>
    </NavegacionProvider>
  );
}
