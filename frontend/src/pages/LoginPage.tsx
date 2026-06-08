import { FormEvent, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore, useIsAuthenticated } from "../store/useAuthStore";
import "./LoginPage.css";

const CELLS = [
  { v: "X", color: "#ff6666" }, { v: "", color: "" },       { v: "O", color: "#66ffcc" },
  { v: "", color: "" },         { v: "X", color: "#ff6666" }, { v: "", color: "" },
  { v: "O", color: "#66ffcc" }, { v: "", color: "" },       { v: "X", color: "#ff6666" },
];

export default function LoginPage() {
  const navigate = useNavigate();
  const login = useAuthStore((s) => s.login);
  const clearError = useAuthStore((s) => s.clearError);
  const authStatus = useAuthStore((s) => s.status);
  const authError = useAuthStore((s) => s.error);
  const isAuthenticated = useIsAuthenticated();

  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [lembrar, setLembrar] = useState(false);
  const [msg, setMsg] = useState<{ texto: string; tipo: "ok" | "err" } | null>(null);

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/menu", { replace: true });
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    return () => {
      clearError();
    };
  }, [clearError]);

  async function handleLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    clearError();
    setMsg(null);

    if (!email || !senha) {
      setMsg({ texto: "PREENCHA TODOS OS CAMPOS", tipo: "err" });
      return;
    }
    if (!email.includes("@")) {
      setMsg({ texto: "EMAIL INVALIDO", tipo: "err" });
      return;
    }
    if (senha.length < 4) {
      setMsg({ texto: "SENHA MUITO CURTA", tipo: "err" });
      return;
    }

    try {
      await login({ email, password: senha });
      setMsg({ texto: "LOGIN REALIZADO", tipo: "ok" });
      navigate("/menu", { replace: true });
    } catch (error) {
      setMsg({
        texto: error instanceof Error ? error.message.toUpperCase() : "ERRO NO LOGIN",
        tipo: "err",
      });
    }
  }

  return (
    <main className="login-page">
      <div className="scanlines" />

      <section className="login-card">
        <div className="pixel-board board-pulse" aria-hidden="true">
          {CELLS.map((c, i) => (
            <div className="pixel-cell" key={i} style={{ color: c.color }}>
              {c.v}
            </div>
          ))}
        </div>

        <h1 className="title">JOGO DA VELHA</h1>
        <p className="subtitle">FACA LOGIN PARA JOGAR</p>

        <form className="login-form" onSubmit={handleLogin}>
          <label className="field-label" htmlFor="email">EMAIL</label>
          <input
            id="email"
            className="inp-pixel"
            type="email"
            placeholder="jogador@velha.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete={lembrar ? "email" : "off"}
          />

          <label className="field-label" htmlFor="senha">SENHA</label>
          <input
            id="senha"
            className="inp-pixel"
            type="password"
            placeholder="••••••••"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            autoComplete={lembrar ? "current-password" : "off"}
          />

          <button
            type="button"
            className="remember-row"
            onClick={() => setLembrar((prev) => !prev)}
          >
            <span className="remember-box">{lembrar ? "X" : ""}</span>
            LEMBRAR JOGADOR
          </button>

          <button className="btn-pixel" type="submit" disabled={authStatus === "loading"}>
            {authStatus === "loading" ? "ENTRANDO..." : "▶ ENTRAR"}
          </button>

          {msg && <p className={`msg ${msg.tipo}`}>{msg.texto}</p>}
          {!msg && authError && <p className="msg err">{authError.toUpperCase()}</p>}

          <p className="register-row">
            NOVO JOGADOR? <span className="link-btn" onClick={() => navigate("/registro")}>CRIAR CONTA</span>
          </p>
        </form>

        <div className="status-row">
          <span>{authStatus === "loading" ? "CONECTANDO" : "PRONTO"}</span>
          <span className="blink">_</span>
        </div>
      </section>
    </main>
  );
}