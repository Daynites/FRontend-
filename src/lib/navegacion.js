import { createContext, useContext } from "react";

const NavegacionContext = createContext({ abrirAnuncio: () => {} });

export const NavegacionProvider = NavegacionContext.Provider;

export function useNavegacion() {
  return useContext(NavegacionContext);
}
