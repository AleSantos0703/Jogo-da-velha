import { Route, Routes } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import MatchPage from "./pages/MatchPage";
import MenuPage from "./pages/MenuPage";
import RegisterPage from "./pages/RegisterPage";
import JoinMatchPage from "./pages/JoinMatchPage";
import PublicLayout from "./layouts/PublicLayout";
import RequireAuth from "./layouts/RequireAuth";

export default function App() {
  return (
    <Routes>
      {/* ── Rotas públicas ──────────────────────────────────────── */}
      <Route path="/" element={<PublicLayout />}>
        <Route index element={<LoginPage />} />
        <Route path="registro" element={<RegisterPage />} />
        <Route path="login" element={<LoginPage />} />

        {/* ── Requer login ────────────────────────────────────── */}
        <Route element={<RequireAuth />}>
          <Route path="menu" element={<MenuPage />} />
          <Route path="match" element={<MatchPage />} />
          <Route path="match/join/:token" element={<JoinMatchPage />} />
        </Route>
      </Route>
    </Routes>
  );
}
