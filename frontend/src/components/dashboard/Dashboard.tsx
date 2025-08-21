import { MetricCard } from "./MetricCard";
import { AccountBalance } from "./AccountBalance";
import { RecentTransactions } from "./RecentTransactions";
import { TrendingUp, TrendingDown, ArrowLeftRight, Wallet } from "lucide-react";
import { useApp } from "@/contexts/AppContext";
import { useQuery } from "@tanstack/react-query";
import { api, DashboardSummary } from "@/lib/api";

export const Dashboard = () => {
  const { formatCurrency } = useApp();

  const { data, isLoading, error } = useQuery<DashboardSummary>({
    queryKey: ["dashboard", "summary"],
    queryFn: () => api.dashboard.summary(),
    refetchInterval: 60_000, // auto refresh every minute
  });

  const totalBalance = data?.total_balance || 0;
  const monthlyIncome = data?.monthly_income || 0;
  const monthlyExpenses = data?.monthly_expenses || 0;
  const netFlow = data?.net_flow || 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground">Visão geral das suas finanças</p>
        </div>
        {isLoading && (
          <span className="text-xs text-muted-foreground animate-pulse">
            Atualizando...
          </span>
        )}
        {error && (
          <span className="text-xs text-destructive">Erro ao carregar</span>
        )}
      </div>

      {/* Main Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Saldo Total"
          value={formatCurrency(totalBalance)}
          change={
            data
              ? `${((netFlow / (monthlyIncome || 1)) * 100).toFixed(
                  1
                )}% fluxo sobre receita`
              : undefined
          }
          changeType={netFlow >= 0 ? "positive" : "negative"}
          icon={<Wallet size={24} />}
          gradient="from-primary/10 to-primary-glow/10"
        />

        <MetricCard
          title="Receitas do Mês"
          value={formatCurrency(monthlyIncome)}
          change={
            data
              ? `${
                  monthlyIncome
                    ? ((netFlow / monthlyIncome) * 100).toFixed(1)
                    : "0.0"
                }% líquido`
              : undefined
          }
          changeType="positive"
          icon={<TrendingUp size={24} />}
          gradient="from-income/10 to-income/5"
        />

        <MetricCard
          title="Despesas do Mês"
          value={formatCurrency(monthlyExpenses)}
          change={
            data
              ? `${
                  monthlyIncome
                    ? ((monthlyExpenses / monthlyIncome) * 100).toFixed(1)
                    : "0.0"
                }% da receita`
              : undefined
          }
          changeType="negative"
          icon={<TrendingDown size={24} />}
          gradient="from-expense/10 to-expense/5"
        />

        <MetricCard
          title="Fluxo Líquido"
          value={formatCurrency(netFlow)}
          change={
            data
              ? `${
                  monthlyIncome
                    ? ((netFlow / monthlyIncome) * 100).toFixed(1)
                    : "0.0"
                }% da receita`
              : undefined
          }
          changeType={netFlow >= 0 ? "positive" : "negative"}
          icon={<ArrowLeftRight size={24} />}
          gradient="from-transfer/10 to-transfer/5"
        />
      </div>

      {/* Charts and Details */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <AccountBalance accounts={data?.accounts} loading={isLoading} />
        </div>
        <div className="lg:col-span-2">
          <RecentTransactions
            transactions={data?.recent_transactions}
            loading={isLoading}
          />
        </div>
      </div>
    </div>
  );
};
