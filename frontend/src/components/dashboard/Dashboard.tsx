import { MetricCard } from "./MetricCard";
import { AccountBalance } from "./AccountBalance";
import { RecentTransactions } from "./RecentTransactions";
import { TrendingUp, TrendingDown, ArrowLeftRight, Wallet } from "lucide-react";
import { useApp } from "@/contexts/AppContext";

export const Dashboard = () => {
  const { formatCurrency } = useApp();

  // Mock data - será substituído por dados reais
  const totalBalance = 20170.00;
  const monthlyIncome = 6300.00;
  const monthlyExpenses = 3420.50;
  const netFlow = monthlyIncome - monthlyExpenses;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground">
            Visão geral das suas finanças
          </p>
        </div>
      </div>

      {/* Main Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Saldo Total"
          value={formatCurrency(totalBalance)}
          change="+5.2% vs mês anterior"
          changeType="positive"
          icon={<Wallet size={24} />}
          gradient="from-primary/10 to-primary-glow/10"
        />
        
        <MetricCard
          title="Receitas do Mês"
          value={formatCurrency(monthlyIncome)}
          change="+12.3% vs mês anterior"
          changeType="positive"
          icon={<TrendingUp size={24} />}
          gradient="from-income/10 to-income/5"
        />
        
        <MetricCard
          title="Despesas do Mês"
          value={formatCurrency(monthlyExpenses)}
          change="-8.1% vs mês anterior"
          changeType="positive"
          icon={<TrendingDown size={24} />}
          gradient="from-expense/10 to-expense/5"
        />
        
        <MetricCard
          title="Fluxo Líquido"
          value={formatCurrency(netFlow)}
          change={`${((netFlow / monthlyIncome) * 100).toFixed(1)}% da receita`}
          changeType="positive"
          icon={<ArrowLeftRight size={24} />}
          gradient="from-transfer/10 to-transfer/5"
        />
      </div>

      {/* Charts and Details */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <AccountBalance />
        </div>
        <div className="lg:col-span-2">
          <RecentTransactions />
        </div>
      </div>
    </div>
  );
};