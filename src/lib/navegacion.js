import { createContext, useContext } from "react";

/**
 * abrirAnuncio acepta el objeto completo del anuncio (cuando se abre
 * desde una tarjeta que ya lo tiene, ej. Home/Favoritos — esto habilita
 * la transición compartida de título/categoría hacia el detalle) o
 * solo el id (ej. desde una notificación, donde no hay preview a mano).
 */
const NavegacionContext = createContext({ abrirAnuncio: () => {} });

export const NavegacionProvider = NavegacionContext.Provider;

export function useNavegacion() {
  return useContext(NavegacionContext);
}
