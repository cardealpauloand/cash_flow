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
  ReferenceLine,
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
    const now = new Date();
    const fmt = (d: Date) => {
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, "0");
      const day = String(d.getDate()).padStart(2, "0");
      return `${y}-${m}-${day}`;
    };
    let start = new Date(now.getFullYear(), now.getMonth(), 1);
    const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    if (period === "3m") {
      start = new Date(now.getFullYear(), now.getMonth() - 2, 1);
    } else if (period === "6m") {
      start = new Date(now.getFullYear(), now.getMonth() - 5, 1);
    } else if (period === "1y") {
      start = new Date(now.getFullYear() - 1, now.getMonth(), 1);
    }
    return { dateFrom: fmt(start), dateTo: fmt(end) };
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
  const { trendFrom, trendTo } = useMemo(() => {
    const now = new Date();
    const fmt = (d: Date) => {
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, "0");
      const day = String(d.getDate()).padStart(2, "0");
      return `${y}-${m}-${day}`;
    };
    const start = new Date(now.getFullYear(), now.getMonth() - 5, 1);
    const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    return { trendFrom: fmt(start), trendTo: fmt(end) };
  }, []);
  const trendQuery = useQuery<
    ReportsSummary,
    Error,
    ReportsSummary,
    [string, string, string, string, string]
  >({
    queryKey: ["reports", "summary", "trend", trendFrom, trendTo],
    queryFn: () =>
      api.reports.summary({ date_from: trendFrom, date_to: trendTo }),
    refetchOnWindowFocus: false,
  });
  const data = query.data;
  const monthlyData = (trendQuery.data?.monthly || []).map((m) => {
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
  const softPalette = [
    "#4C78A8",
    "#F58518",
    "#E45756",
    "#72B7B2",
    "#54A24B",
    "#EECA3B",
    "#B279A2",
    "#FF9DA7",
    "#9E765F",
    "#BAB0AC",
    "#6C9BD2",
    "#8CD17D",
  ];
  const totalReceitas = data?.totals.income || 0;
  const totalDespesas = data?.totals.expenses || 0;
  const saldoLiquido = data?.totals.net || 0;
  const RADIAN = Math.PI / 180;
  const renderPieLabel = (props: any) => {
    const { cx, cy, midAngle, outerRadius, percent, index, name, value } =
      props;
    if (
      !Number.isFinite(cx) ||
      !Number.isFinite(cy) ||
      !Number.isFinite(outerRadius) ||
      !Number.isFinite(midAngle) ||
      !Number.isFinite(percent) ||
      !value
    ) {
      return null;
    }
    const sin = Math.sin(-RADIAN * midAngle);
    const cos = Math.cos(-RADIAN * midAngle);
    const sx = cx + outerRadius * cos;
    const sy = cy + outerRadius * sin;
    const mx = cx + (outerRadius + 10) * cos;
    const my = cy + (outerRadius + 10) * sin;
    const ex = mx + (cos >= 0 ? 22 : -22);
    const ey = my;
    const textAnchor = cos >= 0 ? "start" : "end";
    const label = `${name} ${(percent * 100).toFixed(0)}%`;
    return (
      <g>
        <path
          d={`M${sx},${sy}L${mx},${my}L${ex},${ey}`}
          stroke="hsl(var(--muted-foreground))"
          fill="none"
        />
        <text
          x={ex + (cos >= 0 ? 6 : -6)}
          y={ey}
          fill={"hsl(var(--foreground))"}
          textAnchor={textAnchor}
          dominantBaseline="central"
          style={{ fontSize: 13 }}
        >
          {label}
        </text>
      </g>
    );
  };
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

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <BarChart3 className="w-5 h-5" />
                <span>Evolução Mensal</span>
                {(query.isFetching || trendQuery.isFetching) && (
                  <span className="text-xs text-muted-foreground">
                    Atualizando...
                  </span>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={320}>
                <LineChart
                  data={monthlyData}
                  margin={{ top: 16, right: 24, bottom: 32, left: 56 }}
                >
                  <defs>
                    <filter
                      id="lineGlow"
                      x="-50%"
                      y="-50%"
                      width="200%"
                      height="200%"
                    >
                      <feGaussianBlur
                        in="SourceGraphic"
                        stdDeviation="2.2"
                        result="blur"
                      />
                      <feMerge>
                        <feMergeNode in="blur" />
                        <feMergeNode in="SourceGraphic" />
                      </feMerge>
                    </filter>
                  </defs>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    className="stroke-muted"
                  />
                  <XAxis
                    dataKey="month"
                    className="text-muted-foreground"
                    tickMargin={12}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    className="text-muted-foreground"
                    tickFormatter={(v) => `R$ ${v}`}
                    tickMargin={8}
                    width={64}
                    tickLine={false}
                    axisLine={false}
                  />
                  <Tooltip
                    formatter={(value: number) => formatCurrency(value)}
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                    }}
                  />
                  <ReferenceLine
                    y={0}
                    stroke="hsl(var(--muted-foreground))"
                    strokeDasharray="3 3"
                  />
                  <Line
                    type="monotone"
                    dataKey="receitas"
                    stroke="hsl(var(--income))"
                    strokeWidth={2.5}
                    dot={{ r: 2, stroke: "transparent" }}
                    activeDot={{ r: 5, style: { filter: "url(#lineGlow)" } }}
                    style={{ filter: "url(#lineGlow)" }}
                    name="Receitas"
                  />
                  <Line
                    type="monotone"
                    dataKey="despesas"
                    stroke="hsl(var(--expense))"
                    strokeWidth={2.5}
                    dot={{ r: 2, stroke: "transparent" }}
                    activeDot={{ r: 5, style: { filter: "url(#lineGlow)" } }}
                    style={{ filter: "url(#lineGlow)" }}
                    name="Despesas"
                  />
                  <Line
                    type="monotone"
                    dataKey="liquido"
                    stroke="hsl(var(--primary))"
                    strokeWidth={2.5}
                    dot={{ r: 2, stroke: "transparent" }}
                    activeDot={{ r: 5, style: { filter: "url(#lineGlow)" } }}
                    style={{ filter: "url(#lineGlow)" }}
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
              <ResponsiveContainer width="100%" height={340}>
                <RechartsPieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    outerRadius={92}
                    fill="#8884d8"
                    stroke="#FFFFFF"
                    strokeWidth={2}
                    dataKey="value"
                    label={categoryData.length ? renderPieLabel : false}
                    labelLine={false}
                    isAnimationActive={false}
                    paddingAngle={0}
                  >
                    {categoryData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={softPalette[index % softPalette.length]}
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
              {categoryData.map((cat, idx) => (
                <div
                  key={cat.name}
                  className="flex items-center justify-between p-4 rounded-lg bg-muted/30"
                >
                  <div className="flex items-center space-x-3">
                    <div
                      className="w-4 h-4 rounded-full border border-white/80"
                      style={{
                        backgroundColor: softPalette[idx % softPalette.length],
                      }}
                    />
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
