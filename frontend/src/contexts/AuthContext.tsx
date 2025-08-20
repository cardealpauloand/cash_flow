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
  id: string; // keep string for UI simplicity
  name: string;
  email: string;
  avatar?: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

const USER_KEY = "cashflow-user";
const TOKEN_KEY = "cashflow-token";

function mapUser(u: ApiUser): User {
  return { id: String(u.id), name: u.name, email: u.email };
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
};

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Bootstrap auth state
  useEffect(() => {
    const storedUser = localStorage.getItem(USER_KEY);
    const token = localStorage.getItem(TOKEN_KEY);
    if (storedUser && token) {
      try {
        setUser(JSON.parse(storedUser));
      } catch {
        /* ignore */
      }
    }
    // Try refresh user from API if token exists
    (async () => {
      if (token) {
        try {
          const me = await api.me();
          const mapped = mapUser(me);
          setUser(mapped);
          localStorage.setItem(USER_KEY, JSON.stringify(mapped));
        } catch {
          // token invalid
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

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
