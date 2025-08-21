import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowUpRight, ArrowDownLeft, ArrowLeftRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { useApp } from "@/contexts/AppContext";

interface Transaction {
  id: string | number;
  type: "income" | "expense" | "transfer";
  description: string;
  amount: number;
  category?: string;
  account: string;
  date: string;
}

interface RecentTransactionsProps {
  transactions?: Transaction[];
  loading?: boolean;
}

const transactionIcons = {
  income: { icon: ArrowUpRight, color: "text-income" },
  expense: { icon: ArrowDownLeft, color: "text-expense" },
  transfer: { icon: ArrowLeftRight, color: "text-transfer" },
};

const transactionLabels = {
  income: "Receita",
  expense: "Despesa",
  transfer: "Transferência",
};

const mockTransactions: Transaction[] = [
  {
    id: "1",
    type: "income",
    description: "Salário",
    amount: 5500.0,
    category: "Salário",
    account: "Conta Corrente",
    date: "2024-01-15",
  },
  {
    id: "2",
    type: "expense",
    description: "Supermercado",
    amount: -320.5,
    category: "Alimentação",
    account: "Cartão de Crédito",
    date: "2024-01-14",
  },
  {
    id: "3",
    type: "transfer",
    description: "Transferência para Poupança",
    amount: -1000.0,
    account: "Conta Corrente → Poupança",
    date: "2024-01-13",
  },
  {
    id: "4",
    type: "expense",
    description: "Combustível",
    amount: -150.0,
    category: "Transporte",
    account: "Carteira",
    date: "2024-01-12",
  },
  {
    id: "5",
    type: "income",
    description: "Freelance",
    amount: 800.0,
    category: "Trabalho Extra",
    account: "Conta Corrente",
    date: "2024-01-11",
  },
];

export const RecentTransactions = ({
  transactions,
  loading,
}: RecentTransactionsProps) => {
  const { formatCurrency } = useApp();

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("pt-BR");
  };

  const list =
    transactions && transactions.length ? transactions : mockTransactions;

  return (
    <Card className="shadow-card">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Transações Recentes</span>
          <Badge variant="secondary" className="text-xs">
            {list.length} transações
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loading && (
          <div className="text-xs text-muted-foreground animate-pulse mb-2">
            Carregando...
          </div>
        )}
        <div className="space-y-4">
          {list.map((transaction) => {
            const { icon: Icon, color } = transactionIcons[transaction.type];
            const isNegative = transaction.amount < 0;

            return (
              <div
                key={transaction.id}
                className="flex items-center justify-between p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <div className={cn("p-2 rounded-full bg-background", color)}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">
                      {transaction.description}
                    </p>
                    <div className="flex items-center space-x-2 text-xs text-muted-foreground">
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
                  </div>
                </div>
                <div className="text-right">
                  <p
                    className={cn(
                      "font-semibold text-sm",
                      transaction.type === "income"
                        ? "text-income"
                        : transaction.type === "expense"
                        ? "text-expense"
                        : "text-transfer"
                    )}
                  >
                    {transaction.type === "income" ? "+" : ""}
                    {formatCurrency(Math.abs(transaction.amount))}
                  </p>
                  <Badge variant="outline" className="text-xs">
                    {transactionLabels[transaction.type]}
                  </Badge>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};
