import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiGet, apiPost, apiDelete } from "../api.js";
import GameCard from "../components/GameCard.jsx";

export default function GameListPage() {
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState("");
  const [steamAppId, setSteamAppId] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  async function loadGames() {
    setLoading(true);
    setError("");
    try {
      const data = await apiGet("/api/games");
      setGames(data);
    } catch (err) {
      console.error(err);
      if (err.status === 401) {
        navigate("/login");
        return;
      }
      setError("Failed to load games.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadGames();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleCreateGame(e) {
    e.preventDefault();
    setError("");
    try {
      await apiPost("/api/games", {
        title,
        steamAppId: steamAppId || null,
      });
      setTitle("");
      setSteamAppId("");
      await loadGames();
    } catch (err) {
      console.error(err);
      if (err.status === 401) {
        navigate("/login");
        return;
      }
      setError("Failed to create game packet.");
    }
  }

  async function handleDeleteGame(id) {
    if (!window.confirm("Delete this game and all its notes?")) return;

    try {
      await apiDelete(`/api/games/${id}`);
      setGames((g) => g.filter((game) => game.id !== id));
    } catch (err) {
      console.error(err);
      alert("Failed to delete game.");
    }
  }

  return (
    <div>
      <h1 className="section-title">Your Games</h1>

      <div className="card" style={{ marginBottom: "1rem" }}>
        <div className="card-header">
          <div>
            <div className="card-title">Create a Game Packet</div>
            <div className="card-subtitle">
              One packet per game you’re tracking (for notes, routes, loot, etc.).
            </div>
          </div>
        </div>

        <form className="form-grid" onSubmit={handleCreateGame}>
          <div className="input-group">
            <label htmlFor="title">Game Title</label>
            <input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              placeholder="Elden Ring, Stardew Valley..."
            />
          </div>
          <div className="input-group">
            <label htmlFor="steamAppId">
              Steam App ID <span className="helper-text">(optional)</span>
            </label>
            <input
              id="steamAppId"
              value={steamAppId}
              onChange={(e) => setSteamAppId(e.target.value)}
              placeholder="e.g. 1245620"
            />
          </div>
          {error && <div className="error-text">{error}</div>}
          <button className="btn btn-primary" type="submit">
            Add Game
          </button>
        </form>
      </div>

      <div className="card">
        <div className="card-header">
          <div className="card-title">Game Library</div>
          <div className="card-subtitle">
            Click a card to open notes for that game.
          </div>
        </div>

        {loading ? (
          <p>Loading games...</p>
        ) : games.length === 0 ? (
          <p>No games yet. Create your first game packet above.</p>
        ) : (
          <div className="games-grid">
            {games.map((g) => (
              <GameCard
                key={g.id}
                game={g}
                onClick={() => navigate(`/games/${g.id}`)}
                onDelete={() => handleDeleteGame(g.id)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
