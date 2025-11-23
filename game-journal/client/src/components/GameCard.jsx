export default function GameCard({ game, onClick, onDelete }) {
  const created = new Date(game.created_at);

  return (
    <div className="game-card" onClick={onClick}>
      <div className="game-card-title">{game.title}</div>
      <div className="game-card-meta">
        Added {created.toLocaleDateString()}{" "}
        {game.steam_app_id && (
          <>
            · <span className="badge">Steam #{game.steam_app_id}</span>
          </>
        )}
      </div>
      <div style={{ marginTop: "0.5rem", display: "flex", justifyContent: "space-between" }}>
        <span className="chip">Notes tracked</span>
        <button
          className="btn btn-danger"
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onDelete?.();
          }}
        >
          Delete
        </button>
      </div>
    </div>
  );
}
