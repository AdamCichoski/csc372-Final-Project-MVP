import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Navbar from "./components/Navbar.jsx";
import LoginPage from "./pages/LoginPage.jsx";
import GameListPage from "./pages/GameListPage.jsx";
import GameDetailPage from "./pages/GameDetailPage.jsx";
import AccountPage from "./pages/AccountPage.jsx";

export default function App() {
  return (
    <Router>
      <div className="app-shell">
        <Navbar />
        <div className="page">
          <Routes>
            <Route path="/login" element={<LoginPage />} />
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
