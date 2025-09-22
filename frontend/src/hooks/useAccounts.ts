import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, AccountPayload, AccountResponse } from "@/lib/api";
const ACCOUNTS_KEY = ["accounts"];
export function useAccounts() {
  const qc = useQueryClient();
  const list = useQuery({
    queryKey: ACCOUNTS_KEY,
    queryFn: () => api.accounts.list(),
  });
  const create = useMutation({
    mutationFn: (payload: AccountPayload) => api.accounts.create(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ACCOUNTS_KEY });
      qc.invalidateQueries({ queryKey: ["dashboard", "summary"] });
    },
  });
  const update = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<AccountPayload> }) =>
      api.accounts.update(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ACCOUNTS_KEY });
      qc.invalidateQueries({ queryKey: ["dashboard", "summary"] });
    },
  });
  const remove = useMutation({
    mutationFn: (id: number) => api.accounts.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ACCOUNTS_KEY });
      qc.invalidateQueries({ queryKey: ["dashboard", "summary"] });
    },
  });
  return { list, create, update, remove };
}
