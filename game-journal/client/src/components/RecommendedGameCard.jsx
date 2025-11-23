import steamLogo from "../assets/steamLogo.png";

export default function RecommendedGameCard({ game, onAdd, isInLibrary }) {
  const appid = game.appid || game.steam_app_id;

  // Primary Steam capsule image
  const steamImageUrl = appid
    ? `https://cdn.cloudflare.steamstatic.com/steam/apps/${appid}/capsule_231x87.jpg`
    : null;

  return (
    <div className="game-card recommended-card">
      <div className="recommended-card-image-wrapper">
        <img
          src={steamImageUrl || steamLogo}
          alt={game.name}
          className="recommended-card-image"
          onError={(e) => {
            // if steam image fails, use local logo
            if (e.target.src !== steamLogo) {
              e.target.src = steamLogo;
            }
          }}
        />
      </div>

      <div className="recommended-card-content">
        <div className="game-card-title recommended-card-title">
          {game.name}
        </div>
        <div className="game-card-meta">
          {appid ? <span className="badge">Steam #{appid}</span> : null}
        </div>
      </div>

      <div className="recommended-card-footer">
        {isInLibrary ? (
          <span className="chip">Already in My Games</span>
        ) : (
          <button
            className="btn btn-primary"
            type="button"
            onClick={onAdd}
          >
            Add to My Games
          </button>
        )}
      </div>
    </div>
  );
}
