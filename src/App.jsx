import { Suspense, lazy, useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import AppHeader from "./components/AppHeader.jsx";
import BottomNav from "./components/BottomNav.jsx";
import Home from "./pages/Home.jsx";
import AlertasOverlay from "./components/AlertasOverlay.jsx";
import SplashScreen, { DURACION_MINIMA_MS } from "./components/SplashScreen.jsx";
import { NavegacionProvider } from "./lib/navegacion.js";
import { esAdmin, useSesion } from "./lib/auth.js";
import { listarNotificaciones, misAnuncios } from "./api/client.js";
import { SkeletonLista } from "./components/Skeleton.jsx";

// Home se queda "eager" (es la pantalla de entrada, no tiene sentido
// esperar un Suspense para lo primero que ve todo el mundo). El resto
// se parte en su propio chunk JS y se descarga recién cuando el
// usuario toca esa pestaña — el bundle inicial baja bastante.
const Publicar = lazy(() => import("./pages/Publicar.jsx"));
const Perfil = lazy(() => import("./pages/Perfil.jsx"));
const Favoritos = lazy(() => import("./pages/Favoritos.jsx"));
const MisAnuncios = lazy(() => import("./pages/MisAnuncios.jsx"));
const Candidatos = lazy(() => import("./pages/Candidatos.jsx"));
const MiPerfilCandidato = lazy(() => import("./pages/MiPerfilCandidato.jsx"));
const Admin = lazy(() => import("./pages/Admin.jsx"));
const AnuncioDetalle = lazy(() => import("./pages/AnuncioDetalle.jsx"));

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
  const [anuncioAbierto, setAnuncioAbierto] = useState(null); // { id, preview } | null
  const [alertasAbiertas, setAlertasAbiertas] = useState(false);
  const [hayNoLeidas, setHayNoLeidas] = useState(false);
  const [mostrarSplash, setMostrarSplash] = useState(true);
  const [puedeVerCandidatos, setPuedeVerCandidatos] = useState(false);

  // "Candidatos" es una herramienta para quien contrata, no para quien
  // busca trabajo — solo se muestra a quienes ya tienen al menos un
  // anuncio APROBADO (no cuentan pendientes/rechazados/expirados).
  useEffect(() => {
    if (!sesion) {
      setPuedeVerCandidatos(false);
      return;
    }
    misAnuncios(sesion.usuarioId)
      .then((d) => setPuedeVerCandidatos(d.anuncios.some((a) => a.estado === "aprobado")))
      .catch(() => setPuedeVerCandidatos(false));
  }, [sesion]);

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

  // Por si cierra sesión (o cambia de cuenta) estando en Admin o Candidatos.
  useEffect(() => {
    if (pestana === "admin" && !usuarioEsAdmin) setPestana("inicio");
    if (pestana === "candidatos" && !puedeVerCandidatos) setPestana("inicio");
  }, [pestana, usuarioEsAdmin, puedeVerCandidatos]);

  const Pantalla = PANTALLAS[pestana];

  return (
    <NavegacionProvider
      value={{
        abrirAnuncio: (anuncioOrId) =>
          setAnuncioAbierto(
            typeof anuncioOrId === "object" ? { id: anuncioOrId.id, preview: anuncioOrId } : { id: anuncioOrId, preview: null }
          ),
      }}
    >
      <div style={{ display: "flex", flexDirection: "column", minHeight: "100%", position: "relative" }}>
        {!anuncioAbierto && (
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
        <main style={{ flex: 1, position: "relative" }}>
          <Suspense fallback={<div style={{ padding: 14 }}><SkeletonLista n={3} /></div>}>
            <AnimatePresence mode="popLayout">
            {anuncioAbierto ? (
              <motion.div
                key="detalle"
                initial={{ opacity: 0, x: 24 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 24 }}
                transition={{ duration: 0.2 }}
              >
                <AnuncioDetalle
                  anuncioId={anuncioAbierto.id}
                  preview={anuncioAbierto.preview}
                  onVolver={() => setAnuncioAbierto(null)}
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
                <Pantalla
                  onCambiarPestana={setPestana}
                  onAbrirAlertas={() => setAlertasAbiertas(true)}
                  puedeVerCandidatos={puedeVerCandidatos}
                />
              </motion.div>
            )}
          </AnimatePresence>
          </Suspense>
        </main>
        {!anuncioAbierto && (
          <BottomNav
            activa={pestana}
            onCambiar={setPestana}
            mostrarAdmin={usuarioEsAdmin}
            mostrarCandidatos={puedeVerCandidatos}
          />
        )}
      </div>

      <AnimatePresence>
        {alertasAbiertas && (
          <AlertasOverlay
            onCerrar={() => setAlertasAbiertas(false)}
            onAbrirAnuncio={(id) => setAnuncioAbierto({ id, preview: null })}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {mostrarSplash && <SplashScreen onTerminar={() => setMostrarSplash(false)} />}
      </AnimatePresence>
    </NavegacionProvider>
  );
}
