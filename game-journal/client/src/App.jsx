import { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Navbar from "./components/Navbar.jsx";
import LoginPage from "./pages/LoginPage.jsx";
import GameListPage from "./pages/GameListPage.jsx";
import GameDetailPage from "./pages/GameDetailPage.jsx";
import AccountPage from "./pages/AccountPage.jsx";
import { apiGet } from "./api.js";

export default function App() {
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  // On app load, try to get current user
  useEffect(() => {
    async function fetchMe() {
      try {
        const data = await apiGet("/api/auth/me");
        setUser(data);
      } catch (err) {
        setUser(null);
      } finally {
        setAuthLoading(false);
      }
    }
    fetchMe();
  }, []);

  if (authLoading) {
    // Optional: simple splash while checking auth
    return (
      <div className="app-shell">
        <div className="page">
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <Router>
      <div className="app-shell">
        <Navbar user={user} setUser={setUser} />
        <div className="page">
          <Routes>
            <Route path="/login" element={<LoginPage setUser={setUser} />} />
            <Route path="/games" element={<GameListPage />} />
            <Route path="/games/:id" element={<GameDetailPage />} />
            <Route path="/account" element={<AccountPage />} />
            <Route path="*" element={<Navigate to="/games" />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}
