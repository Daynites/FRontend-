/**
 * Foto de perfil — guardada SOLO en este dispositivo (localStorage),
 * no en el backend. Todavía no existe un endpoint para subir/guardar
 * fotos de perfil ahí, así que esto no se sincroniza entre
 * dispositivos ni navegadores, y nadie más la ve (el avatar de Perfil
 * es de uso propio en toda la app, ningún otro lugar lo muestra hoy).
 * Si en algún momento se agrega un endpoint tipo
 * POST /usuarios/{id}/foto, esto se reemplaza fácil por eso.
 */

function clave(usuarioId) {
  return `junin_foto_${usuarioId}`;
}

export function leerFotoPerfil(usuarioId) {
  try {
    return localStorage.getItem(clave(usuarioId));
  } catch {
    return null;
  }
}

export function borrarFotoPerfil(usuarioId) {
  try {
    localStorage.removeItem(clave(usuarioId));
  } catch {
    /* noop */
  }
}

/** Redimensiona la imagen elegida a un cuadrado chico antes de guardarla, para no llenar el localStorage. */
export function guardarFotoPerfil(usuarioId, archivo) {
  return new Promise((resolve, reject) => {
    const lector = new FileReader();
    lector.onerror = () => reject(new Error("No se pudo leer la imagen"));
    lector.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error("Archivo de imagen inválido"));
      img.onload = () => {
        const TAMANO = 240;
        const canvas = document.createElement("canvas");
        canvas.width = TAMANO;
        canvas.height = TAMANO;
        const ctx = canvas.getContext("2d");

        // Recorte centrado tipo "cover", para que no salga deformada.
        const lado = Math.min(img.width, img.height);
        const sx = (img.width - lado) / 2;
        const sy = (img.height - lado) / 2;
        ctx.drawImage(img, sx, sy, lado, lado, 0, 0, TAMANO, TAMANO);

        const dataUrl = canvas.toDataURL("image/jpeg", 0.85);
        try {
          localStorage.setItem(clave(usuarioId), dataUrl);
          resolve(dataUrl);
        } catch {
          reject(new Error("No hay espacio para guardar la foto en este dispositivo"));
        }
      };
      img.src = lector.result;
    };
    lector.readAsDataURL(archivo);
  });
}
