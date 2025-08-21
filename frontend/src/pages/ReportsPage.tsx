import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  TrendingUp,
  TrendingDown,
  PieChart,
  BarChart3,
  Calendar,
  ArrowUpRight,
  ArrowDownLeft,
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart as RechartsPieChart,
  Cell,
  BarChart,
  Bar,
  Pie,
} from "recharts";
import { useApp } from "@/contexts/AppContext";
import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { api, ReportsSummary } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Calendar as CalendarIcon, RefreshCcw } from "lucide-react";

const ReportsPage = () => {
  const { formatCurrency } = useApp();
  const [period, setPeriod] = useState<"1m" | "3m" | "6m" | "1y">("6m");

  const { dateFrom, dateTo } = useMemo(() => {
    const end = new Date();
    const start = new Date();
    if (period === "1m") start.setMonth(start.getMonth() - 0); // current month
    if (period === "3m") start.setMonth(start.getMonth() - 2);
    if (period === "6m") start.setMonth(start.getMonth() - 5);
    if (period === "1y") start.setFullYear(start.getFullYear() - 1);
    // Normalize to first day of month for start
    start.setDate(1);
    const date_from = start.toISOString().slice(0, 10);
    const date_to = new Date(end.getFullYear(), end.getMonth() + 1, 0)
      .toISOString()
      .slice(0, 10);
    return { dateFrom: date_from, dateTo: date_to };
  }, [period]);

  const query = useQuery<
    ReportsSummary,
    Error,
    ReportsSummary,
    [string, string, string, string]
  >({
    queryKey: ["reports", "summary", dateFrom, dateTo],
    queryFn: () =>
      api.reports.summary({ date_from: dateFrom, date_to: dateTo }),
    refetchOnWindowFocus: false,
  });

  const data = query.data;
  const monthlyData = (data?.monthly || []).map((m) => {
    const [year, mon] = m.month.split("-");
    const date = new Date(Number(year), Number(mon) - 1, 1);
    const label = date.toLocaleDateString("pt-BR", { month: "short" });
    return {
      month: label,
      receitas: m.income,
      despesas: m.expenses,
      liquido: m.net,
    };
  });
  const categoryData = (data?.categories || []).map((c) => ({
    name: c.name,
    value: c.value,
  }));

  const totalReceitas = data?.totals.income || 0;
  const totalDespesas = data?.totals.expenses || 0;
  const saldoLiquido = data?.totals.net || 0;

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Relatórios</h1>
            <p className="text-muted-foreground">
              Análise detalhada das suas finanças
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Select
              value={period}
              onValueChange={(v: string) => setPeriod(v as typeof period)}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Período" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1m">Último mês</SelectItem>
                <SelectItem value="3m">Últimos 3 meses</SelectItem>
                <SelectItem value="6m">Últimos 6 meses</SelectItem>
                <SelectItem value="1y">Último ano</SelectItem>
              </SelectContent>
            </Select>
            <Button
              variant="outline"
              size="icon"
              onClick={() => query.refetch()}
              disabled={query.isLoading}
            >
              <RefreshCcw
                className={`w-4 h-4 ${query.isFetching ? "animate-spin" : ""}`}
              />
            </Button>
          </div>
        </div>

        {query.isError && (
          <div className="text-sm text-destructive">
            Erro ao carregar dados.
          </div>
        )}

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="shadow-card bg-gradient-to-br from-income/10 to-income/5">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">
                    Total Receitas
                  </p>
                  <p className="text-2xl font-bold text-income">
                    {query.isLoading ? "..." : formatCurrency(totalReceitas)}
                  </p>
                </div>
                <ArrowUpRight className="w-8 h-8 text-income" />
              </div>
            </CardContent>
          </Card>
          <Card className="shadow-card bg-gradient-to-br from-expense/10 to-expense/5">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">
                    Total Despesas
                  </p>
                  <p className="text-2xl font-bold text-expense">
                    {query.isLoading ? "..." : formatCurrency(totalDespesas)}
                  </p>
                </div>
                <ArrowDownLeft className="w-8 h-8 text-expense" />
              </div>
            </CardContent>
          </Card>
          <Card className="shadow-card bg-gradient-to-br from-primary/10 to-primary-glow/10">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">
                    Saldo Líquido
                  </p>
                  <p className="text-2xl font-bold text-primary">
                    {query.isLoading ? "..." : formatCurrency(saldoLiquido)}
                  </p>
                </div>
                <TrendingUp className="w-8 h-8 text-primary" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <BarChart3 className="w-5 h-5" />
                <span>Evolução Mensal</span>
                {query.isFetching && (
                  <span className="text-xs text-muted-foreground">
                    Atualizando...
                  </span>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={monthlyData}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    className="stroke-muted"
                  />
                  <XAxis dataKey="month" className="text-muted-foreground" />
                  <YAxis
                    className="text-muted-foreground"
                    tickFormatter={(v) => `R$ ${v}`}
                  />
                  <Tooltip
                    formatter={(value: number) => formatCurrency(value)}
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="receitas"
                    stroke="hsl(var(--income))"
                    strokeWidth={2}
                    name="Receitas"
                  />
                  <Line
                    type="monotone"
                    dataKey="despesas"
                    stroke="hsl(var(--expense))"
                    strokeWidth={2}
                    name="Despesas"
                  />
                  <Line
                    type="monotone"
                    dataKey="liquido"
                    stroke="hsl(var(--primary))"
                    strokeWidth={2}
                    name="Saldo Líquido"
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <PieChart className="w-5 h-5" />
                <span>Despesas por Categoria</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <RechartsPieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) =>
                      `${name} ${(percent * 100).toFixed(0)}%`
                    }
                  >
                    {categoryData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={`hsl(var(--expense))`}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: number) => formatCurrency(value)}
                  />
                </RechartsPieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        <Card className="shadow-card">
          <CardHeader>
            <CardTitle>Detalhamento por Categoria</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {categoryData.map((cat) => (
                <div
                  key={cat.name}
                  className="flex items-center justify-between p-4 rounded-lg bg-muted/30"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-4 h-4 rounded-full bg-expense" />
                    <span className="font-medium">{cat.name}</span>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">{formatCurrency(cat.value)}</p>
                    <p className="text-sm text-muted-foreground">
                      {(() => {
                        const total = totalDespesas || 1;
                        return ((cat.value / total) * 100).toFixed(1) + "%";
                      })()}
                    </p>
                  </div>
                </div>
              ))}
              {!categoryData.length && !query.isLoading && (
                <p className="text-sm text-muted-foreground">
                  Sem dados de despesas no período.
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default ReportsPage;
