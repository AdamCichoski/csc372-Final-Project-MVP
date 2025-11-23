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
  const TARGET_COUNT = 50;

  try {
    // --- CASE 1: user entered a search term ---
    if (q.trim()) {
      // Do NOT filter out owned games. Just return Steam's matches.
      const games = await searchSteamGames(q.trim(), TARGET_COUNT);
      return res.json(games);
    }

    // --- CASE 2: no search term -> top games ---
    // We want up to 50 games that are NOT already in My Games.

    // 1. Get user's Steam app IDs
    const userGames = await pool.query(
      "SELECT steam_app_id FROM game_packets WHERE user_id = $1",
      [req.user.id]
    );

    const ownedSteamIds = new Set(
      userGames.rows
        .map((row) => row.steam_app_id)
        .filter((id) => id !== null)
        .map((id) => String(id))
    );

    // 2. Get a big pool of "top" games from Steam
    const RAW_LIMIT = 200; // we over-fetch so we can filter
    const allTop = await fetchTopSteamGames(RAW_LIMIT);

    // 3. Filter out games already in My Games
    const filtered = allTop.filter(
      (g) => !ownedSteamIds.has(String(g.appid))
    );

    // 4. Take up to TARGET_COUNT
    const limited = filtered.slice(0, TARGET_COUNT);

    res.json(limited);
  } catch (err) {
    console.error("GET /api/games/recommended error:", err);
    res.status(500).json({ message: "Failed to load recommended games" });
  }
});

export default router;
