import { useState, type ReactNode } from "react";
import { AuthContext } from "./AuthContext";
import { api } from "../services/api";
import type { User } from "../types/auth";

type Props = { children: ReactNode };

export function AuthProvider({ children }: Props) {
  const [user, setUser] = useState<User | null>(() => {
    const stored = localStorage.getItem("user");
    return stored ? JSON.parse(stored) : null;
  });

  const [token, setToken] = useState<string | null>(() => {
    return localStorage.getItem("token");
  });

  async function login(email: string, password: string) {
    const res = await api.post("/auth/login", { email, password });
    const { user, token } = res.data;
    setUser(user);
    setToken(token);
    localStorage.setItem("user", JSON.stringify(user));
    localStorage.setItem("token", token);
    api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  }

  async function register(
    name: string,
    email: string,
    password: string,
    phone?: string,
  ) {
    const res = await api.post("/auth/register", {
      name,
      email,
      password,
      phone,
    });
    const { user, token } = res.data;
    setUser(user);
    setToken(token);
    localStorage.setItem("user", JSON.stringify(user));
    localStorage.setItem("token", token);
    api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  }

  function logout() {
    setUser(null);
    setToken(null);
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    delete api.defaults.headers.common["Authorization"];
  }

  return (
    <AuthContext.Provider
      value={{ user, token, login, register, logout, isAuthenticated: !!user }}
    >
      {children}
    </AuthContext.Provider>
  );
}
