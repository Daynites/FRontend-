/**
 * Panel de Admin — visible solo para usuario_id en ADMIN_IDS (ver
 * lib/auth.js). Placeholder por ahora: Railway está con problemas,
 * así que no hay forma de traer stats/pendientes/usuarios reales
 * todavía. Cuando el backend esté estable, esto se conecta a los
 * endpoints de /admin/* del prototipo (stats, anuncios pendientes,
 * usuarios).
 */
export default function Admin() {
  return (
    <div style={{ padding: "16px 16px 32px" }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          marginBottom: 16,
        }}
      >
        <span style={{ fontSize: 22 }}>🛡️</span>
        <h1
          style={{
            margin: 0,
            fontFamily: "var(--font-heading)",
            fontSize: 18,
            fontWeight: 700,
            color: "var(--ink)",
          }}
        >
          Panel de Admin
        </h1>
      </div>

      <div
        style={{
          background: "var(--parch-0)",
          border: "1.5px solid var(--parch-2)",
          borderRadius: "var(--radius-md)",
          padding: "16px",
          textAlign: "center",
        }}
      >
        <p style={{ margin: "0 0 6px", fontSize: 14, color: "var(--ink-2)", fontWeight: 600 }}>
          Todavía no hay nada que mostrar acá.
        </p>
        <p style={{ margin: 0, fontSize: 13, color: "var(--ink-3)" }}>
          El backend en Railway está con problemas ahora mismo, así que las
          estadísticas, anuncios pendientes y gestión de usuarios se conectan
          cuando vuelva a estar disponible.
        </p>
      </div>
    </div>
  );
}
