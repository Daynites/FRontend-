import { useCallback, useEffect, useState } from "react";
import { loginConGoogle } from "../api/client.js";

const CLAVE_SESION = "junin_sesion";

/**
 * Lista de usuario_id con acceso al panel de Admin — igual al
 * prototipo estático (ADMIN_IDS). Es un control de UI, no de
 * seguridad real: cualquier endpoint de /admin/* debe validar el rol
 * en el backend también, esto solo decide qué se muestra en pantalla.
 * Migrar a un campo `es_admin` que venga del backend cuando Railway
 * esté estable.
 */
const ADMIN_IDS = [1];

export function esAdmin(sesion) {
  return !!sesion && ADMIN_IDS.includes(sesion.usuarioId);
}

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
