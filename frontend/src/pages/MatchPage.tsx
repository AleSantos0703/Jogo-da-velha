import { useEffect, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useUser } from "../store/useAuthStore";
import { matches, type Match } from "../lib/api";
import { checkWinner, getWinningLine, type Cell } from "../lib/jogo";
import "./MatchPage.css";

export default function MatchPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const matchId = searchParams.get("id");
  const user = useUser();

  const [partida, setPartida] = useState<Match | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [jogando, setJogando] = useState(false);
  const [erro, setErro] = useState("");

  // useRef guarda o ID do intervalo para poder cancelar no cleanup
  const intervaloRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const tabuleiro = (partida?.board ?? Array(9).fill(null)) as Cell[];
  const vencedor = checkWinner(tabuleiro);
  const linhaVencedora = getWinningLine(tabuleiro);
  const minhaTez = partida?.currentTurn === user?.id;
  const finalizada = partida?.status === "finished" || partida?.status === "abandoned";
  const aguardando = partida?.status === "waiting";
  const meuSimbolo = partida?.playerX?.id === user?.id ? "X" : partida?.playerO?.id === user?.id ? "O" : null;

  async function buscarPartida() {
    if (!matchId) return;
    try {
      const dados = await matches.getById(matchId);
      setPartida(dados);
      setErro("");
    } catch (err) {
      setErro(err instanceof Error ? err.message.toUpperCase() : "ERRO AO CARREGAR PARTIDA");
    } finally {
      setCarregando(false);
    }
  }

  // Busca a partida ao entrar na página
  useEffect(() => {
    if (!matchId) { setErro("ID DA PARTIDA NAO ENCONTRADO"); setCarregando(false); return; }
    buscarPartida();
  }, [matchId]);

  // Polling: atualiza a partida a cada 2,5s enquanto não finalizar
  useEffect(() => {
    if (finalizada || !matchId) return;
    intervaloRef.current = setInterval(buscarPartida, 2500);
    return () => { if (intervaloRef.current) clearInterval(intervaloRef.current); };
  }, [matchId, finalizada]);

  async function jogar(posicao: number) {
    if (!matchId || !minhaTez || finalizada || aguardando || tabuleiro[posicao] !== null) return;
    setJogando(true);
    try {
      setPartida(await matches.makeMove(matchId, posicao));
    } catch (err) {
      setErro(err instanceof Error ? err.message.toUpperCase() : "ERRO AO JOGAR");
    } finally {
      setJogando(false);
    }
  }

  async function abandonar() {
    if (!matchId) return;
    try {
      await matches.abandon(matchId);
      navigate("/menu");
    } catch (err) {
      setErro(err instanceof Error ? err.message.toUpperCase() : "ERRO AO ABANDONAR");
    }
  }

  // Calcula o texto e a classe CSS da barra de status
  let statusTexto = minhaTez ? "SUA VEZ" : "VEZ DO ADVERSARIO...";
  let statusCSS = minhaTez ? "status-myturn" : "status-theirturn";
  if (aguardando)                   { statusTexto = "AGUARDANDO ADVERSARIO..."; statusCSS = "status-waiting"; }
  if (partida?.status === "abandoned") { statusTexto = "PARTIDA ABANDONADA";      statusCSS = "status-lose"; }
  if (vencedor === "draw")          { statusTexto = "EMPATE!";                   statusCSS = "status-draw"; }
  if (vencedor && vencedor !== "draw") {
    const jogadorVencedor = vencedor === "X" ? partida?.playerX : partida?.playerO;
    const euGanhei = jogadorVencedor?.id === user?.id;
    statusTexto = euGanhei ? "VOCE GANHOU!" : `${jogadorVencedor?.username?.toUpperCase()} GANHOU!`;
    statusCSS = euGanhei ? "status-win" : "status-lose";
  }

  if (carregando) {
    return (
      <main className="match-page">
        <div className="scanlines" />
        <div className="match-loading">CARREGANDO<span className="blink">_</span></div>
      </main>
    );
  }

  if (!matchId || (!partida && erro)) {
    return (
      <main className="match-page">
        <div className="scanlines" />
        <div className="match-error-screen">
          <p className="match-error-msg">{erro || "PARTIDA NAO ENCONTRADA"}</p>
          <button className="btn-pixel-match" onClick={() => navigate("/menu")}>◀ VOLTAR AO MENU</button>
        </div>
      </main>
    );
  }

  return (
    <main className="match-page">
      <div className="scanlines" />

      <div className="match-container">
        <header className="match-header">
          <h1 className="match-title">JOGO DA VELHA</h1>
          <div className="players-row">
            <div className={`player-tag ${meuSimbolo === "X" ? "tag-x" : ""}`}>
              <span className="player-symbol">X</span>
              <span className="player-name">{partida?.playerX?.username?.toUpperCase() ?? "AGUARDANDO"}</span>
            </div>
            <span className="vs-label">VS</span>
            <div className={`player-tag ${meuSimbolo === "O" ? "tag-o" : ""}`}>
              <span className="player-symbol">O</span>
              <span className="player-name">{partida?.playerO?.username?.toUpperCase() ?? "AGUARDANDO"}</span>
            </div>
          </div>
        </header>

        <div className={`status-bar ${statusCSS}`}>
          {statusTexto}
          {aguardando && <span className="blink"> _</span>}
        </div>

        {erro && <p className="match-inline-error">{erro}</p>}

        <div className="board-wrapper">
          <div className="board">
            {tabuleiro.map((casa, i) => {
              const podeClicar = !finalizada && !aguardando && minhaTez && !jogando && casa === null;
              const classes = ["board-cell", casa === "X" && "cell-x", casa === "O" && "cell-o",
                linhaVencedora?.includes(i) && "cell-win", podeClicar && "cell-playable"]
                .filter(Boolean).join(" ");
              return (
                <button key={i} className={classes} onClick={() => jogar(i)} disabled={!podeClicar}>
                  {casa}
                </button>
              );
            })}
          </div>
        </div>

        <div className="match-actions">
          {finalizada
            ? <button className="btn-pixel-match" onClick={() => navigate("/menu")}>◀ VOLTAR AO MENU</button>
            : <button className="btn-pixel-match btn-abandon" onClick={abandonar}>ABANDONAR</button>
          }
        </div>

        {meuSimbolo && !aguardando && (
          <p className="my-symbol-hint">
            VOCE JOGA COM <span className={meuSimbolo === "X" ? "sym-x" : "sym-o"}>{meuSimbolo}</span>
          </p>
        )}
      </div>
    </main>
  );
}
