import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  api,
  TransactionCreatePayload,
  Paginated,
  InstallmentListItem,
} from "@/lib/api";

export interface TransactionsFilters {
  type?: string;
  date_from?: string;
  date_to?: string;
  account_id?: number;
  page?: number;
}

const TX_KEY = (filters: TransactionsFilters) => ["transactions", filters];

export function useTransactions(filters: TransactionsFilters) {
  const qc = useQueryClient();
  const list = useQuery<Paginated<InstallmentListItem>>({
    queryKey: TX_KEY(filters),
    queryFn: () =>
      api.transactions.list(
        filters as Record<string, string | number | undefined>
      ),
    placeholderData: (prev) => prev, // mantém dados anteriores enquanto carrega paginação
  });

  const create = useMutation({
    mutationFn: (payload: TransactionCreatePayload) =>
      api.transactions.create(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["transactions"] });
      qc.invalidateQueries({ queryKey: ["dashboard", "summary"] });
    },
  });

  const remove = useMutation({
    mutationFn: (id: number) => api.transactions.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["transactions"] });
      qc.invalidateQueries({ queryKey: ["dashboard", "summary"] });
    },
  });

  return { list, create, remove };
}
