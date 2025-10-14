"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";

interface User {
  id: string;
  name: string;
  email: string;
  isAdmin: boolean;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (name: string, email: string, password: string) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const savedUser = localStorage.getItem("sr-robot-user");
    const savedToken = localStorage.getItem("sr-robot-token");
    if (savedUser && savedToken) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const response = await axios.post("https://api-web-egdy.onrender.com/api/auth/iniciar-sesion", {
        correo: email,
        contrasena: password,
      });
      const { token, rol } = response.data;
      const userData: User = {
        id: token.split(".")[1], // Simplificación, podrías usar el ID real desde el token
        name: email.split("@")[0],
        email,
        isAdmin: rol === "admin",
      };
      setUser(userData);
      localStorage.setItem("sr-robot-user", JSON.stringify(userData));
      localStorage.setItem("sr-robot-token", token);
      return true;
    } catch (error) {
      console.error("Error al iniciar sesión:", error);
      return false;
    }
  };

  const register = async (name: string, email: string, password: string): Promise<boolean> => {
    try {
      const response = await axios.post("https://api-web-egdy.onrender.com/api/auth/registrar", {
        nombreCompleto: name,
        correo: email,
        contrasena: password,
      });
      const { rol } = response.data;
      const userData: User = {
        id: `user-${Date.now()}`, // Temporal, la API no devuelve un ID único
        name,
        email,
        isAdmin: rol === "admin",
      };
      setUser(userData);
      localStorage.setItem("sr-robot-user", JSON.stringify(userData));
      // Opcional: Iniciar sesión automáticamente tras registro
      return login(email, password);
    } catch (error) {
      console.error("Error al registrarse:", error);
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("sr-robot-user");
    localStorage.removeItem("sr-robot-token");
  };

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    login,
    register,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};