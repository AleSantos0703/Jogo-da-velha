import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { matches } from "../lib/api";

export default function JoinMatchPage() {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) {
      navigate("/menu", { replace: true });
      return;
    }

    matches
      .joinByInvite(token)
      .then((match) => {
        navigate(`/match?id=${match.id}`, { replace: true });
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message.toUpperCase() : "LINK INVALIDO OU EXPIRADO");
      });
  }, [token, navigate]);

  if (error) {
    return (
      <main
        style={{
          display: "grid",
          placeItems: "center",
          minHeight: "100vh",
          background: "#0d0d1f",
          fontFamily: "'Press Start 2P', monospace",
          gap: "16px",
          flexDirection: "column",
        }}
      >
        <p style={{ color: "#ff6666", fontSize: "8px", textAlign: "center", padding: "0 20px" }}>
          {error}
        </p>
        <button
          onClick={() => navigate("/menu")}
          style={{
            fontFamily: "'Press Start 2P', monospace",
            fontSize: "8px",
            background: "#1a1a88",
            border: "none",
            borderBottom: "4px solid #0a0a44",
            borderRight: "4px solid #0a0a44",
            color: "#fff",
            padding: "14px 20px",
            cursor: "pointer",
          }}
        >
          ◀ VOLTAR AO MENU
        </button>
      </main>
    );
  }

  return (
    <main
      style={{
        display: "grid",
        placeItems: "center",
        minHeight: "100vh",
        background: "#0d0d1f",
        fontFamily: "'Press Start 2P', monospace",
        color: "#6666aa",
        fontSize: "9px",
      }}
    >
      ENTRANDO NA PARTIDA
      <span
        style={{
          display: "inline-block",
          animation: "blink 1s step-end infinite",
        }}
      >
        _
      </span>
    </main>
  );
}
