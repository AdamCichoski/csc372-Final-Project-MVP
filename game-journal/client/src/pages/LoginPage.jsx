// client/src/pages/LoginPage.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiPost } from "../api.js";

export default function LoginPage({ setUser }) {
  const [mode, setMode] = useState("login");
  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      const path =
        mode === "login" ? "/api/auth/login" : "/api/auth/register";

      const body =
        mode === "login"
          ? {
              email: form.email,
              password: form.password,
            }
          : {
              username: form.username,
              email: form.email,
              password: form.password,
            };

      console.log("Submitting to", path, "body:", body);

      const user = await apiPost(path, body);

      // user is the returned JSON from backend
      setUser(user);
      navigate("/games");
    } catch (err) {
      console.error("Auth error:", err);
      setError(
        mode === "login"
          ? "Login failed. Check your email/password."
          : err.message || "Registration failed. Try a different email."
      );
    } finally {
      setSubmitting(false);
    }
  }

  const isRegister = mode === "register";

  return (
    <div className="card" style={{ maxWidth: 420, margin: "2rem auto" }}>
      <div className="card-header">
        <div>
          <div className="card-title">
            {isRegister ? "Create Account" : "Welcome Back"}
          </div>
          <div className="card-subtitle">
            {isRegister
              ? "Register to start tracking your games."
              : "Sign in to see your games and notes."}
          </div>
        </div>
      </div>

      <form className="form-grid" onSubmit={handleSubmit}>
        {isRegister && (
          <div className="input-group">
            <label htmlFor="username">Username</label>
            <input
              id="username"
              name="username"
              type="text"
              value={form.username}
              onChange={handleChange}
              required
            />
          </div>
        )}

        <div className="input-group">
          <label htmlFor="email">Email</label>
          <input
            id="email"
            name="email"
            type="email"
            value={form.email}
            onChange={handleChange}
            required
          />
        </div>

        <div className="input-group">
          <label htmlFor="password">Password</label>
          <input
            id="password"
            name="password"
            type="password"
            value={form.password}
            onChange={handleChange}
            required
          />
          {isRegister && (
            <span className="helper-text">
              Pick any password you’re comfortable using for this project.
            </span>
          )}
        </div>

        {error && <div className="error-text">{error}</div>}

        <button className="btn btn-primary" type="submit" disabled={submitting}>
          {submitting
            ? isRegister
              ? "Creating account..."
              : "Logging in..."
            : isRegister
            ? "Create Account"
            : "Log In"}
        </button>

        <button
          type="button"
          className="btn btn-ghost"
          onClick={() => {
            setError("");
            setMode((m) => (m === "login" ? "register" : "login"));
          }}
        >
          {isRegister
            ? "Already have an account? Log in"
            : "Need an account? Register"}
        </button>
      </form>
    </div>
  );
}
