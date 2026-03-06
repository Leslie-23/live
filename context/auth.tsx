import * as SecureStore from "expo-secure-store";
import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";
import { api, setApiToken, User } from "@/services/api";

// ── Types ──────────────────────────────────────────────────────────────────────

type AuthCtx = {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<string | null>;
  register: (
    fullName: string,
    email: string,
    password: string
  ) => Promise<string | null>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
};

// ── Context ────────────────────────────────────────────────────────────────────

const AuthContext = createContext<AuthCtx | null>(null);

const TOKEN_KEY = "live_auth_token";

// ── Provider ───────────────────────────────────────────────────────────────────

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Restore session on mount
  useEffect(() => {
    (async () => {
      const stored = await SecureStore.getItemAsync(TOKEN_KEY);
      if (stored) {
        setApiToken(stored);
        setToken(stored);
        const { data } = await api.auth.me();
        if (data) {
          setUser(data);
        } else {
          // Token expired / invalid
          await SecureStore.deleteItemAsync(TOKEN_KEY);
          setApiToken(null);
          setToken(null);
        }
      }
      setIsLoading(false);
    })();
  }, []);

  async function persistToken(t: string) {
    await SecureStore.setItemAsync(TOKEN_KEY, t);
    setApiToken(t);
    setToken(t);
  }

  async function login(email: string, password: string): Promise<string | null> {
    const { data, error } = await api.auth.login({ email, password });
    if (error) return error;
    await persistToken(data.token);
    setUser(data.user);
    return null;
  }

  async function register(
    fullName: string,
    email: string,
    password: string
  ): Promise<string | null> {
    const { data, error } = await api.auth.register({ fullName, email, password });
    if (error) return error;
    await persistToken(data.token);
    setUser(data.user);
    return null;
  }

  async function logout() {
    await SecureStore.deleteItemAsync(TOKEN_KEY);
    setApiToken(null);
    setToken(null);
    setUser(null);
  }

  async function refreshUser() {
    const { data } = await api.auth.me();
    if (data) setUser(data);
  }

  return (
    <AuthContext.Provider
      value={{ user, token, isLoading, login, register, logout, refreshUser }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// ── Hook ───────────────────────────────────────────────────────────────────────

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within <AuthProvider>");
  return ctx;
}
