import { useEffect, useRef } from "react";
import { motion } from "framer-motion";

const CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;

/**
 * Renderiza el botón oficial de Google dentro de un contenedor propio,
 * para poder darle nuestro estilo alrededor sin pelear con el iframe
 * que Google inyecta.
 */
export default function BotonGoogle({ onCredential }) {
  const contenedorRef = useRef(null);

  useEffect(() => {
    if (!CLIENT_ID || !window.google?.accounts?.id || !contenedorRef.current) return;

    window.google.accounts.id.initialize({
      client_id: CLIENT_ID,
      callback: (respuesta) => onCredential(respuesta.credential),
    });

    window.google.accounts.id.renderButton(contenedorRef.current, {
      theme: "outline",
      size: "large",
      shape: "pill",
      text: "continue_with",
      locale: "es",
    });
  }, [onCredential]);

  if (!CLIENT_ID) {
    return (
      <p style={{ color: "var(--berry)", fontSize: 13 }}>
        Falta configurar VITE_GOOGLE_CLIENT_ID en tu .env
      </p>
    );
  }

  return (
    <motion.div
      ref={contenedorRef}
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
    />
  );
}
