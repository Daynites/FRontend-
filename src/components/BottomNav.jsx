import FranjaAndina from "./FranjaAndina.jsx";

/**
 * NOTA: el prototipo original no tiene una tab de "Favoritos" en el
 * bottom nav (ahí vive dentro de Perfil) y tampoco trae un ícono
 * ilustrado para ese caso. Se usa un emoji ⭐ como marcador temporal
 * hasta contar con un asset dedicado.
 */
const TABS = [
  { id: "inicio", label: "Inicio", icono: "/assets/nav_inicio.webp" },
  { id: "mis-anuncios", label: "Mis Anuncios", icono: "/assets/nav_mis_anuncios.webp" },
  { id: "candidatos", label: "Candidatos", icono: "/assets/nav_candidatos.webp" },
  { id: "favoritos", label: "Favoritos", emoji: "⭐" },
  { id: "perfil", label: "Perfil", icono: "/assets/nav_perfil.webp" },
];

export default function BottomNav({ activa, onCambiar, mostrarAdmin = false }) {
  const tabs = mostrarAdmin
    ? [...TABS, { id: "admin", label: "Admin", icono: "/assets/nav_admin.webp" }]
    : TABS;
  const mitad = Math.ceil(tabs.length / 2);
  const izquierda = tabs.slice(0, mitad);
  const derecha = tabs.slice(mitad);

  return (
    <nav
      style={{
        position: "sticky",
        bottom: 0,
        background: "rgba(247,237,204,.9)",
        backdropFilter: "blur(8px)",
        WebkitBackdropFilter: "blur(8px)",
      }}
    >
      <FranjaAndina altura={2} />
      <div
        style={{
          display: "flex",
          alignItems: "center",
          padding: "6px 4px calc(6px + env(safe-area-inset-bottom))",
        }}
      >
        {izquierda.map((tab) => (
          <NavItem key={tab.id} tab={tab} activa={activa === tab.id} onClick={() => onCambiar(tab.id)} />
        ))}

        <div style={{ flex: 1, display: "flex", justifyContent: "center" }}>
          <button
            onClick={() => onCambiar("publicar")}
            aria-label="Publicar anuncio"
            style={{
              width: 52,
              height: 52,
              marginTop: -20,
              borderRadius: "50%",
              border: "2.5px solid var(--gold)",
              background: "linear-gradient(135deg, var(--brown), var(--brown-3))",
              boxShadow: "0 0 14px rgba(196,154,40,.35)",
              fontSize: 22,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            ⚡
          </button>
        </div>

        {derecha.map((tab) => (
          <NavItem key={tab.id} tab={tab} activa={activa === tab.id} onClick={() => onCambiar(tab.id)} />
        ))}
      </div>
    </nav>
  );
}

function NavItem({ tab, activa, onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 2,
        background: "none",
        border: "none",
        padding: "4px 0",
        cursor: "pointer",
        opacity: activa ? 1 : 0.45,
      }}
    >
      {tab.icono ? (
        <img
          src={tab.icono}
          alt=""
          style={{
            width: 40,
            height: 40,
            objectFit: "contain",
            marginTop: -6,
            filter: "drop-shadow(0 2px 5px rgba(30,15,0,.6))",
          }}
        />
      ) : (
        <span style={{ fontSize: 20 }}>{tab.emoji}</span>
      )}
      <span
        style={{
          fontFamily: "var(--font-heading)",
          fontSize: 8,
          letterSpacing: 1,
          textTransform: "uppercase",
          color: activa ? "var(--brown)" : "var(--ink-3)",
        }}
      >
        {tab.label}
      </span>
    </button>
  );
}
