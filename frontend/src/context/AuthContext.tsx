import { createContext, useContext, useState, useEffect } from "react";
import {
  login as loginService,
  logout as logoutService,
  getToken,
} from "@/services/authService";
import axios from "axios";

interface AuthContextType {
  isAuthenticated: boolean;
  role: string;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [role, setRole] = useState<string>("");
  const [loading, setLoading] = useState(true);

  const fetchUser = async () => {
    const token = getToken();
    if (!token) {
      setIsAuthenticated(false);
      setLoading(false);
    }

    try {
      const res = await axios.get("http://127.0.0.1:8000/users/me", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setIsAuthenticated(true);
      setRole(res.data.role);
    } catch (error) {
      setIsAuthenticated(false);
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    await loginService(email, password);
    await fetchUser();
  };

  const logout = () => {
    logoutService();
    setIsAuthenticated(false);
    setRole("");
  };

  useEffect(() => {
    fetchUser().finally(() => setLoading(false));
  }, []);

  return (
    <AuthContext.Provider
      value={{ isAuthenticated, role, login, logout, loading }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("AuthContext not found");
  return ctx;
};
