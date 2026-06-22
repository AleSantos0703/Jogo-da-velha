import { FormEvent, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore, useIsAuthenticated } from "../store/useAuthStore";
import "./LoginPage.css";

const CELLS = [
  { v: "O", color: "#66ffcc" }, { v: "", color: "" },       { v: "X", color: "#ff6666" },
  { v: "", color: "" },         { v: "O", color: "#66ffcc" }, { v: "", color: "" },
  { v: "X", color: "#ff6666" }, { v: "", color: "" },       { v: "O", color: "#66ffcc" },
];

export default function RegisterPage() {
  const navigate = useNavigate();
  const register = useAuthStore((s) => s.register);
  const clearError = useAuthStore((s) => s.clearError);
  const authStatus = useAuthStore((s) => s.status);
  const authError = useAuthStore((s) => s.error);
  const isAuthenticated = useIsAuthenticated();

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [msg, setMsg] = useState<{ texto: string; tipo: "ok" | "err" } | null>(null);

  useEffect(() => {
    if (isAuthenticated) navigate("/menu", { replace: true });
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    return () => clearError();
  }, [clearError]);

  async function handleRegister(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    clearError();
    setMsg(null);

    if (!username || !email || !senha) {
      setMsg({ texto: "PREENCHA TODOS OS CAMPOS", tipo: "err" });
      return;
    }
    if (username.length < 3) {
      setMsg({ texto: "NOME MUITO CURTO (MIN 3)", tipo: "err" });
      return;
    }
    if (!email.includes("@")) {
      setMsg({ texto: "EMAIL INVALIDO", tipo: "err" });
      return;
    }
    if (senha.length < 4) {
      setMsg({ texto: "SENHA MUITO CURTA (MIN 4)", tipo: "err" });
      return;
    }

    try {
      await register({ username, email, password: senha });
      setMsg({ texto: "CONTA CRIADA!", tipo: "ok" });
      navigate("/menu", { replace: true });
    } catch (error) {
      setMsg({
        texto: error instanceof Error ? error.message.toUpperCase() : "ERRO NO CADASTRO",
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
        <p className="subtitle">CRIAR NOVA CONTA</p>

        <form className="login-form" onSubmit={handleRegister}>
          <label className="field-label" htmlFor="username">JOGADOR</label>
          <input
            id="username"
            className="inp-pixel"
            type="text"
            placeholder="seu_nome"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            autoComplete="username"
          />

          <label className="field-label" htmlFor="email">EMAIL</label>
          <input
            id="email"
            className="inp-pixel"
            type="email"
            placeholder="jogador@velha.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
          />

          <label className="field-label" htmlFor="senha">SENHA</label>
          <input
            id="senha"
            className="inp-pixel"
            type="password"
            placeholder="••••••••"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            autoComplete="new-password"
          />

          <button className="btn-pixel" type="submit" disabled={authStatus === "loading"}>
            {authStatus === "loading" ? "CRIANDO..." : "▶ CRIAR CONTA"}
          </button>

          {msg && <p className={`msg ${msg.tipo}`}>{msg.texto}</p>}
          {!msg && authError && <p className="msg err">{authError.toUpperCase()}</p>}

          <p className="register-row">
            JA TEM CONTA?{" "}
            <span className="link-btn" onClick={() => navigate("/login")}>
              ENTRAR
            </span>
          </p>
        </form>

        <div className="status-row">
          <span>{authStatus === "loading" ? "REGISTRANDO" : "PRONTO"}</span>
          <span className="blink">_</span>
        </div>
      </section>
    </main>
  );
}
