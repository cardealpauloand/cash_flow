import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Plus,
  ArrowUpRight,
  ArrowDownLeft,
  ArrowLeftRight,
  Search,
  Filter,
  Edit,
  Trash2,
  MoreHorizontal,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { useApp } from "@/contexts/AppContext";
import TransactionForm from "@/components/forms/TransactionForm";
import { SubCategory as UI_SubCategory } from "@/components/forms/SubCategoryManager";
import { useEffect, useState } from "react";
import { useTransactions } from "@/hooks/useTransactions";
import { useAccounts } from "@/hooks/useAccounts";
import { useToast } from "@/hooks/use-toast";
import { InstallmentListItem } from "@/lib/api";
import TransactionsTable from "@/components/TransactionsTable";

const transactionIcons = {
  income: { icon: ArrowUpRight, color: "text-income" },
  expense: { icon: ArrowDownLeft, color: "text-expense" },
  transfer: { icon: ArrowLeftRight, color: "text-transfer" },
};

const transactionLabels = {
  income: "income",
  expense: "expense",
  transfer: "transfer",
} as const;

// Map transaction_type_id to logical type (assumindo 1=income,2=expense,3=transfer / ajustar se diferente)
function mapType(id: number): "income" | "expense" | "transfer" {
  if (id === 1) return "income";
  if (id === 2) return "expense";
  return "transfer";
}

