import express from "express";
import { pool } from "../db.js";
import { signUser, hashPassword, comparePassword, authMiddleware } from "../auth.js";

const router = express.Router();

// Register
router.post("/register", async (req, res) => {
  const { username, email, password } = req.body;
  try {
    const password_hash = await hashPassword(password);
    const result = await pool.query(
      "INSERT INTO users (username, email, password_hash) VALUES ($1, $2, $3) RETURNING id, username, email",
      [username, email, password_hash]
    );
    const user = result.rows[0];
    const token = signUser(user);
    res
      .cookie("token", token, { httpOnly: true, sameSite: "lax" })
      .json(user);
  } catch (err) {
    console.error(err);
    res.status(400).json({ message: "Registration failed" });
  }
});

// Login
router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    const result = await pool.query(
      "SELECT * FROM users WHERE email = $1",
      [email]
    );
    const user = result.rows[0];
    if (!user) return res.status(401).json({ message: "Invalid credentials" });

    const ok = await comparePassword(password, user.password_hash);
    if (!ok) return res.status(401).json({ message: "Invalid credentials" });

    const token = signUser(user);
    res
      .cookie("token", token, { httpOnly: true, sameSite: "lax" })
      .json({ id: user.id, username: user.username, email: user.email });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Login failed" });
  }
});

// Me
router.get("/me", authMiddleware, (req, res) => {
  res.json(req.user);
});

// Logout
router.post("/logout", (req, res) => {
  res.clearCookie("token").json({ message: "Logged out" });
});

export default router;
