import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import { pool } from "../db.js";
import { authMiddleware } from "../auth.js";

const router = express.Router();

// Simple disk storage for now: server/uploads
const uploadDir = path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const unique = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, unique + path.extname(file.originalname));
  },
});

const upload = multer({ storage });

// Get notes for a game packet
router.get("/:gamePacketId", authMiddleware, async (req, res) => {
  const { gamePacketId } = req.params;
  const result = await pool.query(
    "SELECT id, note_text, file_path, created_at, updated_at FROM notes WHERE game_packet_id = $1 ORDER BY created_at DESC",
    [gamePacketId]
  );
  res.json(result.rows);
});

// Create note (with optional file)
router.post("/:gamePacketId", authMiddleware, upload.single("file"), async (req, res) => {
  const { gamePacketId } = req.params;
  const { noteText } = req.body;
  const filePath = req.file ? `/uploads/${req.file.filename}` : null;

  const result = await pool.query(
    "INSERT INTO notes (game_packet_id, note_text, file_path) VALUES ($1, $2, $3) RETURNING *",
    [gamePacketId, noteText, filePath]
  );
  res.status(201).json(result.rows[0]);
});

// Update note
router.put("/:noteId", authMiddleware, async (req, res) => {
  const { noteId } = req.params;
  const { noteText } = req.body;
  const result = await pool.query(
    "UPDATE notes SET note_text = $1, updated_at = NOW() WHERE id = $2 RETURNING *",
    [noteText, noteId]
  );
  res.json(result.rows[0]);
});

// Delete note
router.delete("/:noteId", authMiddleware, async (req, res) => {
  const { noteId } = req.params;
  await pool.query("DELETE FROM notes WHERE id = $1", [noteId]);
  res.json({ message: "Deleted" });
});

export default router;
