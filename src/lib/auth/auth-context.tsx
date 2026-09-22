"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

export interface User {
  id: string;
  name: string;
  email: string;
  role: "admin" | "member" | "viewer";
  createdAt: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  signIn: (email: string, pass: string) => Promise<boolean>;
  signUp: (name: string, email: string, pass: string) => Promise<boolean>;
  signInDemo: () => void;
  signOut: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    // Check local storage for session
    try {
      const stored = localStorage.getItem("suyanka_auth_user");
      if (stored) {
        setUser(JSON.parse(stored));
      }
    } catch {
      // Ignore storage errors in private browsing
    } finally {
      setIsLoading(false);
    }
  }, []);

  const saveUserSession = (userData: User | null) => {
    setUser(userData);
    if (userData) {
      localStorage.setItem("suyanka_auth_user", JSON.stringify(userData));
    } else {
      localStorage.removeItem("suyanka_auth_user");
    }
  };

  const signIn = async (email: string): Promise<boolean> => {
    setIsLoading(true);
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 600));

    const mockUser: User = {
      id: "usr_" + Math.random().toString(36).substring(2, 9),
      name: email.split("@")[0].replace(/[._]/g, " ").toUpperCase(),
      email,
      role: "admin",
      createdAt: new Date().toISOString(),
    };

    saveUserSession(mockUser);
    setIsLoading(false);
    return true;
  };

  const signUp = async (name: string, email: string): Promise<boolean> => {
    setIsLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 600));

    const mockUser: User = {
      id: "usr_" + Math.random().toString(36).substring(2, 9),
      name,
      email,
      role: "admin",
      createdAt: new Date().toISOString(),
    };

    saveUserSession(mockUser);
    setIsLoading(false);
    return true;
  };

  const signInDemo = () => {
    const demoUser: User = {
      id: "usr_demo",
      name: "Suyanka Explorer",
      email: "demo@suyanka.app",
      role: "admin",
      createdAt: new Date().toISOString(),
    };
    saveUserSession(demoUser);
  };

  const signOut = () => {
    saveUserSession(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        signIn,
        signUp,
        signInDemo,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
