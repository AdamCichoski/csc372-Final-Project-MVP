// server/routes/gameRoutes.js
import express from "express";
import { pool } from "../db.js";
import { authMiddleware } from "../auth.js";
import { fetchTopSteamGames, searchSteamGames } from "../steam.js";

const router = express.Router();

// --- Existing My Games routes (example placeholders) ---

// GET /api/games  - list games for logged-in user
router.get("/", authMiddleware, async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT id, user_id, title, steam_app_id, created_at FROM game_packets WHERE user_id = $1 ORDER BY created_at DESC",
      [req.user.id]
    );
    res.json(result.rows);
  } catch (err) {
    console.error("GET /api/games error:", err);
    res.status(500).json({ message: "Failed to load games" });
  }
});

// POST /api/games - create new game for logged-in user
router.post("/", authMiddleware, async (req, res) => {
  const { title, steamAppId } = req.body;
  if (!title) {
    return res.status(400).json({ message: "Title is required" });
  }

  try {
    const result = await pool.query(
      "INSERT INTO game_packets (user_id, title, steam_app_id) VALUES ($1, $2, $3) RETURNING id, user_id, title, steam_app_id, created_at",
      [req.user.id, title, steamAppId || null]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error("POST /api/games error:", err);
    res.status(500).json({ message: "Failed to create game" });
  }
});

// DELETE /api/games/:id - delete a game (and its notes) for logged-in user
router.delete("/:id", authMiddleware, async (req, res) => {
  const id = req.params.id;
  try {
    await pool.query(
      "DELETE FROM game_packets WHERE id = $1 AND user_id = $2",
      [id, req.user.id]
    );
    res.json({ message: "Game deleted" });
  } catch (err) {
    console.error("DELETE /api/games/:id error:", err);
    res.status(500).json({ message: "Failed to delete game" });
  }
});


// Recommended games from Steam
router.get("/recommended", authMiddleware, async (req, res) => {
  const q = req.query.q || "";

  try {
    let games;
    if (q.trim()) {
      games = await searchSteamGames(q.trim());
    } else {
      games = await fetchTopSteamGames();
    }

    res.json(games);
  } catch (err) {
    console.error("GET /api/games/recommended error:", err);
    res.status(500).json({ message: "Failed to load recommended games" });
  }
});

export default router;
