import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Plus, ArrowUpRight, ArrowDownLeft, ArrowLeftRight, Search, Filter, Edit, Trash2, MoreHorizontal } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { useApp } from "@/contexts/AppContext";
import TransactionForm from "@/components/forms/TransactionForm";
import { useState } from "react";

interface Transaction {
  id: string;
  type: "income" | "expense" | "transfer";
  description: string;
  amount: number;
  category?: string;
  account: string;
  date: string;
  tags?: string[];
}

const transactionIcons = {
  income: { icon: ArrowUpRight, color: "text-income" },
  expense: { icon: ArrowDownLeft, color: "text-expense" },
  transfer: { icon: ArrowLeftRight, color: "text-transfer" },
};

const transactionLabels = {
  income: "income",
  expense: "expense", 
  transfer: "transfer",
};

// Mock data expandido
const mockTransactions: Transaction[] = [
  {
    id: "1",
    type: "income",
    description: "Salário Janeiro",
    amount: 5500.00,
    category: "Salário",
    account: "Conta Corrente",
    date: "2024-01-15",
    tags: ["mensal", "fixo"]
  },
  {
    id: "2",
    type: "expense",
    description: "Supermercado Extra",
    amount: -320.50,
    category: "Alimentação",
    account: "Cartão de Crédito",
    date: "2024-01-14",
    tags: ["alimentação", "essencial"]
  },
  {
    id: "3",
    type: "transfer",
    description: "Reserva de Emergência",
    amount: -1000.00,
    account: "Conta Corrente → Poupança",
    date: "2024-01-13",
    tags: ["investimento"]
  },
  {
    id: "4",
    type: "expense",
    description: "Posto Shell",
    amount: -150.00,
    category: "Transporte",
    account: "Carteira",
    date: "2024-01-12",
    tags: ["combustível", "carro"]
  },
  {
    id: "5",
    type: "income",
    description: "Freelance Design",
    amount: 800.00,
    category: "Trabalho Extra",
    account: "Conta Corrente",
    date: "2024-01-11",
    tags: ["freelance", "design"]
  },
  {
    id: "6",
    type: "expense",
    description: "Netflix",
    amount: -39.90,
    category: "Entretenimento",
    account: "Cartão de Crédito",
    date: "2024-01-10",
    tags: ["streaming", "mensal"]
  },
];

