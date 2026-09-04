import { obtenerToken } from "../lib/auth.js";

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

async function pedir(path, opciones = {}) {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...opciones,
  });
  if (!res.ok) {
    const detalle = await res.json().catch(() => ({}));
    throw new Error(detalle.detail || `Error ${res.status} en ${path}`);
  }
  return res.json();
}

/** Para los endpoints que sí derivan el usuario del JWT (/favoritos). */
function pedirAutenticado(path, opciones = {}) {
  const token = obtenerToken();
  return pedir(path, {
    ...opciones,
    headers: {
      ...(opciones.headers || {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });
}

export function listarAnuncios({ categoria, distrito, buscar } = {}) {
  const params = new URLSearchParams();
  if (categoria) params.set("categoria", categoria);
  if (distrito) params.set("distrito", distrito);
  if (buscar) params.set("buscar", buscar);
  const qs = params.toString();
  return pedir(`/anuncios${qs ? `?${qs}` : ""}`);
}

export function obtenerAnuncio(id) {
  return pedir(`/anuncios/${id}`);
}

export function listarCategorias() {
  return pedir("/categorias");
}

export function listarDistritos() {
  return pedir("/distritos");
}

export function loginConGoogle(credential) {
  return pedir("/auth/google", {
    method: "POST",
    body: JSON.stringify({ credential }),
  });
}

export function publicarAnuncio(datos) {
  return pedir("/anuncios", {
    method: "POST",
    body: JSON.stringify(datos),
  });
}

export function misAnuncios(usuarioId) {
  return pedir(`/usuarios/${usuarioId}/anuncios`);
}

export function eliminarAnuncio(anuncioId, usuarioId) {
  return pedir(`/anuncios/${anuncioId}?usuario_id=${usuarioId}`, {
    method: "DELETE",
  });
}

export function listarFavoritos() {
  return pedirAutenticado("/favoritos");
}

export function agregarFavorito(anuncioId) {
  return pedirAutenticado(`/favoritos/${anuncioId}`, { method: "POST" });
}

export function quitarFavorito(anuncioId) {
  return pedirAutenticado(`/favoritos/${anuncioId}`, { method: "DELETE" });
}

/* ── Candidatos ───────────────────────────────────────────────── */

export function obtenerPerfilCandidato(usuarioId) {
  return pedir(`/usuarios/${usuarioId}/perfil`);
}

export function guardarPerfilCandidato(usuarioId, datos) {
  return pedir(`/usuarios/${usuarioId}/perfil`, {
    method: "POST",
    body: JSON.stringify({ usuario_id: usuarioId, ...datos }),
  });
}

export function listarCandidatos(categoria) {
  return pedir(`/candidatos?categoria=${encodeURIComponent(categoria)}`);
}

/* ── Alertas y notificaciones ─────────────────────────────────── */

export function listarNotificaciones(usuarioId) {
  return pedir(`/usuarios/${usuarioId}/notificaciones`);
}

export function marcarNotificacionesLeidas(usuarioId) {
  return pedir(`/usuarios/${usuarioId}/notificaciones/leer`, { method: "POST" });
}

export function listarAlertas(usuarioId) {
  return pedir(`/usuarios/${usuarioId}/alertas`);
}

export function agregarAlerta(usuarioId, categoria) {
  return pedir(`/usuarios/${usuarioId}/alertas?categoria=${encodeURIComponent(categoria)}`, {
    method: "POST",
  });
}

export function eliminarAlerta(usuarioId, alertaId) {
  return pedir(`/usuarios/${usuarioId}/alertas/${alertaId}`, { method: "DELETE" });
}

/** Sube la imagen del comprobante de pago para un anuncio recién creado. */
export async function subirComprobante(anuncioId, archivo) {
  const token = obtenerToken();
  const formData = new FormData();
  formData.append("archivo", archivo);
  const res = await fetch(`${BASE_URL}/anuncios/${anuncioId}/comprobante`, {
    method: "POST",
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    body: formData,
  });
  if (!res.ok) throw new Error(`Error ${res.status} al subir el comprobante`);
  return true;
}

/* ── Admin ────────────────────────────────────────────────────────
   Igual que el resto de /admin/* en el prototipo estático: sin
   validación real de rol vista desde el frontend. El backend debe
   rechazar estas llamadas si quien las hace no es admin de verdad —
   esto es solo la interfaz. */

export function adminStats() {
  return pedirAutenticado("/admin/stats");
}

export function adminPendientes() {
  return pedirAutenticado("/admin/pendientes");
}

export function adminActivos() {
  return pedirAutenticado("/admin/activos");
}

export function adminUsuarios(limite = 100) {
  return pedirAutenticado(`/admin/usuarios?limite=${limite}`);
}

export function adminAprobar(id) {
  return pedirAutenticado(`/admin/anuncios/${id}/aprobar`, { method: "POST" });
}

export function adminRechazar(id) {
  return pedirAutenticado(`/admin/anuncios/${id}/rechazar`, { method: "POST" });
}

export function adminEliminarAnuncio(id) {
  return pedirAutenticado(`/admin/anuncios/${id}`, { method: "DELETE" });
}

/** Devuelve un object URL de la imagen del comprobante (o null si no hay). */
export async function adminVerComprobante(anuncioId) {
  const token = obtenerToken();
  const res = await fetch(`${BASE_URL}/admin/anuncios/${anuncioId}/comprobante`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`Error ${res.status} al cargar el comprobante`);
  const blob = await res.blob();
  return URL.createObjectURL(blob);
}
