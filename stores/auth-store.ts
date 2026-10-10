import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { UserProfile, UserRole } from "@/types";

interface AuthState {
  user: UserProfile | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  sessionExpired: boolean;

  // Actions
  setUser: (user: UserProfile | null) => void;
  setTokens: (accessToken: string | null, refreshToken?: string | null) => void;
  setSessionExpired: (expired: boolean) => void;
  setLoading: (loading: boolean) => void;
  logout: () => void;

  // Role helpers
  isAdmin: () => boolean;
  isSecurity: () => boolean;
  isResident: () => boolean;
  hasRole: (roles: UserRole[]) => boolean;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      isAuthenticated: false,
      isLoading: true,
      sessionExpired: false,

      setUser: (user) =>
        set({
          user,
          isAuthenticated: !!user,
          isLoading: false,
        }),

      setTokens: (accessToken, refreshToken) => {
        if (typeof window !== "undefined") {
          if (accessToken) localStorage.setItem("aegis_access_token", accessToken);
          else localStorage.removeItem("aegis_access_token");

          if (refreshToken) localStorage.setItem("aegis_refresh_token", refreshToken);
          else if (refreshToken === null) localStorage.removeItem("aegis_refresh_token");
        }
        set({ accessToken });
      },

      setSessionExpired: (sessionExpired) => set({ sessionExpired }),

      setLoading: (isLoading) => set({ isLoading }),

      logout: () => {
        if (typeof window !== "undefined") {
          const refreshToken = localStorage.getItem("aegis_refresh_token");
          localStorage.removeItem("aegis_access_token");
          localStorage.removeItem("aegis_refresh_token");
          localStorage.removeItem("aegis_user");
          localStorage.removeItem("aegis_auth_store");

          // Attempt backend logout in background to revoke cookies
          try {
            const apiUrl =
              process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api/v1";
            fetch(`${apiUrl}/auth/logout`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              credentials: "include",
              body: JSON.stringify({ refreshToken }),
            }).catch(() => {});
          } catch {
            // Ignored
          }

          // Reset memory state and redirect cleanly
          set({
            user: null,
            accessToken: null,
            isAuthenticated: false,
            sessionExpired: false,
            isLoading: false,
          });

          window.location.href = "/login";
        } else {
          set({
            user: null,
            accessToken: null,
            isAuthenticated: false,
            sessionExpired: false,
            isLoading: false,
          });
        }
      },

      isAdmin: () => get().user?.role === "ADMIN",
      isSecurity: () => get().user?.role === "SECURITY" || get().user?.role === "ADMIN",
      isResident: () => get().user?.role === "RESIDENT",
      hasRole: (roles) => {
        const currentRole = get().user?.role;
        return currentRole ? roles.includes(currentRole) : false;
      },
    }),
    {
      name: "aegis_auth_store",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
