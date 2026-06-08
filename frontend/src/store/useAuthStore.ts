// ============================================================
//  useAuthStore.ts — Store de autenticação com Zustand
//  Stack: React (TS) + Zustand + JWT
// ============================================================

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { auth, tokenStorage, type Player } from "../lib/api";

// ------------------------------------------------------------
// Tipos
// ------------------------------------------------------------

type AuthStatus = "idle" | "loading" | "authenticated" | "unauthenticated";

type AuthState = {
  user: Player | null;
  status: AuthStatus;
  error: string | null;
};

type AuthActions = {
  register: (payload: {
    username: string;
    email: string;
    password: string;
  }) => Promise<void>;
  login: (payload: { email: string; password: string }) => Promise<void>;
  logout: () => Promise<void>;
  fetchMe: () => Promise<void>;
  clearError: () => void;
};

// ------------------------------------------------------------
// Store
// ------------------------------------------------------------

export const useAuthStore = create<AuthState & AuthActions>()(
  persist(
    (set) => ({
      // --- estado inicial ---
      user: null,
      status: "idle",
      error: null,

      // --- actions ---

      register: async (payload) => {
        set({ status: "loading", error: null });
        try {
          await auth.register(payload);
          // Após registrar, faz login automaticamente
          await auth.login({ email: payload.email, password: payload.password });
          const user = await auth.me();
          set({ user, status: "authenticated" });
        } catch (err) {
          set({
            status: "unauthenticated",
            error: (err as Error).message,
          });
          throw err;
        }
      },

      login: async (payload) => {
        set({ status: "loading", error: null });
        try {
          await auth.login(payload); // já salva o token via tokenStorage
          const user = await auth.me();
          set({ user, status: "authenticated" });
        } catch (err) {
          set({
            status: "unauthenticated",
            error: (err as Error).message,
          });
          throw err;
        }
      },

      logout: async () => {
        set({ status: "loading", error: null });
        try {
          await auth.logout(); // invalida no servidor + limpa tokenStorage
        } finally {
          set({ user: null, status: "unauthenticated", error: null });
        }
      },

      /**
       * Revalida o usuário logado ao montar o app.
       * Chame no seu componente raiz (ex: App.tsx) dentro de um useEffect.
       */
      fetchMe: async () => {
        const token = tokenStorage.get();
        if (!token) {
          set({ status: "unauthenticated" });
          return;
        }
        set({ status: "loading", error: null });
        try {
          const user = await auth.me();
          set({ user, status: "authenticated" });
        } catch {
          tokenStorage.clear();
          set({ user: null, status: "unauthenticated" });
        }
      },

      clearError: () => set({ error: null }),
    }),

    {
      name: "tictactoe_auth",           // chave no localStorage
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ user: state.user }), // só persiste o user
    }
  )
);

// ------------------------------------------------------------
// Selectors prontos para usar nos componentes
// ------------------------------------------------------------

export const useUser           = () => useAuthStore((s) => s.user);
export const useAuthStatus     = () => useAuthStore((s) => s.status);
export const useAuthError      = () => useAuthStore((s) => s.error);
export const useIsAuthenticated = () =>
  useAuthStore((s) => s.status === "authenticated");