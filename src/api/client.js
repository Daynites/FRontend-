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
