import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import {
  Plus,
  CreditCard,
  Wallet,
  PiggyBank,
  Smartphone,
  Edit,
  Trash2,
} from "lucide-react";
import { useApp } from "@/contexts/AppContext";
import AccountForm from "@/components/forms/AccountForm";
import { useAccounts } from "@/hooks/useAccounts";
import { useToast } from "@/hooks/use-toast";
import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { api, DashboardSummary } from "@/lib/api";
const accountIcons = {
  corrente: CreditCard,
  poupanca: PiggyBank,
  carteira: Wallet,
  cartao: Smartphone,
};
const accountColors = {
  corrente: "bg-gradient-to-r from-blue-500 to-blue-600",
  poupanca: "bg-gradient-to-r from-green-500 to-green-600",
  carteira: "bg-gradient-to-r from-yellow-500 to-yellow-600",
  cartao: "bg-gradient-to-r from-purple-500 to-purple-600",
};
const accountLabels = {
  corrente: "Conta Corrente",
  poupanca: "Poupança",
  carteira: "Carteira",
  cartao: "Cartão de Crédito",
};
interface UiAccount {
  id: number;
  name: string;
  type: "corrente" | "poupanca" | "carteira" | "cartao";
  opening_balance?: number;
}
const AccountsPage = () => {
  const { list, create, update, remove } = useAccounts();
  const { toast } = useToast();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState<UiAccount | null>(null);
  const { formatCurrency, t } = useApp();
  const { data: dash } = useQuery<DashboardSummary>({
    queryKey: ["dashboard", "summary"],
    queryFn: () => api.dashboard.summary(),
  });
  const apiAccounts: UiAccount[] = (list.data as UiAccount[]) || [];
  const balancesById = useMemo(() => {
    const map = new Map<number, number>();
    dash?.accounts.forEach((a) => map.set(a.id, a.balance));
    return map;
  }, [dash]);
  const totalBalance = useMemo(() => {
    if (dash?.accounts?.length) {
      return dash.accounts.reduce((sum, a) => sum + (a.balance || 0), 0);
    }
    return apiAccounts.reduce(
      (total: number, account) => total + (account.opening_balance ?? 0),
      0
    );
  }, [dash, apiAccounts]);
  const handleNewAccount = async (account: {
    name: string;
    type: UiAccount["type"];
    balance: number;
  }) => {
    try {
      await create.mutateAsync({
        name: account.name,
        type: account.type,
        opening_balance: account.balance,
      });
      toast({ title: "Conta criada" });
      setIsModalOpen(false);
    } catch (e) {
      const err = e as Error;
      toast({
        title: "Erro",
        description: err.message,
        variant: "destructive",
      });
    }
  };
  const handleEditAccount = (account: UiAccount) => {
    setEditingAccount({
      id: account.id,
      name: account.name,
      type: account.type,
      opening_balance: account.opening_balance,
    });
    setIsEditModalOpen(true);
  };
  const handleUpdateAccount = async (updatedAccount: {
    id: number;
    name: string;
    type: UiAccount["type"];
    balance: number;
  }) => {
    try {
      await update.mutateAsync({
        id: updatedAccount.id,
        data: {
          name: updatedAccount.name,
          type: updatedAccount.type,
          opening_balance: updatedAccount.balance,
        },
      });
      toast({ title: "Conta atualizada" });
      setIsEditModalOpen(false);
      setEditingAccount(null);
    } catch (e) {
      const err = e as Error;
      toast({
        title: "Erro",
        description: err.message,
        variant: "destructive",
      });
    }
  };
  const handleDelete = async (acc: UiAccount) => {
    try {
      await remove.mutateAsync(acc.id);
      toast({ title: "Conta removida" });
    } catch (e) {
      const err = e as Error;
      toast({
        title: "Erro",
        description: err.message,
        variant: "destructive",
      });
    }
  };
  return (
    <Layout>
      <div className="space-y-8 animate-fade-in">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-foreground mb-2">
              {t("accounts")}
            </h1>
            <p className="text-muted-foreground text-lg">
              Gerencie suas contas e cartões
            </p>
          </div>
          <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-income hover:scale-105 transition-all duration-200 shadow-card">
                <Plus size={16} className="mr-2" />
                {t("newAccount")}
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <AccountForm
                onSubmit={handleNewAccount}
                onCancel={() => setIsModalOpen(false)}
              />
            </DialogContent>
          </Dialog>
        </div>

        <Card className="shadow-card bg-gradient-card hover:shadow-hover transition-all duration-300 animate-scale-in">
          <CardContent className="p-8">
            <div className="text-center">
              <p className="text-muted-foreground mb-3 text-lg font-medium">
                {t("totalBalance")}
              </p>
              <p className="text-5xl font-bold text-foreground mb-2">
                {formatCurrency(totalBalance)}
              </p>
              <p className="text-sm text-muted-foreground">
                {apiAccounts.length} contas ativas
              </p>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {apiAccounts.map((account) => {
            const currentBalance =
              balancesById.get(account.id) ?? account.opening_balance ?? 0;
            const Icon = accountIcons[account.type];
            const isNegative = currentBalance < 0;
            return (
              <Card
                key={account.id}
                className="shadow-card hover:shadow-hover transition-all duration-300 hover:-translate-y-2 animate-fade-in group"
              >
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-6">
                    <div
                      className={`p-4 rounded-2xl ${
                        accountColors[account.type]
                      } shadow-card group-hover:shadow-hover transition-all duration-300`}
                    >
                      <Icon className="w-7 h-7 text-white" />
                    </div>
                    <div className="flex space-x-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        className="hover:bg-primary/10 transition-all duration-200"
                        onClick={() => handleEditAccount(account)}
                      >
                        <Edit size={14} />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="hover:bg-destructive/10 transition-all duration-200"
                        onClick={() => handleDelete(account)}
                      >
                        <Trash2 size={14} />
                      </Button>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold text-xl mb-2">
                      {account.name}
                    </h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      {accountLabels[account.type]}
                    </p>
                    <p
                      className={`text-3xl font-bold ${
                        isNegative ? "text-expense" : "text-foreground"
                      }`}
                    >
                      {formatCurrency(currentBalance)}
                    </p>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
          <DialogContent className="max-w-2xl">
            {editingAccount && (
              <AccountForm
                onSubmit={handleUpdateAccount}
                onCancel={() => {
                  setIsEditModalOpen(false);
                  setEditingAccount(null);
                }}
                initialData={{
                  id: String(editingAccount.id),
                  name: editingAccount.name,
                  type: editingAccount.type,
                  balance: editingAccount.opening_balance ?? 0,
                }}
                isEditing={true}
              />
            )}
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
};
export default AccountsPage;
