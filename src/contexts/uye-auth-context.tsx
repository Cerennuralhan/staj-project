"use client";

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react";

export interface UyeSession {
  id: string;
  ad: string;
  soyad: string;
  eposta: string;
}

interface AuthCtx {
  uye: UyeSession | null;
  token: string | null;
  setAuth: (token: string, uye: UyeSession) => void;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthCtx | null>(null);

export function UyeAuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [uye, setUye] = useState<UyeSession | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const t = localStorage.getItem("uye_token");
    if (t) {
      setToken(t);
      const stored = localStorage.getItem("uye_bilgi");
      if (stored) {
        try { setUye(JSON.parse(stored)); } catch { /* ignore */ }
      }
    }
    setLoading(false);
  }, []);

  const setAuth = useCallback((newToken: string, uyeData: UyeSession) => {
    setToken(newToken);
    setUye(uyeData);
    localStorage.setItem("uye_token", newToken);
    localStorage.setItem("uye_bilgi", JSON.stringify(uyeData));
  }, []);

  const logout = useCallback(() => {
    setToken(null);
    setUye(null);
    localStorage.removeItem("uye_token");
    localStorage.removeItem("uye_bilgi");
  }, []);

  return (
    <AuthContext.Provider value={{ uye, token, setAuth, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useUyeAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useUyeAuth must be used within UyeAuthProvider");
  return ctx;
}
