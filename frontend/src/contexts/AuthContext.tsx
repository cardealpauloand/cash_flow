import {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
  useCallback,
} from "react";
import { api, AuthResponse, ApiUser } from "@/lib/api";
export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  avatar?: string;
}
interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  updateProfile: (data: {
    name?: string;
    email?: string;
    phone?: string | null;
  }) => Promise<void>;
}
const AuthContext = createContext<AuthContextType | undefined>(undefined);
interface AuthProviderProps {
  children: ReactNode;
}
const USER_KEY = "cashflow-user";
const TOKEN_KEY = "cashflow-token";
function mapUser(
  u: ApiUser & {
    phone?: string | null;
  }
): User {
  return { id: String(u.id), name: u.name, email: u.email, phone: u.phone };
}
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
};
export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  useEffect(() => {
    const storedUser = localStorage.getItem(USER_KEY);
    const token = localStorage.getItem(TOKEN_KEY);
    if (storedUser && token) {
      try {
        setUser(JSON.parse(storedUser));
      } catch {}
    }
    (async () => {
      if (token) {
        try {
          const me = await api.me();
          const mapped = mapUser(me);
          setUser(mapped);
          localStorage.setItem(USER_KEY, JSON.stringify(mapped));
        } catch {
          api.setToken(null);
          localStorage.removeItem(USER_KEY);
        }
      }
      setIsLoading(false);
    })();
  }, []);
  const persistAuth = (res: AuthResponse) => {
    api.setToken(res.token);
    const mapped = mapUser(res.user);
    setUser(mapped);
    localStorage.setItem(USER_KEY, JSON.stringify(mapped));
  };
  const login = useCallback(async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const res = await api.login(email, password);
      persistAuth(res);
    } finally {
      setIsLoading(false);
    }
  }, []);
  const register = useCallback(
    async (name: string, email: string, password: string) => {
      setIsLoading(true);
      try {
        const res = await api.register(name, email, password);
        persistAuth(res);
      } finally {
        setIsLoading(false);
      }
    },
    []
  );
  const logout = useCallback(() => {
    api.setToken(null);
    setUser(null);
    localStorage.removeItem(USER_KEY);
  }, []);
  const updateProfile = useCallback(
    async (data: { name?: string; email?: string; phone?: string | null }) => {
      const updated = await api.updateMe(data);
      const mapped = mapUser(updated);
      setUser(mapped);
      localStorage.setItem(USER_KEY, JSON.stringify(mapped));
    },
    []
  );
  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        logout,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
