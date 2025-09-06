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
    // Check for existing session on mount
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
      const response = await api.post("/auth/login", body);

      // Check if response is ok before trying to parse
      if (!response.ok) {
        console.error("Login failed with status:", response.status);
        return false;
      }

      // Clone the response to avoid "body stream already read" errors
      const responseClone = response.clone();
      let data;

      try {
        data = await responseClone.json();
      } catch (parseError) {
        console.error("Failed to parse response JSON:", parseError);
        return false;
      }

      if (data.success && data.user && data.token) {
        setUser(data.user);
        localStorage.setItem("auth_token", data.token);
        localStorage.setItem("user_data", JSON.stringify(data.user));
        return true;
      }
      return false;
    } catch (error) {
      console.error("Login error:", error);
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