const TransactionsPage = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingTx, setEditingTx] = useState<InstallmentListItem | null>(null);
  const [deletingTx, setDeletingTx] = useState<InstallmentListItem | null>(
    null
  );

  const [typeFilter, setTypeFilter] = useState<string | undefined>();
  const [accountFilter, setAccountFilter] = useState<number | undefined>();
  const [page, setPage] = useState(1);
  const filters = { type: typeFilter, account_id: accountFilter, page };
  const tx = useTransactions(filters);
  const accounts = useAccounts();
  const { toast } = useToast();

  const { formatCurrency, t } = useApp();
  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString("pt-BR");

  const installments = tx.list.data?.data || [];
  const incomeTotal = installments
    .filter((i) => mapType(i.transaction_type_id) === "income")
    .reduce((s, i) => s + i.value, 0);
  const expenseTotal = installments
    .filter((i) => mapType(i.transaction_type_id) === "expense")
    .reduce((s, i) => s + i.value, 0);

  interface NewTransactionForm {
    type: "income" | "expense" | "transfer";
    amount: string | number;
    date?: string;
    account_id?: number;
    account?: string | number;
    account_out_id?: number;
    description?: string;
  }

  interface FormSubmitPayload {
    type: string;
    amount: number | string;
    date?: string;
    account_id?: number;
    account?: number | string;
    account_out_id?: number | string;
    description?: string;
    category?: string;
    subCategories?: UI_SubCategory[];
    tags?: string[];
  }
  const handleNewTransaction = async (form: FormSubmitPayload) => {
    // form.type vem como string genérica do TransactionForm, garantir narrow
    const type = form.type as string as "income" | "expense" | "transfer";
    try {
      // Construir subs se existirem subCategories (cada item vira um sub)
      const subs = (form.subCategories || []).map((sc) => ({
        value: sc.value,
        category_id: sc.categoryId,
        sub_category_id: sc.subCategoryId,
      }));
      const category_id =
        !subs.length && form.category ? Number(form.category) : undefined;
      await tx.create.mutateAsync({
        transaction_type: type,
        value: Number(form.amount),
        date: form.date || new Date().toISOString().slice(0, 10),
        account_id: Number(form.account_id || form.account),
        account_out_id:
          type === "transfer" ? Number(form.account_out_id) : undefined,
        notes: form.description,
        category_id,
        subs: subs.length ? subs : undefined,
      });
      toast({ title: "Transação criada" });
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

  const handleEditTransaction = (installment: InstallmentListItem) => {
    setEditingTx(installment);
    setIsEditModalOpen(true);
  };

  const handleUpdateTransaction = async () => {
    // Implementar se backend suportar update (não exposto nas rotas atuais)
    setIsEditModalOpen(false);
    setEditingTx(null);
  };

  const handleDeleteTransaction = async (transaction: InstallmentListItem) => {
    try {
      await tx.remove.mutateAsync(transaction.id);
      toast({ title: "Transação removida" });
    } catch (e) {
      const err = e as Error;
      toast({
        title: "Erro",
        description: err.message,
        variant: "destructive",
      });
    }
    setDeletingTx(null);
  };

  return (
    <Layout>
      <div className="space-y-8 animate-fade-in">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-foreground mb-2">
              {t("transactions")}
            </h1>
            <p className="text-muted-foreground text-lg">
              Histórico completo de movimentações
            </p>
          </div>
          <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-income hover:scale-105 transition-all duration-200 shadow-card">
                <Plus size={16} className="mr-2" />
                {t("newTransaction")}
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{t("newTransaction")}</DialogTitle>
                <DialogDescription>
                  Preencha os dados da nova transação.
                </DialogDescription>
              </DialogHeader>
              <TransactionForm
                onSubmit={handleNewTransaction}
                onCancel={() => setIsModalOpen(false)}
              />
            </DialogContent>
          </Dialog>
          <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Editar transação</DialogTitle>
                {editingTx && (
                  <DialogDescription>
                    Editando parcela #{editingTx.id}
                  </DialogDescription>
                )}
              </DialogHeader>
              {editingTx && (
                <TransactionForm
                  onSubmit={handleUpdateTransaction}
                  onCancel={() => {
                    setIsEditModalOpen(false);
                    setEditingTx(null);
                  }}
                  initialData={{
                    id: String(editingTx.id),
                    type: mapType(editingTx.transaction_type_id),
                    description: editingTx.notes || "",
                    amount: editingTx.value,
                    account: String(editingTx.account_id),
                    date: editingTx.date,
                    // Se houver subs, mapear para UI_SubCategory
                    subCategories: editingTx.subs?.length
                      ? editingTx.subs.map((s) => ({
                          id: String(s.id),
                          value: s.value,
                          categoryId: s.category_id ?? undefined,
                          subCategoryId: s.sub_category_id ?? undefined,
                        }))
                      : undefined,
                    // Categoria simples apenas se não houver múltiplos subs (ou seja, exatamente 1 com category)
                    category:
                      editingTx.subs &&
                      editingTx.subs.length === 1 &&
                      editingTx.subs[0].category_id
                        ? String(editingTx.subs[0].category_id)
                        : undefined,
                  }}
                  isEditing
                />
              )}
            </DialogContent>
          </Dialog>
          <AlertDialog
            open={!!deletingTx}
            onOpenChange={() => setDeletingTx(null)}
          >
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
                <AlertDialogDescription>
                  Tem certeza que deseja excluir a parcela #{deletingTx?.id}?
                  Esta ação não pode ser desfeita.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction
                  onClick={() =>
                    deletingTx && handleDeleteTransaction(deletingTx)
                  }
                  className="bg-destructive hover:bg-destructive/90"
                >
                  Excluir
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="shadow-card bg-gradient-to-br from-income/10 to-income/5 border-income/20 hover:shadow-hover transition-all duration-300 animate-scale-in">
            <CardContent className="p-6 text-center">
              <ArrowUpRight className="w-10 h-10 text-income mx-auto mb-3 animate-bounce-gentle" />
              <p className="text-sm text-muted-foreground mb-2 font-medium">
                {t("totalIncome")}
              </p>
              <p className="text-3xl font-bold text-income">
                {formatCurrency(incomeTotal)}
              </p>
            </CardContent>
          </Card>
          <Card className="shadow-card bg-gradient-to-br from-expense/10 to-expense/5 border-expense/20 hover:shadow-hover transition-all duration-300 animate-scale-in">
            <CardContent className="p-6 text-center">
              <ArrowDownLeft className="w-10 h-10 text-expense mx-auto mb-3 animate-bounce-gentle" />
              <p className="text-sm text-muted-foreground mb-2 font-medium">
                {t("totalExpenses")}
              </p>
              <p className="text-3xl font-bold text-expense">
                {formatCurrency(expenseTotal)}
              </p>
            </CardContent>
          </Card>
          <Card className="shadow-card bg-gradient-to-br from-primary/10 to-primary-glow/10 border-primary/20 hover:shadow-hover transition-all duration-300 animate-scale-in">
            <CardContent className="p-6 text-center">
              <ArrowLeftRight className="w-10 h-10 text-primary mx-auto mb-3 animate-bounce-gentle" />
              <p className="text-sm text-muted-foreground mb-2 font-medium">
                {t("netBalance")}
              </p>
              <p className="text-3xl font-bold text-primary">
                {formatCurrency(incomeTotal - expenseTotal)}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="shadow-card hover:shadow-hover transition-all duration-300">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4 items-center">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder={`${t("search")} ${t(
                    "transactions"
                  ).toLowerCase()}...`}
                  className="pl-10"
                  disabled
                />
              </div>
              <Select
                value={typeFilter}
                onValueChange={(v) =>
                  setTypeFilter(v === "all" ? undefined : v)
                }
              >
                <SelectTrigger className="w-full md:w-[180px]">
                  <SelectValue placeholder={t("type")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os tipos</SelectItem>
                  <SelectItem value="income">{t("income")}</SelectItem>
                  <SelectItem value="expense">{t("expense")}</SelectItem>
                  <SelectItem value="transfer">{t("transfer")}</SelectItem>
                </SelectContent>
              </Select>
              <Select
                value={accountFilter ? String(accountFilter) : undefined}
                onValueChange={(v) =>
                  setAccountFilter(v === "all" ? undefined : Number(v))
                }
              >
                <SelectTrigger className="w-full md:w-[180px]">
                  <SelectValue placeholder={t("account")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas as contas</SelectItem>
                  {accounts.list.data?.map((acc) => (
                    <SelectItem key={acc.id} value={String(acc.id)}>
                      {acc.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button variant="outline" size="icon">
                <Filter className="w-4 h-4" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Transactions List */}
        <TransactionsTable
          installments={installments}
          accounts={accounts.list.data || []}
          formatCurrency={formatCurrency}
          t={t}
          formatDate={formatDate}
          onEdit={handleEditTransaction}
          onDelete={(inst) => setDeletingTx(inst)}
        />
      </div>
    </Layout>
  );
};

export default TransactionsPage;