const TransactionsPage = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [deletingTransaction, setDeletingTransaction] = useState<Transaction | null>(null);
  const { formatCurrency, t } = useApp();
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const totalIncome = mockTransactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpenses = mockTransactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + Math.abs(t.amount), 0);

  const handleNewTransaction = (transaction: any) => {
    console.log('Nova transação:', transaction);
    // Aqui você adicionaria a lógica para salvar a transação
    setIsModalOpen(false);
  };

  const handleEditTransaction = (transaction: Transaction) => {
    setEditingTransaction(transaction);
    setIsEditModalOpen(true);
  };

  const handleUpdateTransaction = (updatedTransaction: any) => {
    console.log('Transação atualizada:', updatedTransaction);
    // Aqui você adicionaria a lógica para atualizar a transação
    setIsEditModalOpen(false);
    setEditingTransaction(null);
  };

  const handleDeleteTransaction = (transaction: Transaction) => {
    console.log('Transação deletada:', transaction.id);
    // Aqui você adicionaria a lógica para deletar a transação
    setDeletingTransaction(null);
  };

  return (
    <Layout>
      <div className="space-y-8 animate-fade-in">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-foreground mb-2">{t('transactions')}</h1>
            <p className="text-muted-foreground text-lg">
              Histórico completo de movimentações
            </p>
          </div>
          <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-income hover:scale-105 transition-all duration-200 shadow-card">
                <Plus size={16} className="mr-2" />
                {t('newTransaction')}
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <TransactionForm 
                onSubmit={handleNewTransaction}
                onCancel={() => setIsModalOpen(false)}
              />
            </DialogContent>
          </Dialog>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="shadow-card bg-gradient-to-br from-income/10 to-income/5 border-income/20 hover:shadow-hover transition-all duration-300 animate-scale-in">
            <CardContent className="p-6 text-center">
              <ArrowUpRight className="w-10 h-10 text-income mx-auto mb-3 animate-bounce-gentle" />
              <p className="text-sm text-muted-foreground mb-2 font-medium">{t('totalIncome')}</p>
              <p className="text-3xl font-bold text-income">
                {formatCurrency(totalIncome)}
              </p>
            </CardContent>
          </Card>
          
          <Card className="shadow-card bg-gradient-to-br from-expense/10 to-expense/5 border-expense/20 hover:shadow-hover transition-all duration-300 animate-scale-in">
            <CardContent className="p-6 text-center">
              <ArrowDownLeft className="w-10 h-10 text-expense mx-auto mb-3 animate-bounce-gentle" />
              <p className="text-sm text-muted-foreground mb-2 font-medium">{t('totalExpenses')}</p>
              <p className="text-3xl font-bold text-expense">
                {formatCurrency(totalExpenses)}
              </p>
            </CardContent>
          </Card>
          
          <Card className="shadow-card bg-gradient-to-br from-primary/10 to-primary-glow/10 border-primary/20 hover:shadow-hover transition-all duration-300 animate-scale-in">
            <CardContent className="p-6 text-center">
              <ArrowLeftRight className="w-10 h-10 text-primary mx-auto mb-3 animate-bounce-gentle" />
              <p className="text-sm text-muted-foreground mb-2 font-medium">{t('netBalance')}</p>
              <p className="text-3xl font-bold text-primary">
                {formatCurrency(totalIncome - totalExpenses)}
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
                  placeholder={`${t('search')} ${t('transactions').toLowerCase()}...`}
                  className="pl-10 transition-all duration-200 focus:ring-2 focus:ring-primary/20"
                />
              </div>
              <Select>
                <SelectTrigger className="w-full md:w-[180px] transition-all duration-200 hover:border-primary/50">
                  <SelectValue placeholder={t('type')} />
                </SelectTrigger>
                <SelectContent className="z-50 bg-popover">
                  <SelectItem value="all">Todos os tipos</SelectItem>
                  <SelectItem value="income">{t('income')}</SelectItem>
                  <SelectItem value="expense">{t('expense')}</SelectItem>
                  <SelectItem value="transfer">{t('transfer')}</SelectItem>
                </SelectContent>
              </Select>
              <Select>
                <SelectTrigger className="w-full md:w-[180px] transition-all duration-200 hover:border-primary/50">
                  <SelectValue placeholder={t('account')} />
                </SelectTrigger>
                <SelectContent className="z-50 bg-popover">
                  <SelectItem value="all">Todas as contas</SelectItem>
                  <SelectItem value="corrente">Conta Corrente</SelectItem>
                  <SelectItem value="cartao">Cartão de Crédito</SelectItem>
                  <SelectItem value="carteira">Carteira</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" size="icon" className="hover:bg-primary/10 transition-all duration-200">
                <Filter className="w-4 h-4" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Transactions List */}
        <Card className="shadow-card hover:shadow-hover transition-all duration-300">
          <CardHeader>
            <CardTitle>
              {mockTransactions.length} transações encontradas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {mockTransactions.map((transaction) => {
                const { icon: Icon, color } = transactionIcons[transaction.type];
                
                return (
                  <div 
                    key={transaction.id} 
                    className="flex items-center justify-between p-4 rounded-xl bg-muted/30 hover:bg-muted/50 transition-all duration-200 animate-fade-in group"
                  >
                    <div className="flex items-center space-x-4">
                      <div className={cn("p-3 rounded-full bg-background shadow-card hover:shadow-hover transition-all duration-200", color)}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="font-semibold text-lg">{transaction.description}</p>
                        <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                          <span>{transaction.account}</span>
                          {transaction.category && (
                            <>
                              <span>•</span>
                              <span>{transaction.category}</span>
                            </>
                          )}
                          <span>•</span>
                          <span>{formatDate(transaction.date)}</span>
                        </div>
                        {transaction.tags && (
                          <div className="flex items-center space-x-1 mt-2">
                            {transaction.tags.map((tag) => (
                              <Badge key={tag} variant="secondary" className="text-xs hover:bg-primary/10 transition-colors">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <p className={cn(
                          "font-semibold text-xl",
                          transaction.type === "income" ? "text-income" :
                          transaction.type === "expense" ? "text-expense" : "text-transfer"
                        )}>
                          {transaction.type === "income" ? "+" : ""}
                          {formatCurrency(transaction.amount)}
                        </p>
                        <Badge variant="outline" className="text-xs mt-1">
                          {t(transactionLabels[transaction.type])}
                        </Badge>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="opacity-0 group-hover:opacity-100 transition-all duration-200 hover:bg-primary/10"
                          >
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-40">
                          <DropdownMenuItem 
                            onClick={() => handleEditTransaction(transaction)}
                            className="cursor-pointer hover:bg-primary/10"
                          >
                            <Edit className="w-4 h-4 mr-2" />
                            Editar
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => setDeletingTransaction(transaction)}
                            className="cursor-pointer hover:bg-destructive/10 text-destructive focus:text-destructive"
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Excluir
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Edit Transaction Modal */}
        <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            {editingTransaction && (
              <TransactionForm 
                onSubmit={handleUpdateTransaction}
                onCancel={() => {
                  setIsEditModalOpen(false);
                  setEditingTransaction(null);
                }}
                initialData={editingTransaction}
                isEditing={true}
              />
            )}
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={!!deletingTransaction} onOpenChange={() => setDeletingTransaction(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
              <AlertDialogDescription>
                Tem certeza que deseja excluir a transação "{deletingTransaction?.description}"?
                Esta ação não pode ser desfeita.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction 
                onClick={() => deletingTransaction && handleDeleteTransaction(deletingTransaction)}
                className="bg-destructive hover:bg-destructive/90"
              >
                Excluir
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </Layout>
  );
};

export default TransactionsPage;