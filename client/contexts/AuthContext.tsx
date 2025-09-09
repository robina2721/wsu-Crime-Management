import React, { createContext, useContext, useState, useEffect } from "react";
import { User, UserRole } from "@shared/types";
import { api } from "@/lib/api";

interface AuthContextType {
  user: User | null;
  login: (
    username: string,
    password: string,
    role?: string,
  ) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
  isLoading: boolean;
  hasRole: (role: UserRole) => boolean;
  hasAnyRole: (roles: UserRole[]) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("auth_token");
    const userData = localStorage.getItem("user_data");

    if (token && userData) {
      try {
        const parsedUser = JSON.parse(userData);
        setUser(parsedUser);
      } catch (error) {
        localStorage.removeItem("auth_token");
        localStorage.removeItem("user_data");
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (
    username: string,
    password: string,
    role?: string,
  ): Promise<boolean> => {
    try {
      const body: any = { username, password };
      if (role) body.role = role;

      console.debug("[auth] sending login request", body);
      const response = await api.post("/auth/login", body);

      const contentType = response.headers.get("Content-Type") || "";
      const isJson = contentType.includes("application/json");

      if (!response.ok) {
        const errorText = isJson ? await response.json() : await response.text();
        console.error("❌ Login failed:", {
          status: response.status,
          response: errorText,
        });
        return false;
      }

      let data: any = {};
      try {
        data = isJson ? await response.json() : {};
        console.debug("[auth] login response data:", data);
      } catch (parseErr) {
        console.error("❌ Failed to parse JSON:", parseErr);
        return false;
      }

      if (data.success && data.user && data.token) {
        setUser(data.user);
        localStorage.setItem("auth_token", data.token);
        localStorage.setItem("user_data", JSON.stringify(data.user));
        return true;
      }

      console.warn("⚠️ Login response missing expected fields:", data);
      return false;
    } catch (err) {
      console.error("❌ Login error (network or unexpected):", err);
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("auth_token");
    localStorage.removeItem("user_data");
  };

  const hasRole = (role: UserRole): boolean => {
    return user?.role === role;
  };

  const hasAnyRole = (roles: UserRole[]): boolean => {
    return user ? roles.includes(user.role) : false;
  };

  const value: AuthContextType = {
    user,
    login,
    logout,
    isAuthenticated: !!user,
    isLoading,
    hasRole,
    hasAnyRole,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
