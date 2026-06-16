import { Route, Routes } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import MatchPage from "./pages/MatchPage";
import MenuPage from "./pages/MenuPage";
import RegisterPage from "./pages/RegisterPage";
import PublicLayout from "./layouts/PublicLayout";
import RequireAuth from "./layouts/RequireAuth";
import { useEffect } from "react";
import { useAuthStore } from "./store/useAuthStore";

export default function App() {
  const fetchMe = useAuthStore((s) => s.fetchMe);
  useEffect(() => { fetchMe(); }, [fetchMe]);

  return (
    <Routes>
      {/* ── Rotas públicas ──────────────────────────────────────── */}
      <Route path="/" element={<PublicLayout />}>
        <Route index element={<LoginPage />} />
        <Route path="registro" element={<RegisterPage />} />
        <Route path="login" element={<LoginPage />} />

        {/* ── Requer login (qualquer role) ───────────────────── */}
        <Route element={<RequireAuth />}>
          <Route path="menu" element={<MenuPage />} />
          <Route path="match" element={<MatchPage />} />
        </Route>
      </Route>
    </Routes>
  );
}