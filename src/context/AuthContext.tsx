"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";

interface User {
  id: string;
  name: string;
  email: string;
  rol: string;
  isAdmin: boolean;
  token?: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (name: string, email: string, password: string) => Promise<boolean>;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const API_BASE_URL = "https://api-web-egdy.onrender.com";
axios.defaults.baseURL = API_BASE_URL;

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  // Estado para guardar el carrito temporal antes del login
  const [tempCart, setTempCart] = useState<any[]>([]);

  const decodeJWT = (token: string) => {
    try {
      const payload = token.split('.')[1];
      const decoded = JSON.parse(atob(payload));
      return decoded;
    } catch (error) {
      console.error("Error decoding JWT:", error);
      return null;
    }
  };

  const fetchUserProfile = async (token: string) => {
    try {
      const response = await axios.get("/api/perfil", {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      return response.data.perfil;
    } catch (error) {
      console.error("Error fetching user profile:", error);
      return null;
    }
  };

  // Función para migrar carrito temporal a usuario
  const migrateTempCart = async (cartItems: any[]) => {
    if (!user || cartItems.length === 0) return;

    try {
      for (const item of cartItems) {
        await axios.post("/api/cart", {
          productoId: item.id_producto || parseInt(item.id),
          cantidad: item.quantity
        }, {
          headers: {
            Authorization: `Bearer ${user.token}`
          }
        });
      }
      console.log("Carrito temporal migrado exitosamente");
      // Limpiar carrito temporal después de migrar
      setTempCart([]);
    } catch (error) {
      console.error("Error migrando carrito temporal:", error);
    }
  };

  // Guardar carrito temporal antes del logout o cuando el usuario no esté autenticado
  const saveTempCart = (cartItems: any[]) => {
    setTempCart(cartItems);
  };

  useEffect(() => {
    const interceptor = axios.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem("sr-robot-token");
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    return () => {
      axios.interceptors.request.eject(interceptor);
    };
  }, []);

  useEffect(() => {
    const responseInterceptor = axios.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401 || error.response?.status === 403) {
          logout();
        }
        return Promise.reject(error);
      }
    );

    return () => {
      axios.interceptors.response.eject(responseInterceptor);
    };
  }, []);

  useEffect(() => {
    const checkAuth = async () => {
      const savedUser = localStorage.getItem("sr-robot-user");
      const savedToken = localStorage.getItem("sr-robot-token");
      
      if (savedUser && savedToken) {
        const decoded = decodeJWT(savedToken);
        if (decoded && decoded.exp * 1000 > Date.now()) {
          try {
            const userProfile = await fetchUserProfile(savedToken);
            if (userProfile) {
              const userData = JSON.parse(savedUser);
              setUser({ ...userData, token: savedToken });
            } else {
              logout();
            }
          } catch (error) {
            logout();
          }
        } else {
          logout();
        }
      }
      setLoading(false);
    };

    checkAuth();
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      setLoading(true);
      const response = await axios.post("/api/auth/iniciar-sesion", {
        correo: email,
        contrasena: password,
      });
      
      const { token, rol } = response.data;
      
      if (!token) {
        throw new Error("No se recibió token del servidor");
      }

      const userProfile = await fetchUserProfile(token);
      if (!userProfile) {
        throw new Error("No se pudo obtener el perfil del usuario");
      }

      const isAdmin = rol === "admin" || rol === "superadmin";
      
      const userData: User = {
        id: userProfile._id || userProfile.id_usuario?.toString(),
        name: userProfile.nombreCompleto,
        email: userProfile.correo,
        rol,
        isAdmin,
        token: token
      };
      
      setUser(userData);
      localStorage.setItem("sr-robot-user", JSON.stringify(userData));
      localStorage.setItem("sr-robot-token", token);
      
      // Migrar carrito temporal si existe
      if (tempCart.length > 0) {
        setTimeout(() => {
          migrateTempCart(tempCart);
        }, 1000);
      }
      
      return true;
    } catch (error: any) {
      console.error("Error al iniciar sesión:", error);
      if (error.response?.data?.mensaje) {
        alert(error.response.data.mensaje);
      } else {
        alert("Error al iniciar sesión. Intenta nuevamente.");
      }
      return false;
    } finally {
      setLoading(false);
    }
  };

  const register = async (name: string, email: string, password: string): Promise<boolean> => {
    try {
      setLoading(true);
      
      if (email.endsWith("@srrobot.com")) {
        alert("Los correos @srrobot.com son solo para administradores. Usa un correo personal.");
        return false;
      }

      const response = await axios.post("/api/auth/registrar-cliente", {
        nombreCompleto: name,
        correo: email,
        contrasena: password,
      });
      
      if (response.data.mensaje) {
        return await login(email, password);
      }
      
      return false;
    } catch (error: any) {
      console.error("Error al registrarse:", error);
      if (error.response?.data?.mensaje) {
        alert(error.response.data.mensaje);
      } else {
        alert("Error al registrarse. Intenta nuevamente.");
      }
      return false;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    // Guardar carrito actual como temporal antes de hacer logout
    if (user) {
      // Aquí podrías obtener el carrito actual del contexto Cart
      // Por ahora lo dejamos vacío
      setTempCart([]);
    }
    
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
    loading,
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