// Simple API client using fetch with JWT token from localStorage
export interface ApiOptions<B = unknown> {
  method?: string;
  body?: B;
  headers?: Record<string, string>;
  auth?: boolean; // include Authorization header
}

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8000/api";

function getToken() {
  return localStorage.getItem("cashflow-token");
}

async function request<T = unknown, B = unknown>(
  path: string,
  options: ApiOptions<B> = {}
): Promise<T> {
  const { method = "GET", body, headers = {}, auth = true } = options;
  const finalHeaders: Record<string, string> = {
    Accept: "application/json",
  };
  if (body && !(body instanceof FormData)) {
    finalHeaders["Content-Type"] = "application/json";
  }
  Object.assign(finalHeaders, headers);
  if (auth && getToken()) {
    finalHeaders["Authorization"] = `Bearer ${getToken()}`;
  }
  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers: finalHeaders,
    body: body
      ? body instanceof FormData
        ? body
        : JSON.stringify(body)
      : undefined,
  });
  if (res.status === 204) return undefined as T;
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    // Try to extract standardized message field
    const message =
      (data && (data.message || data.error)) || `Erro ${res.status}`;
    throw new Error(message);
  }
  return data as T;
}

// Domain types
export interface ApiUser {
  id: number;
  name: string;
  email: string;
}
export interface AuthResponse {
  token: string;
  user: ApiUser;
}
export interface AccountPayload {
  name: string;
  type: "corrente" | "poupanca" | "carteira" | "cartao";
  opening_balance?: number;
}
export interface AccountResponse extends AccountPayload {
  id: number;
  user_id: number;
  created_at?: string;
}
export interface Paginated<T> {
  data: T[];
  current_page: number;
  last_page: number;
}
// Agora a listagem baseia-se em parcelas (installments)
export interface InstallmentListItem {
  id: number;
  value: number;
  transaction_type_id: number; // tipo da parcela
  account_id: number;
  transaction_id: number;
  date: string; // data da transação raiz
  root_transaction_type_id: number;
  account_out_id?: number | null;
  root_account_id?: number | null;
  notes?: string;
  subs: Array<{
    id: number;
    value: number;
    category_id?: number | null;
    sub_category_id?: number | null;
  }>;
  tags: Array<{ id: number }>;
}
export interface TransactionCreateResponse {
  transaction_id: number;
  date: string;
  installments: InstallmentListItem[];
}
export interface TransactionCreatePayload {
  transaction_type: "income" | "expense" | "transfer";
  value: number;
  date: string;
  account_id: number;
  account_out_id?: number;
  notes?: string;
  category_id?: number;
  sub_category_id?: number;
  tags?: number[];
  subs?: Array<{
    value: number;
    category_id: number;
    sub_category_id: number;
  }>;
}
export interface DashboardSummary {
  total_balance: number;
  monthly_income: number;
  monthly_expenses: number;
  net_flow: number;
  accounts: Array<{
    id: number;
    name: string;
    type: string;
    balance: number;
    percentage?: number;
  }>;
  recent_transactions: Array<{
    id: number;
    type: "income" | "expense" | "transfer";
    description: string;
    amount: number;
    account: string;
    date: string;
  }>;
  date_from: string;
  date_to: string;
}
export interface ReportsSummary {
  date_from: string;
  date_to: string;
  monthly: Array<{
    month: string;
    income: number;
    expenses: number;
    net: number;
  }>;
  categories: Array<{ name: string; value: number; percentage: number }>;
  totals: { income: number; expenses: number; net: number };
}

export const api = {
  setToken(token: string | null) {
    if (token) localStorage.setItem("cashflow-token", token);
    else localStorage.removeItem("cashflow-token");
  },
  login(email: string, password: string) {
    return request<AuthResponse, { email: string; password: string }>(
      `/auth/login`,
      { method: "POST", body: { email, password }, auth: false }
    );
  },
  register(name: string, email: string, password: string) {
    return request<
      AuthResponse,
      { name: string; email: string; password: string }
    >(`/auth/register`, {
      method: "POST",
      body: { name, email, password },
      auth: false,
    });
  },
  me() {
    return request<ApiUser>(`/users/me`);
  },
  accounts: {
    list() {
      return request<AccountResponse[]>(`/accounts`);
    },
    create(data: AccountPayload) {
      return request<AccountResponse, AccountPayload>(`/accounts`, {
        method: "POST",
        body: data,
      });
    },
    update(id: number, data: Partial<AccountPayload>) {
      return request<AccountResponse, Partial<AccountPayload>>(
        `/accounts/${id}`,
        { method: "PUT", body: data }
      );
    },
    delete(id: number) {
      return request<{ deleted: boolean }>(`/accounts/${id}`, {
        method: "DELETE",
      });
    },
  },
  transactions: {
    list(params?: Record<string, string | number | undefined>) {
      const query = params
        ? `?${new URLSearchParams(
            Object.entries(params).filter(
              ([_, v]) => v !== undefined && v !== null && v !== ""
            ) as [string, string][]
          )}`
        : "";
      return request<Paginated<InstallmentListItem>>(`/transactions${query}`);
    },
    create(data: TransactionCreatePayload) {
      return request<TransactionCreateResponse, TransactionCreatePayload>(
        `/transactions`,
        { method: "POST", body: data }
      );
    },
    delete(id: number) {
      return request<{ deleted: boolean }>(`/transactions/${id}`, {
        method: "DELETE",
      });
    },
  },
  dashboard: {
    summary(params?: { date_from?: string; date_to?: string }) {
      const query = params
        ? `?${new URLSearchParams(params as Record<string, string>)}`
        : "";
      return request<DashboardSummary>(`/dashboard/summary${query}`);
    },
  },
  reports: {
    summary(params?: { date_from?: string; date_to?: string }) {
      const query = params
        ? `?${new URLSearchParams(params as Record<string, string>)}`
        : "";
      return request<ReportsSummary>(`/reports/summary${query}`);
    },
  },
  misc: {
    categories() {
      return request<Array<{ id: number; name: string }>>("/categories");
    },
    subCategories() {
      return request<Array<{ id: number; name: string }>>("/sub-categories");
    },
    tags() {
      return request<Array<{ id: number; name: string }>>("/tags");
    },
  },
};

export { request };
