"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { api, tokenStorage, ApiError } from "@/lib/api";
import type { UserProfile, AuthResponse } from "@/types";
import { Modal, ModalFooter } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Lock, ShieldAlert } from "lucide-react";
import { useAuthStore } from "@/stores/auth-store";

interface AuthContextValue {
  user: UserProfile | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  sessionExpired: boolean;
  login: (identifier: string, password: string) => Promise<{ user: UserProfile; route: string }>;
  logout: () => Promise<void>;
  reauthenticate: (password: string) => Promise<boolean>;
  refreshSession: () => Promise<boolean>;
  updateUser: (patch: Partial<UserProfile>) => void;
  dismissSessionExpired: () => void;
}

const AuthContext = React.createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [user, setUser] = React.useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [sessionExpired, setSessionExpired] = React.useState(false);
  const [reauthPassword, setReauthPassword] = React.useState("");
  const [reauthLoading, setReauthLoading] = React.useState(false);
  const [reauthError, setReauthError] = React.useState<string | null>(null);

  // Initial session hydration
  const fetchCurrentUser = React.useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await api.get<{ user: UserProfile; dashboard?: { route: string } }>("/auth/me");
      if (res && res.user) {
        setUser(res.user);
      } else {
        setUser(null);
      }
    } catch {
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  React.useEffect(() => {
    fetchCurrentUser();

    // Listen for custom session expiry event if dispatched by api client
    const handleSessionExpiredEvent = () => {
      setSessionExpired(true);
    };

    window.addEventListener("aegis_session_expired", handleSessionExpiredEvent);
    return () => {
      window.removeEventListener("aegis_session_expired", handleSessionExpiredEvent);
    };
  }, [fetchCurrentUser]);

  const login = async (identifier: string, password: string) => {
    try {
      const payload: { identifier: string; password: string; phone?: string; email?: string } = {
        identifier: identifier.trim(),
        password,
      };

      if (identifier.includes("@")) {
        payload.email = identifier.trim();
      } else {
        payload.phone = identifier.trim();
      }

      const res = await api.post<AuthResponse>("/auth/login", payload, {
        skipAuth: true,
      });

      if (res.accessToken) {
        tokenStorage.setAccessToken(res.accessToken);
      }
      if (res.refreshToken) {
        tokenStorage.setRefreshToken(res.refreshToken);
      }

      setUser(res.user);
      setSessionExpired(false);

      const targetRoute =
        res.dashboard?.route ||
        (res.user.role === "ADMIN"
          ? "/admin"
          : res.user.role === "SECURITY"
          ? "/dashboard"
          : "/portal");

      return { user: res.user, route: targetRoute };
    } catch (err) {
      if (err instanceof ApiError) {
        throw err;
      }
      throw new Error("Unable to log in. Please check your credentials.");
    }
  };

  const logout = async () => {
    try {
      const refreshToken = tokenStorage.getRefreshToken();
      await api.post("/auth/logout", { refreshToken }).catch(() => {});
    } catch {
      // Continue even if logout api fails
    } finally {
      tokenStorage.clear();
      setUser(null);
      setSessionExpired(false);
      useAuthStore.getState().logout();
      if (typeof window !== "undefined") {
        window.location.href = "/login";
      }
    }
  };

  const refreshSession = async (): Promise<boolean> => {
    try {
      const refreshToken = tokenStorage.getRefreshToken();
      const res = await api.post<AuthResponse>("/auth/refresh", { refreshToken }, {
        skipAuth: true,
      });

      if (res.accessToken) {
        tokenStorage.setAccessToken(res.accessToken);
        if (res.refreshToken) {
          tokenStorage.setRefreshToken(res.refreshToken);
        }
        setUser(res.user);
        return true;
      }
      return false;
    } catch {
      return false;
    }
  };

  const reauthenticate = async (password: string): Promise<boolean> => {
    if (!user) return false;
    setReauthLoading(true);
    setReauthError(null);

    try {
      const identifier = user.email || user.phone;
      await login(identifier, password);
      setSessionExpired(false);
      setReauthPassword("");
      return true;
    } catch (err) {
      setReauthError(
        err instanceof Error ? err.message : "Password verification failed"
      );
      return false;
    } finally {
      setReauthLoading(false);
    }
  };

  const updateUser = (patch: Partial<UserProfile>) => {
    setUser((prev) => (prev ? { ...prev, ...patch } : null));
  };

  const dismissSessionExpired = () => {
    setSessionExpired(false);
    logout();
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        sessionExpired,
        login,
        logout,
        reauthenticate,
        refreshSession,
        updateUser,
        dismissSessionExpired,
      }}
    >
      {children}

      {/* In-place Session Expiry Re-authentication Modal */}
      <Modal
        isOpen={sessionExpired}
        onClose={dismissSessionExpired}
        size="sm"
        closeOnOutsideClick={false}
        title={
          <div className="flex items-center gap-2 text-amber-600">
            <ShieldAlert className="w-5 h-5" />
            <span>Session Expired</span>
          </div>
        }
        description="Your security session has timed out. Enter your password to re-authenticate and continue without losing your inputs."
      >
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            await reauthenticate(reauthPassword);
          }}
          className="space-y-4 pt-2"
        >
          <div>
            <label className="text-xs font-medium text-slate-500 uppercase tracking-wider block mb-1">
              Active Account
            </label>
            <div className="p-2.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-sm font-medium text-slate-800 dark:text-slate-200">
              {user?.name || user?.fullName || "Operator"} (
              {user?.email || user?.phone || "Authorized User"})
            </div>
          </div>

          <Input
            type="password"
            label="Password"
            required
            autoFocus
            leftIcon={<Lock className="w-4 h-4" />}
            placeholder="••••••••••••"
            value={reauthPassword}
            onChange={(e) => setReauthPassword(e.target.value)}
            error={reauthError || undefined}
          />

          <ModalFooter>
            <Button
              type="button"
              variant="outline"
              onClick={dismissSessionExpired}
              disabled={reauthLoading}
            >
              Log Out
            </Button>
            <Button
              type="submit"
              isLoading={reauthLoading}
              disabled={!reauthPassword}
            >
              Resume Session
            </Button>
          </ModalFooter>
        </form>
      </Modal>
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = React.useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
