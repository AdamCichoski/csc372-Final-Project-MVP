import { NavLink, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

export default function Navbar() {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  // Very lightweight "who am I" check
  useEffect(() => {
    async function fetchMe() {
      try {
        const res = await fetch("/api/auth/me", { credentials: "include" });
        if (res.ok) {
          const data = await res.json();
          setUser(data);
        } else {
          setUser(null);
        }
      } catch {
        setUser(null);
      }
    }
    fetchMe();
  }, []);

  async function handleLogout() {
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });
    } catch {}
    setUser(null);
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
        <NavLink to="/account" className={linkClass}>
          Account
        </NavLink>
        {user ? (
          <>
            <span className="chip">{user.username || user.email}</span>
            <button className="nav-button" onClick={handleLogout}>
              Logout
            </button>
          </>
        ) : (
          <NavLink to="/login" className={linkClass}>
            Login
          </NavLink>
        )}
      </nav>
    </header>
  );
}
