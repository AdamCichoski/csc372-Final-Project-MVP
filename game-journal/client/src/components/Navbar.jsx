import { NavLink, useNavigate } from "react-router-dom";
import { useState } from "react";
import { apiPost } from "../api.js";

export default function Navbar({ user, setUser }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();

  async function handleLogout() {
    try {
      await apiPost("/api/auth/logout", {});
    } catch {
      // ignore error
    }
    setUser(null);
    setMenuOpen(false);
    navigate("/login");
  }

  const linkClass = ({ isActive }) =>
    "nav-link" + (isActive ? " active" : "");

  return (
    <header className="navbar">
      <div className="navbar-title">Game Journal</div>
      <nav className="nav-links">
        <NavLink to="/games" className={linkClass}>
          Games
        </NavLink>

        {user ? (
          <div className="nav-account">
            <button
              type="button"
              className="nav-account-button"
              onClick={() => setMenuOpen((open) => !open)}
            >
              <span>{user.username || user.email}</span>
              <span style={{ fontSize: "0.8rem" }}>▾</span>
            </button>

            {menuOpen && (
              <div className="nav-account-menu">
                <div
                  className="nav-account-item"
                  onClick={() => {
                    setMenuOpen(false);
                    navigate("/account");
                  }}
                >
                  My Profile
                </div>
                <div
                  className="nav-account-item nav-account-item-danger"
                  onClick={handleLogout}
                >
                  Logout
                </div>
              </div>
            )}
          </div>
        ) : (
          <NavLink to="/login" className={linkClass}>
            Login
          </NavLink>
        )}
      </nav>
    </header>
  );
}
