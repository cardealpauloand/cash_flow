import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { CreditCard, Wallet, PiggyBank, Smartphone } from "lucide-react";
import { cn } from "@/lib/utils";
import { useApp } from "@/contexts/AppContext";

interface Account {
  id: string;
  name: string;
  type: "corrente" | "poupanca" | "carteira" | "cartao";
  balance: number;
  percentage?: number;
}

const accountIcons = {
  corrente: CreditCard,
  poupanca: PiggyBank,
  carteira: Wallet, 
  cartao: Smartphone,
};

const accountColors = {
  corrente: "from-blue-500 to-blue-600",
  poupanca: "from-green-500 to-green-600", 
  carteira: "from-yellow-500 to-yellow-600",
  cartao: "from-purple-500 to-purple-600",
};

// Mock data - será substituído por dados reais
const mockAccounts: Account[] = [
  { id: "1", name: "Conta Corrente", type: "corrente", balance: 15420.50, percentage: 65 },
  { id: "2", name: "Poupança", type: "poupanca", balance: 5680.30, percentage: 24 },
  { id: "3", name: "Carteira", type: "carteira", balance: 320.00, percentage: 1 },
  { id: "4", name: "Cartão de Crédito", type: "cartao", balance: -1250.80, percentage: 10 },
];

export const AccountBalance = () => {
  const { formatCurrency } = useApp();

  return (
    <Card className="shadow-card">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <CreditCard className="w-5 h-5 text-primary" />
          <span>Saldo por Conta</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {mockAccounts.map((account) => {
          const Icon = accountIcons[account.type];
          const isNegative = account.balance < 0;
          
          return (
            <div key={account.id} className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-lg bg-gradient-to-r ${accountColors[account.type]}`}>
                    <Icon className="w-4 h-4 text-white" />
                  </div>
                  <span className="font-medium">{account.name}</span>
                </div>
                <span className={cn(
                  "font-semibold",
                  isNegative ? "text-expense" : "text-foreground"
                )}>
                  {formatCurrency(account.balance)}
                </span>
              </div>
              {account.percentage && (
                <Progress 
                  value={account.percentage} 
                  className="h-2"
                />
              )}
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
};