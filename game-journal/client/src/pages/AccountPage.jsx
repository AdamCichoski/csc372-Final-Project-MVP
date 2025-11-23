// client/src/pages/AccountPage.jsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiGet } from "../api.js";

export default function AccountPage() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    async function loadMe() {
      setLoading(true);
      setError("");
      try {
        console.log("Fetching /api/auth/me...");
        const data = await apiGet("/api/auth/me");
        console.log("Got /api/auth/me:", data);
        setUser(data);
      } catch (err) {
        console.error("Error loading /api/auth/me:", err);
        if (err.status === 401) {
          // not logged in
          navigate("/login");
          return;
        }
        setError(err.message || "Failed to load user info.");
      } finally {
        setLoading(false);
      }
    }

    loadMe();
  }, [navigate]);

  return (
    <div className="card" style={{ maxWidth: 500 }}>
      <div className="card-header">
        <div className="card-title">Account</div>
        <div className="card-subtitle">
          Basic info used to separate your game journal from other users.
        </div>
      </div>

      {loading ? (
        <p>Loading account...</p>
      ) : error ? (
        <p className="error-text">{error}</p>
      ) : !user ? (
        <p>Unable to load user info.</p>
      ) : (
        <div className="form-grid">
          <div className="input-group">
            <label>Username</label>
            <div className="chip">{user.username}</div>
          </div>
          <div className="input-group">
            <label>Email</label>
            <div className="chip">{user.email}</div>
          </div>
          <div className="input-group">
            <label>User ID</label>
            <div className="helper-text">{user.id}</div>
          </div>
        </div>
      )}
    </div>
  );
}
