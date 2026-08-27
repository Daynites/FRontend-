import { useCallback, useEffect, useState } from "react";
import { loginConGoogle } from "../api/client.js";

const CLAVE_SESION = "junin_sesion";

function leerSesionGuardada() {
  try {
    const cruda = localStorage.getItem(CLAVE_SESION);
    return cruda ? JSON.parse(cruda) : null;
  } catch {
    return null;
  }
}

export function obtenerToken() {
  return leerSesionGuardada()?.token ?? null;
}

/**
 * Sesión mínima sobre /auth/google (ya existente en el backend).
 *
 * NOTA: api.py hoy recibe `usuario_id` directo en el body de varios
 * endpoints (POST /anuncios incluido) en vez de derivarlo del JWT —
 * es la brecha de autorización que quedó pendiente de corregir.
 * Los endpoints de /favoritos son la excepción: ya usan
 * Depends(obtener_usuario_actual), así que ahí sí viaja el token.
 */
export function useSesion() {
  const [sesion, setSesion] = useState(leerSesionGuardada);

  useEffect(() => {
    if (sesion) {
      localStorage.setItem(CLAVE_SESION, JSON.stringify(sesion));
    } else {
      localStorage.removeItem(CLAVE_SESION);
    }
  }, [sesion]);

  const iniciarSesionConCredential = useCallback(async (credential) => {
    const data = await loginConGoogle(credential);
    setSesion({
      usuarioId: data.usuario_id,
      nombre: data.nombre,
      email: data.email,
      token: data.token,
    });
    return data;
  }, []);

  const cerrarSesion = useCallback(() => setSesion(null), []);

  return { sesion, iniciarSesionConCredential, cerrarSesion };
}
