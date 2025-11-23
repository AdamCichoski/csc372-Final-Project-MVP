// client/src/components/GameCard.jsx
import gameJournalImage from "../assets/GameJournal.png";
import steamLogo from "../assets/steamLogo.png";

export default function GameCard({ game, onClick, onDelete }) {
  const created = new Date(game.created_at);

  const appid = game.steam_app_id;

  // If there is a Steam app id, try the Steam capsule image first
  const steamImageUrl = appid
    ? `https://cdn.cloudflare.steamstatic.com/steam/apps/${appid}/capsule_231x87.jpg`
    : null;

  // Decide initial image source:
  // - Steam capsule if steam_app_id exists
  // - Otherwise, local GameJournal.png
  const hasSteam = Boolean(appid);
  const initialSrc = hasSteam ? steamImageUrl || steamLogo : gameJournalImage;

  return (
    <div className="game-card mygame-card" onClick={onClick}>
      <div className="mygame-card-image-wrapper">
        <img
          src={initialSrc}
          alt={game.title}
          className="mygame-card-image"
          onError={(e) => {
            // If the Steam image fails, fall back:
            // - Steam games → steamLogo
            // - Non-Steam games → GameJournal
            const fallback = hasSteam ? steamLogo : gameJournalImage;
            if (e.target.src !== fallback) {
              e.target.src = fallback;
            }
          }}
        />
      </div>

      <div className="mygame-card-content">
        <div className="game-card-title mygame-card-title">
          {game.title}
        </div>
        <div className="game-card-meta">
          Added {created.toLocaleDateString()}
          {appid && (
            <>
              {" · "}
              <span className="badge">Steam #{appid}</span>
            </>
          )}
        </div>
      </div>

      <div className="mygame-card-footer">
        <span className="chip">Notes</span>
        <button
          className="btn btn-danger"
          type="button"
          onClick={(e) => {
            e.stopPropagation(); // don’t trigger onClick to open game
            onDelete?.();
          }}
        >
          Delete
        </button>
      </div>
    </div>
  );
}
