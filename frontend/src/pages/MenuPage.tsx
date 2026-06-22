import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore, useUser } from "../store/useAuthStore";
import { matches, invite, ranking, type Match, type RankingEntry } from "../lib/api";
import "./MenuPage.css";

// Painéis que podem ser abertos no menu
type Panel = "none" | "invite" | "ranking" | "perfil";

export default function MenuPage() {
  const navigate = useNavigate();
  const user = useUser();
  const logout = useAuthStore((s) => s.logout);

  const [panel, setPanel] = useState<Panel>("none");
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState("");

  // Estados do painel de convite
  const [partida, setPartida] = useState<Match | null>(null);
  const [link, setLink] = useState("");
  const [copiado, setCopiado] = useState(false);

  // Estados do painel de ranking
  const [rankingData, setRankingData] = useState<RankingEntry[]>([]);
  const [totalPartidas, setTotalPartidas] = useState(0);
  const [pagina, setPagina] = useState(1);

  // Estados do painel de perfil
  const [meuPerfil, setMeuPerfil] = useState<RankingEntry | null>(null);

  function fecharPainel() {
    setPanel("none");
    setErro("");
    setLink("");
    setPartida(null);
    setCopiado(false);
  }

  async function iniciarPartida() {
    setLoading(true);
    setErro("");
    try {
      const novaPartida = await matches.create();
      setPartida(novaPartida);
      setLink(invite.buildLink(novaPartida.inviteToken));
      setPanel("invite");
    } catch (err) {
      setErro(err instanceof Error ? err.message.toUpperCase() : "ERRO AO CRIAR PARTIDA");
    } finally {
      setLoading(false);
    }
  }

  async function copiarLink() {
    try {
      await navigator.clipboard.writeText(link);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2000);
    } catch {
      setErro("ERRO AO COPIAR — COPIE MANUALMENTE");
    }
  }

  // Carrega ranking quando o painel de ranking abre ou muda de página
  useEffect(() => {
    if (panel !== "ranking") return;
    setLoading(true);
    ranking.list(pagina, 10)
      .then((res) => { setRankingData(res.data); setTotalPartidas(res.total); })
      .catch(() => setErro("ERRO AO CARREGAR RANKING"))
      .finally(() => setLoading(false));
  }, [panel, pagina]);

  // Carrega perfil quando o painel de perfil abre
  useEffect(() => {
    if (panel !== "perfil") return;
    setLoading(true);
    ranking.me()
      .then(setMeuPerfil)
      .catch(() => setErro("ERRO AO CARREGAR PERFIL"))
      .finally(() => setLoading(false));
  }, [panel]);

  async function sair() {
    await logout();
    navigate("/login", { replace: true });
  }

  const totalPaginas = Math.ceil(totalPartidas / 10);

  return (
    <main className="menu-page">
      <div className="scanlines" />

      <div className="menu-container">
        <header className="menu-header">
          <h1 className="menu-title">JOGO DA VELHA</h1>
          <div className="menu-user-row">
            <span className="menu-username">▸ {user?.username ?? "JOGADOR"}</span>
            <button className="btn-logout" onClick={sair}>SAIR</button>
          </div>
        </header>

        {erro && panel === "none" && <p className="menu-error">{erro}</p>}

        <nav className="menu-nav">
          <button className="menu-btn" onClick={iniciarPartida} disabled={loading}>
            <span className="menu-btn-icon">⊞</span>
            <span className="menu-btn-label">{loading && panel === "none" ? "CRIANDO..." : "INICIAR PARTIDA"}</span>
            <span className="menu-btn-arrow">▶</span>
          </button>

          <button
            className={`menu-btn ${panel === "ranking" ? "active" : ""}`}
            onClick={() => panel === "ranking" ? fecharPainel() : setPanel("ranking")}
          >
            <span className="menu-btn-icon">☆</span>
            <span className="menu-btn-label">RANKING GERAL</span>
            <span className="menu-btn-arrow">{panel === "ranking" ? "▼" : "▶"}</span>
          </button>

          <button
            className={`menu-btn ${panel === "perfil" ? "active" : ""}`}
            onClick={() => panel === "perfil" ? fecharPainel() : setPanel("perfil")}
          >
            <span className="menu-btn-icon">◈</span>
            <span className="menu-btn-label">PERFIL</span>
            <span className="menu-btn-arrow">{panel === "perfil" ? "▼" : "▶"}</span>
          </button>
        </nav>

        {/* Painel: convite */}
        {panel === "invite" && (
          <div className="menu-panel">
            <div className="panel-header">
              <span className="panel-title">PARTIDA CRIADA!</span>
              <button className="panel-close" onClick={fecharPainel}>✕</button>
            </div>
            <p className="panel-desc">COMPARTILHE O LINK COM SEU ADVERSARIO</p>
            <div className="invite-link-box">
              <span className="invite-link-text">{link}</span>
            </div>
            {erro && <p className="panel-error">{erro}</p>}
            <div className="panel-actions">
              <button className="btn-pixel-sm btn-copy" onClick={copiarLink}>
                {copiado ? "✔ COPIADO!" : "COPIAR LINK"}
              </button>
              <button className="btn-pixel-sm btn-go" onClick={() => navigate(`/match?id=${partida?.id}`)}>
                AGUARDAR ▶
              </button>
            </div>
            <p className="panel-hint">O ADVERSARIO DEVE ACESSAR O LINK PARA ENTRAR NA PARTIDA</p>
          </div>
        )}

        {/* Painel: ranking */}
        {panel === "ranking" && (
          <div className="menu-panel">
            <div className="panel-header">
              <span className="panel-title">RANKING GERAL</span>
              <button className="panel-close" onClick={fecharPainel}>✕</button>
            </div>
            {loading && <p className="panel-loading">CARREGANDO<span className="blink">_</span></p>}
            {erro && <p className="panel-error">{erro}</p>}
            {!loading && rankingData.length === 0 && !erro && <p className="panel-empty">SEM DADOS AINDA</p>}
            {!loading && rankingData.length > 0 && (
              <>
                <table className="ranking-table">
                  <thead>
                    <tr><th>#</th><th>JOGADOR</th><th>V</th><th>E</th><th>D</th></tr>
                  </thead>
                  <tbody>
                    {rankingData.map((e) => (
                      <tr key={e.player.id} className={e.player.id === user?.id ? "my-row" : ""}>
                        <td>{e.position}</td>
                        <td>{e.player.username}</td>
                        <td className="wins">{e.wins}</td>
                        <td>{e.draws}</td>
                        <td className="losses">{e.losses}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {totalPaginas > 1 && (
                  <div className="pagination">
                    <button className="btn-pixel-sm" disabled={pagina <= 1} onClick={() => setPagina((p) => p - 1)}>◀</button>
                    <span className="page-info">{pagina}/{totalPaginas}</span>
                    <button className="btn-pixel-sm" disabled={pagina >= totalPaginas} onClick={() => setPagina((p) => p + 1)}>▶</button>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* Painel: perfil */}
        {panel === "perfil" && (
          <div className="menu-panel">
            <div className="panel-header">
              <span className="panel-title">PERFIL</span>
              <button className="panel-close" onClick={fecharPainel}>✕</button>
            </div>
            {loading && <p className="panel-loading">CARREGANDO<span className="blink">_</span></p>}
            {erro && <p className="panel-error">{erro}</p>}
            {!loading && !meuPerfil && !erro && <p className="panel-empty">SEM PARTIDAS AINDA</p>}
            {!loading && meuPerfil && (
              <div className="perfil-grid">
                <div className="perfil-name">{user?.username ?? "—"}</div>
                <div className="perfil-email">{user?.id}</div>
                {[
                  { label: "POSICAO",  valor: `#${meuPerfil.position}`,  css: "rank" },
                  { label: "VITORIAS", valor: meuPerfil.wins,             css: "wins" },
                  { label: "DERROTAS", valor: meuPerfil.losses,           css: "losses" },
                  { label: "EMPATES",  valor: meuPerfil.draws,            css: "" },
                  { label: "TOTAL",    valor: meuPerfil.totalGames,       css: "" },
                ].map(({ label, valor, css }) => (
                  <div key={label} className="stat-row">
                    <span className="stat-label">{label}</span>
                    <span className={`stat-value ${css}`}>{valor}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        <footer className="menu-footer">
          <span className="blink">_</span> PRONTO
        </footer>
      </div>
    </main>
  );
}
