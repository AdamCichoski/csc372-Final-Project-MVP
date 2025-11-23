// server/index.js
import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import path from "path";
import dotenv from "dotenv";

import authRoutes from "./routes/authRoutes.js";
import gameRoutes from "./routes/gameRoutes.js";
import noteRoutes from "./routes/noteRoutes.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;
const __dirname = process.cwd();

// --- Middleware ---
app.use(express.json());
app.use(cookieParser());

// Simple CORS for dev
app.use(
  cors({
    origin: process.env.CLIENT_ORIGIN || "http://localhost:5173",
    credentials: true,
  })
);

app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.get("/api/health", (req, res) => {
  res.json({ status: "ok", message: "Game Journal API is running" });
});

app.use("/api/auth", authRoutes);
app.use("/api/games", gameRoutes);
app.use("/api/notes", noteRoutes);

const clientDist = path.join(__dirname, "client", "dist");
app.use(express.static(clientDist));

app.get("*", (req, res) => {
  try {
    res.sendFile(path.join(clientDist, "index.html"));
  } catch {
    res.status(404).send("Not found");
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
