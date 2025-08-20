import { createContext, useContext, useState, ReactNode, useEffect } from 'react';

export interface User {
  id: string;
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

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simular verificação de autenticação ao inicializar
    const savedUser = localStorage.getItem('cashflow-user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<void> => {
    setIsLoading(true);
    
    // Simular chamada de API
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Simular validação de credenciais
    if (email === 'admin@cashflow.com' && password === '123456') {
      const userData: User = {
        id: '1',
        name: 'Administrador',
        email: email,
        avatar: undefined
      };
      
      setUser(userData);
      localStorage.setItem('cashflow-user', JSON.stringify(userData));
    } else {
      throw new Error('Credenciais inválidas');
    }
    
    setIsLoading(false);
  };

  const register = async (name: string, email: string, password: string): Promise<void> => {
    setIsLoading(true);
    
    // Simular chamada de API
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const userData: User = {
      id: Date.now().toString(),
      name: name,
      email: email,
      avatar: undefined
    };
    
    setUser(userData);
    localStorage.setItem('cashflow-user', JSON.stringify(userData));
    setIsLoading(false);
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('cashflow-user');
  };

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

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};