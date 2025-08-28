import {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
} from "react";

export type Currency = "BRL" | "USD" | "EUR";
export type Language = "pt-BR" | "en-US" | "es-ES";

interface AppContextType {
  currency: Currency;
  language: Language;
  setCurrency: (currency: Currency) => void;
  setLanguage: (language: Language) => void;
  formatCurrency: (value: number) => string;
  t: (key: string) => string;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

// Translations
const translations = {
  "pt-BR": {
    dashboard: "Dashboard",
    accounts: "Contas",
    transactions: "Transações",
    reports: "Relatórios",
    settings: "Configurações",
    newTransaction: "Nova Transação",
    newAccount: "Nova Conta",
    totalBalance: "Saldo Total",
    totalIncome: "Total Receitas",
    totalExpenses: "Total Despesas",
    netBalance: "Saldo Líquido",
    recentTransactions: "Transações Recentes",
    income: "Receita",
    expense: "Despesa",
    transfer: "Transferência",
    search: "Buscar",
    filter: "Filtrar",
    type: "Tipo",
    account: "Conta",
    category: "Categoria",
    description: "Descrição",
    amount: "Valor",
    date: "Data",
    save: "Salvar",
    cancel: "Cancelar",
    userProfile: "Perfil do Usuário",
    appearance: "Aparência",
    notifications: "Notificações",
    security: "Segurança",
    theme: "Tema",
    currency: "Moeda",
    language: "Idioma",
    light: "Claro",
    dark: "Escuro",
    system: "Sistema",
    login: "Entrar",
    register: "Registrar",
    logout: "Sair",
    email: "Email",
    password: "Senha",
    name: "Nome",
    profile: "Perfil",
    categories: "Categorias",
  },
  "en-US": {
    dashboard: "Dashboard",
    accounts: "Accounts",
    transactions: "Transactions",
    reports: "Reports",
    settings: "Settings",
    newTransaction: "New Transaction",
    newAccount: "New Account",
    totalBalance: "Total Balance",
    totalIncome: "Total Income",
    totalExpenses: "Total Expenses",
    netBalance: "Net Balance",
    recentTransactions: "Recent Transactions",
    income: "Income",
    expense: "Expense",
    transfer: "Transfer",
    search: "Search",
    filter: "Filter",
    type: "Type",
    account: "Account",
    category: "Category",
    description: "Description",
    amount: "Amount",
    date: "Date",
    save: "Save",
    cancel: "Cancel",
    userProfile: "User Profile",
    appearance: "Appearance",
    notifications: "Notifications",
    security: "Security",
    theme: "Theme",
    currency: "Currency",
    language: "Language",
    light: "Light",
    dark: "Dark",
    system: "System",
    login: "Login",
    register: "Register",
    logout: "Logout",
    email: "Email",
    password: "Password",
    name: "Name",
    profile: "Profile",
    categories: "Categories",
  },
  "es-ES": {
    dashboard: "Panel",
    accounts: "Cuentas",
    transactions: "Transacciones",
    reports: "Informes",
    settings: "Configuración",
    newTransaction: "Nueva Transacción",
    newAccount: "Nueva Cuenta",
    totalBalance: "Saldo Total",
    totalIncome: "Ingresos Totales",
    totalExpenses: "Gastos Totales",
    netBalance: "Saldo Neto",
    recentTransactions: "Transacciones Recientes",
    income: "Ingreso",
    expense: "Gasto",
    transfer: "Transferencia",
    search: "Buscar",
    filter: "Filtrar",
    type: "Tipo",
    account: "Cuenta",
    category: "Categoría",
    description: "Descripción",
    amount: "Cantidad",
    date: "Fecha",
    save: "Guardar",
    cancel: "Cancelar",
    userProfile: "Perfil de Usuario",
    appearance: "Apariencia",
    notifications: "Notificaciones",
    security: "Seguridad",
    theme: "Tema",
    currency: "Moneda",
    language: "Idioma",
    light: "Claro",
    dark: "Oscuro",
    system: "Sistema",
    login: "Iniciar sesión",
    register: "Registrarse",
    logout: "Salir",
    email: "Correo",
    password: "Contraseña",
    name: "Nombre",
    profile: "Perfil",
    categories: "Categorías",
  },
};

interface AppProviderProps {
  children: ReactNode;
}

export const AppProvider = ({ children }: AppProviderProps) => {
  const [currency, setCurrency] = useState<Currency>(() => {
    const saved = localStorage.getItem("cashflow-currency");
    return (saved as Currency) || "BRL";
  });

  const [language, setLanguage] = useState<Language>(() => {
    const saved = localStorage.getItem("cashflow-language");
    return (saved as Language) || "pt-BR";
  });

  useEffect(() => {
    localStorage.setItem("cashflow-currency", currency);
  }, [currency]);

  useEffect(() => {
    localStorage.setItem("cashflow-language", language);
  }, [language]);

  const formatCurrency = (value: number): string => {
    const currencyConfig = {
      BRL: { locale: "pt-BR", currency: "BRL" },
      USD: { locale: "en-US", currency: "USD" },
      EUR: { locale: "de-DE", currency: "EUR" },
    };

    const config = currencyConfig[currency];
    return new Intl.NumberFormat(config.locale, {
      style: "currency",
      currency: config.currency,
    }).format(Math.abs(value));
  };

  const t = (key: string): string => {
    return (
      translations[language][
        key as keyof (typeof translations)[typeof language]
      ] || key
    );
  };

  return (
    <AppContext.Provider
      value={{
        currency,
        language,
        setCurrency,
        setLanguage,
        formatCurrency,
        t,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useApp must be used within an AppProvider");
  }
  return context;
};
