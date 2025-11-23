import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiGet, apiPost, apiDelete } from "../api.js";
import GameCard from "../components/GameCard.jsx";
import RecommendedGameCard from "../components/RecommendedGameCard.jsx";
import Modal from "../components/Modal.jsx";

export default function GameListPage() {
  const [games, setGames] = useState([]);
  const [loadingGames, setLoadingGames] = useState(true);

  const [recommended, setRecommended] = useState([]);
  const [loadingRecommended, setLoadingRecommended] = useState(true);

  const [title, setTitle] = useState("");
  const [steamAppId, setSteamAppId] = useState("");
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [appliedSearch, setAppliedSearch] = useState("");

  const [showAddModal, setShowAddModal] = useState(false);

  const navigate = useNavigate();

  // Filtered My Games
  const filteredGames = useMemo(() => {
    if (!appliedSearch.trim()) return games;
    const term = appliedSearch.toLowerCase();
    return games.filter((g) =>
      (g.title || "").toLowerCase().includes(term)
    );
  }, [games, appliedSearch]);

  async function loadGames() {
    setLoadingGames(true);
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
      setLoadingGames(false);
    }
  }

  async function loadRecommended(query = "") {
    setLoadingRecommended(true);
    try {
      const q = query.trim();
      const path = q
        ? `/api/games/recommended?q=${encodeURIComponent(q)}`
        : "/api/games/recommended";

      const data = await apiGet(path);
      setRecommended(data);
    } catch (err) {
      console.error("Error loading recommended:", err);
      setRecommended([]);
    } finally {
      setLoadingRecommended(false);
    }
  }

  useEffect(() => {
    loadGames();
    loadRecommended();
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
      setShowAddModal(false);
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

  async function handleSearchSubmit(e) {
    e.preventDefault();
    const value = search.trim();
    setAppliedSearch(value);
    await loadRecommended(value);
  }

  async function handleAddRecommended(game) {
    try {
      await apiPost("/api/games", {
        title: game.name,
        steamAppId: game.appid || null,
      });
      await loadGames();
    } catch (err) {
      console.error(err);
      alert("Failed to add game to My Games.");
    }
  }

  function isInLibraryByAppId(appid) {
    if (!appid) return false;
    return games.some(
      (g) => String(g.steam_app_id) === String(appid)
    );
  }

  return (
    <div>
      {/* Search row */}
      <form className="search-row" onSubmit={handleSearchSubmit}>
        <div className="input-group search-input">
          <label htmlFor="search">Search games</label>
          <input
            id="search"
            type="text"
            placeholder="Search by title…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <span className="helper-text">
            Filters your games and updates Steam recommendations.
          </span>
        </div>
        <button className="btn btn-primary" type="submit">
          Search
        </button>
      </form>

      {/* My Games section */}
      <div className="card" style={{ marginBottom: "1rem" }}>
        <div className="card-header section-header-row">
          <h2 className="card-title">My Games</h2>
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
            <p className="helper-text" style={{ margin: 0 }}>
              {appliedSearch
                ? `Filtered by "${appliedSearch}"`
                : "Games you’re actively tracking."}
            </p>
            <button
              type="button"
              className="btn btn-ghost"
              onClick={() => {
                setError("");
                setTitle("");
                setSteamAppId("");
                setShowAddModal(true);
              }}
            >
              Manually add game
            </button>
          </div>
        </div>

        {loadingGames ? (
          <p>Loading games...</p>
        ) : filteredGames.length === 0 ? (
          <p>No games match your search. Try another title, or add a game.</p>
        ) : (
          <div className="games-grid-5">
            {filteredGames.map((g) => (
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

      {/* Recommended section */}
      <div className="card">
        <div className="card-header section-header-row">
          <h2 className="card-title">Recommended from Steam</h2>
          <p className="helper-text">
            {appliedSearch
              ? `Top Steam matches for "${appliedSearch}".`
              : "Popular or featured games from Steam."}
          </p>
        </div>

        {loadingRecommended ? (
          <p>Loading recommended games...</p>
        ) : recommended.length === 0 ? (
          <p>No recommendations found. Try a different search term.</p>
        ) : (
          <div className="games-grid-5">
            {recommended.map((g) => (
              <RecommendedGameCard
                key={g.appid || g.id}
                game={g}
                isInLibrary={isInLibraryByAppId(g.appid)}
                onAdd={() => handleAddRecommended(g)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Modal for manually adding a game */}
      {showAddModal && (
        <Modal
          title="Manually add game"
          onClose={() => setShowAddModal(false)}
        >
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
            <div style={{ display: "flex", gap: "0.5rem", marginTop: "0.5rem" }}>
              <button className="btn btn-primary" type="submit">
                Add Game
              </button>
              <button
                type="button"
                className="btn btn-ghost"
                onClick={() => setShowAddModal(false)}
              >
                Cancel
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
