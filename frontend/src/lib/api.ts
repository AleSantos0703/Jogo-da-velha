// ============================================================
//  api.ts — Cliente HTTP do Jogo da Velha
//  Stack: React (TS) + Node.js (JS) | Auth: JWT (Bearer)
// ============================================================

const BASE_URL = import.meta.env.VITE_API_URL ?? "";

// ------------------------------------------------------------
// Tipos
// ------------------------------------------------------------

export type Player = {
  id: string;
  username: string;
  avatarUrl?: string;
};

export type Board = [
  string | null, string | null, string | null,
  string | null, string | null, string | null,
  string | null, string | null, string | null
];

export type MatchStatus = "waiting" | "in_progress" | "finished" | "abandoned";

export type Match = {
  id: string;
  inviteToken: string;
  board: Board;
  status: MatchStatus;
  currentTurn: string;        // player id
  playerX: Player | null;
  playerO: Player | null;
  winner: string | null;      // player id ou "draw"
  createdAt: string;
  updatedAt: string;
};

export type RankingEntry = {
  position: number;
  player: Player;
  wins: number;
  losses: number;
  draws: number;
  totalGames: number;
};

export type AuthTokens = {
  accessToken: string;
  refreshToken?: string;
};

export type ApiError = {
  statusCode: number;
  message: string;
  error?: string;
};

// ------------------------------------------------------------
// Token helpers
// ------------------------------------------------------------

const TOKEN_KEY = "tictactoe_token";

export const tokenStorage = {
  get: (): string | null => localStorage.getItem(TOKEN_KEY),
  set: (token: string): void => localStorage.setItem(TOKEN_KEY, token),
  clear: (): void => localStorage.removeItem(TOKEN_KEY),
};

// ------------------------------------------------------------
// Fetch base
// ------------------------------------------------------------

async function request<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const token = tokenStorage.get();

  const headers: HeadersInit = {
    "Content-Type": "application/json",
    "ngrok-skip-browser-warning": "true",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const response = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers,
  });

  // Sem conteúdo (ex: 204 No Content)
  if (response.status === 204) {
    return undefined as T;
  }

  const data = await response.json();

  if (!response.ok) {
    const err = data as ApiError;
    throw new Error(err.message ?? `Erro ${response.status}`);
  }

  return data as T;
}

// Atalhos
const get  = <T>(path: string, opts?: RequestInit) =>
  request<T>(path, { method: "GET", ...opts });

const post = <T>(path: string, body?: unknown, opts?: RequestInit) =>
  request<T>(path, { method: "POST", body: JSON.stringify(body), ...opts });

const patch = <T>(path: string, body?: unknown, opts?: RequestInit) =>
  request<T>(path, { method: "PATCH", body: JSON.stringify(body), ...opts });

const del  = <T>(path: string, opts?: RequestInit) =>
  request<T>(path, { method: "DELETE", ...opts });

// ------------------------------------------------------------
// Auth
// ------------------------------------------------------------

export const auth = {
  /**
   * Registra um novo usuário.
   * POST /auth/register
   */
  register: (payload: {
    username: string;
    email: string;
    password: string;
  }) => post<AuthTokens>("/auth/register", payload),

  /**
   * Faz login e retorna o JWT.
   * POST /auth/login
   */
  login: async (payload: {
    email: string;
    password: string;
  }): Promise<AuthTokens> => {
    const tokens = await post<AuthTokens>("/auth/login", payload);
    tokenStorage.set(tokens.accessToken);
    return tokens;
  },

  /**
   * Invalida o token no servidor (logout).
   * POST /auth/logout
   */
  logout: async (): Promise<void> => {
    await post("/auth/logout");
    tokenStorage.clear();
  },

  /**
   * Retorna o perfil do usuário autenticado.
   * GET /auth/me
   */
  me: () => get<Player>("/auth/me"),
};

// ------------------------------------------------------------
// Partidas
// ------------------------------------------------------------

export const matches = {
  /**
   * Cria uma nova partida e retorna o objeto com inviteToken.
   * POST /matches
   */
  create: () => post<Match>("/matches"),

  /**
   * Busca os dados de uma partida pelo ID.
   * GET /matches/:id
   */
  getById: (matchId: string) => get<Match>(`/matches/${matchId}`),

  /**
   * Lista as partidas do usuário autenticado.
   * GET /matches/my
   */
  listMine: () => get<Match[]>("/matches/my"),

  /**
   * Entra em uma partida usando o token de convite.
   * POST /matches/join/:inviteToken
   */
  joinByInvite: (inviteToken: string) =>
    post<Match>(`/matches/join/${inviteToken}`),

  /**
   * Realiza uma jogada em uma partida.
   * PATCH /matches/:id/move
   * @param position - índice de 0 a 8 no tabuleiro
   */
  makeMove: (matchId: string, position: number) =>
    patch<Match>(`/matches/${matchId}/move`, { position }),

  /**
   * Abandona / desiste de uma partida em andamento.
   * PATCH /matches/:id/abandon
   */
  abandon: (matchId: string) =>
    patch<Match>(`/matches/${matchId}/abandon`),

  /**
   * Remove uma partida (somente criador / admin).
   * DELETE /matches/:id
   */
  remove: (matchId: string) => del<void>(`/matches/${matchId}`),
};

// ------------------------------------------------------------
// Convite por link
// ------------------------------------------------------------

export const invite = {
  /**
   * Valida o token de convite sem entrar na partida.
   * Útil para exibir uma preview antes de aceitar.
   * GET /matches/invite/:inviteToken
   */
  preview: (inviteToken: string) =>
    get<{ match: Match; valid: boolean }>(`/matches/invite/${inviteToken}`),

  /**
   * Gera a URL completa de convite para compartilhar.
   * O link aponta para a rota do frontend que chama joinByInvite.
   */
  buildLink: (inviteToken: string): string => {
    const frontendUrl =
      import.meta.env.VITE_FRONTEND_URL ?? window.location.origin;
    return `${frontendUrl}/match/join/${inviteToken}`;
  },
};

// ------------------------------------------------------------
// Ranking
// ------------------------------------------------------------

export const ranking = {
  /**
   * Retorna o ranking global paginado.
   * GET /ranking?page=1&limit=10
   */
  list: (page = 1, limit = 10) =>
    get<{ data: RankingEntry[]; total: number }>(
      `/ranking?page=${page}&limit=${limit}`
    ),

  /**
   * Retorna a posição do usuário autenticado no ranking.
   * GET /ranking/me
   */
  me: () => get<RankingEntry>("/ranking/me"),
};








