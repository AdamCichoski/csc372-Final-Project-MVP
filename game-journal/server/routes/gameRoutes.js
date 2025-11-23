import express from "express";
import { pool } from "../db.js";
import { authMiddleware } from "../auth.js";
import { searchSteamGames, getSteamGameDetails } from "../steam.js";

const router = express.Router();

// List user game packets
router.get("/", authMiddleware, async (req, res) => {
  const userId = req.user.id;
  const result = await pool.query(
    "SELECT id, title, steam_app_id, created_at FROM game_packets WHERE user_id = $1 ORDER BY created_at DESC",
    [userId]
  );
  res.json(result.rows);
});

// Create game packet
router.post("/", authMiddleware, async (req, res) => {
  const userId = req.user.id;
  const { title, steamAppId } = req.body;
  const result = await pool.query(
    "INSERT INTO game_packets (user_id, title, steam_app_id) VALUES ($1, $2, $3) RETURNING *",
    [userId, title, steamAppId || null]
  );
  res.status(201).json(result.rows[0]);
});

// Delete game packet
router.delete("/:id", authMiddleware, async (req, res) => {
  const userId = req.user.id;
  const gameId = req.params.id;
  await pool.query(
    "DELETE FROM game_packets WHERE id = $1 AND user_id = $2",
    [gameId, userId]
  );
  res.json({ message: "Deleted" });
});

// Steam search endpoint (proxy to Steam API)
router.get("/steam/search", authMiddleware, async (req, res) => {
  const { q } = req.query;
  if (!q) return res.json([]);
  try {
    const games = await searchSteamGames(q);
    res.json(games);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Steam search failed" });
  }
});

// Steam details endpoint
router.get("/:id/steam-details", authMiddleware, async (req, res) => {
  const { appId } = req.query;
  if (!appId) return res.status(400).json({ message: "appId required" });

  try {
    const details = await getSteamGameDetails(appId);
    res.json(details);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Steam details failed" });
  }
});

export default router;
