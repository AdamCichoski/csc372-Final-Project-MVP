import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function GameListPage() {
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    async function loadGames() {
      try {
        const res = await fetch("/api/games", {
          credentials: "include", // <-- this line
        });

        if (res.status === 401) {
          // not logged in
          navigate("/login");
          return;
        }

        const data = await res.json();
        setGames(data);
      } catch (err) {
        console.error("Failed to load games", err);
      } finally {
        setLoading(false);
      }
    }

    loadGames();
  }, [navigate]);

  if (loading) return <div>Loading games...</div>;

  return (
    <div style={{ padding: "1rem" }}>
      <h1>Your Games</h1>
      {games.length === 0 ? (
        <p>No games yet. Create your first game packet!</p>
      ) : (
        <ul>
          {games.map((g) => (
            <li key={g.id}>
              {g.title} (created {new Date(g.created_at).toLocaleString()})
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
