"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import api from "@/lib/api";

interface User {
  id?: string;
  email: string;
  full_name: string;
  role: string;
  company_name?: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => void;
}

interface RegisterData {
  email: string;
  password: string;
  full_name: string;
  role?: string;
  company_name?: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load user from localStorage on mount
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    const token = localStorage.getItem("token");
    if (storedUser && token) {
      try {
        setUser(JSON.parse(storedUser));
      } catch {
        localStorage.removeItem("user");
        localStorage.removeItem("token");
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const response = await api.post("/api/v1/auth/login", { email, password });
      const { access_token, user } = response.data;
      localStorage.setItem("token", access_token);
      localStorage.setItem("user", JSON.stringify(user));
      setUser(user);
    } catch (error: any) {
      console.error("Login error:", error);
      if (error.response && error.response.data) {
        const detail = error.response.data.detail;
        if (Array.isArray(detail)) {
          const messages = detail.map((err: any) => {
            const field = err.loc[err.loc.length - 1];
            return `${field}: ${err.msg}`;
          }).join(", ");
          throw new Error(messages);
        } else if (typeof detail === "string") {
          throw new Error(detail);
        } else {
          throw new Error("Login failed. Please check your credentials.");
        }
      } else {
        throw new Error("Network error – please check your connection.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (data: RegisterData) => {
    setIsLoading(true);
    try {
      // 1. Create the user account
      console.log("Register payload:", data);
      await api.post("/api/v1/auth/register", data);

      // 2. Automatically log in with the same credentials
      // This will set the user state and store token
      await login(data.email, data.password);
    } catch (error: any) {
      console.error("Register error:", error);
      if (error.response && error.response.data) {
        const detail = error.response.data.detail;
        if (Array.isArray(detail)) {
          const messages = detail.map((err: any) => {
            const field = err.loc[err.loc.length - 1];
            return `${field}: ${err.msg}`;
          }).join(", ");
          throw new Error(messages);
        } else if (typeof detail === "string") {
          throw new Error(detail);
        } else {
          throw new Error(JSON.stringify(detail));
        }
      } else {
        throw new Error("Network error – please check your connection.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
  };

  const value = {
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    register,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}