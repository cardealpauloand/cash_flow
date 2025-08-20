import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TrendingUp, TrendingDown, PieChart, BarChart3, Calendar, ArrowUpRight, ArrowDownLeft } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart as RechartsPieChart, Cell, BarChart, Bar, Pie } from "recharts";

// Mock data for charts
const monthlyData = [
  { month: 'Jan', receitas: 5500, despesas: 3200, liquido: 2300 },
  { month: 'Fev', receitas: 5800, despesas: 3800, liquido: 2000 },
  { month: 'Mar', receitas: 6200, despesas: 4100, liquido: 2100 },
  { month: 'Abr', receitas: 5900, despesas: 3900, liquido: 2000 },
  { month: 'Mai', receitas: 6500, despesas: 4200, liquido: 2300 },
  { month: 'Jun', receitas: 6800, despesas: 4500, liquido: 2300 },
];

const categoryData = [
  { name: 'Alimentação', value: 1200, color: '#8884d8' },
  { name: 'Transporte', value: 800, color: '#82ca9d' },
  { name: 'Entretenimento', value: 400, color: '#ffc658' },
  { name: 'Saúde', value: 600, color: '#ff7300' },
  { name: 'Educação', value: 300, color: '#00ff00' },
  { name: 'Outros', value: 500, color: '#ff0000' },
];

import { useApp } from "@/contexts/AppContext";

const ReportsPage = () => {
  const { formatCurrency } = useApp();

  const totalReceitas = monthlyData.reduce((sum, item) => sum + item.receitas, 0);
  const totalDespesas = monthlyData.reduce((sum, item) => sum + item.despesas, 0);
  const saldoLiquido = totalReceitas - totalDespesas;

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
            <Select defaultValue="6m">
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
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="shadow-card bg-gradient-to-br from-income/10 to-income/5">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Total Receitas</p>
                  <p className="text-2xl font-bold text-income">
                    {formatCurrency(totalReceitas)}
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
                  <p className="text-sm text-muted-foreground mb-1">Total Despesas</p>
                  <p className="text-2xl font-bold text-expense">
                    {formatCurrency(totalDespesas)}
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
                  <p className="text-sm text-muted-foreground mb-1">Saldo Líquido</p>
                  <p className="text-2xl font-bold text-primary">
                    {formatCurrency(saldoLiquido)}
                  </p>
                </div>
                <TrendingUp className="w-8 h-8 text-primary" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Line Chart */}
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <BarChart3 className="w-5 h-5" />
                <span>Evolução Mensal</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis 
                    dataKey="month" 
                    className="text-muted-foreground"
                  />
                  <YAxis 
                    className="text-muted-foreground"
                    tickFormatter={(value) => `R$ ${value}`}
                  />
                  <Tooltip 
                    formatter={(value: number) => formatCurrency(value)}
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
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

          {/* Pie Chart */}
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
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: number) => formatCurrency(value)} />
                </RechartsPieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Category Breakdown */}
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle>Detalhamento por Categoria</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {categoryData.map((category) => (
                <div key={category.name} className="flex items-center justify-between p-4 rounded-lg bg-muted/30">
                  <div className="flex items-center space-x-3">
                    <div 
                      className="w-4 h-4 rounded-full" 
                      style={{ backgroundColor: category.color }}
                    />
                    <span className="font-medium">{category.name}</span>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">{formatCurrency(category.value)}</p>
                    <p className="text-sm text-muted-foreground">
                      {((category.value / totalDespesas) * 100).toFixed(1)}%
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default ReportsPage;