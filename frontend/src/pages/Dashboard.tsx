import { useCustomers } from '../hooks/useCustomers';
import { useBudgets } from '../hooks/useBudgets';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';


export default function Dashboard() {
  const { customers } = useCustomers();
  const { budgets } = useBudgets();


  // Cálculos dinâmicos
  const totalCustomers = customers.length;
  const totalBudgets = budgets.length;
  const totalRevenue = budgets.reduce((sum, b) => sum + b.final_amount, 0);
  const pendingBudgets = budgets.filter((b) => b.status !== 'approved').length;
  const approvedBudgets = budgets.filter((b) => b.status === 'approved').length;
  const rejectedBudgets = budgets.filter((b) => b.status === 'rejected').length;


  const stats = [
    {
      label: 'TOTAL CLIENTES',
      value: totalCustomers,
      change: '+12% este mês',
      icon: '👥',
      color: 'bg-blue-500',
    },
    {
      label: 'ORÇAMENTOS',
      value: totalBudgets,
      change: '+8% este mês',
      icon: '📋',
      color: 'bg-yellow-500',
    },
    {
      label: 'PENDENTES',
      value: pendingBudgets,
      change: '-3% este mês',
      icon: '⏳',
      color: 'bg-orange-500',
    },
    {
      label: 'FATURAMENTO TOTAL',
      value: `R$ ${totalRevenue.toFixed(2)}`,
      change: '+25% este mês',
      icon: '💰',
      color: 'bg-green-500',
    },
  ];


  // Dados para gráfico de faturamento por mês
  const getMonthlyData = () => {
    const monthlyData: { [key: string]: number } = {};
    
    budgets.forEach((budget) => {
      const date = new Date(budget.created_at);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      monthlyData[monthKey] = (monthlyData[monthKey] || 0) + budget.final_amount;
    });

    return Object.entries(monthlyData)
      .sort()
      .slice(-6) // Últimos 6 meses
      .map(([month, amount]) => ({
        month: new Date(`${month}-01`).toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' }),
        faturamento: parseFloat(amount.toFixed(2)),
      }));
  };


  // Dados para gráfico de status de orçamentos
  const getStatusData = () => {
    return [
      { name: 'Aprovado', value: approvedBudgets, color: '#10b981' },
      { name: 'Rascunho', value: budgets.filter((b) => b.status === 'draft').length, color: '#eab308' },
      { name: 'Rejeitado', value: rejectedBudgets, color: '#ef4444' },
    ].filter((item) => item.value > 0);
  };


  // Dados para top 5 clientes por faturamento
  const getTopCustomers = () => {
    const customerRevenue: { [key: string]: { name: string; total: number } } = {};

    budgets.forEach((budget) => {
      const customer = customers.find((c) => c.id === budget.customer_id);
      if (customer) {
        if (!customerRevenue[budget.customer_id]) {
          customerRevenue[budget.customer_id] = { name: customer.name, total: 0 };
        }
        customerRevenue[budget.customer_id].total += budget.final_amount;
      }
    });

    return Object.values(customerRevenue)
      .sort((a, b) => b.total - a.total)
      .slice(0, 5)
      .map((item) => ({
        name: item.name,
        faturamento: parseFloat(item.total.toFixed(2)),
      }));
  };


  // Análise de crescimento
  const getGrowthAnalysis = () => {
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();

    const currentMonthBudgets = budgets.filter((b) => {
      const date = new Date(b.created_at);
      return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
    });

    const previousMonth = currentMonth === 0 ? 11 : currentMonth - 1;
    const previousYear = currentMonth === 0 ? currentYear - 1 : currentYear;

    const previousMonthBudgets = budgets.filter((b) => {
      const date = new Date(b.created_at);
      return date.getMonth() === previousMonth && date.getFullYear() === previousYear;
    });

    const currentTotal = currentMonthBudgets.reduce((sum, b) => sum + b.final_amount, 0);
    const previousTotal = previousMonthBudgets.reduce((sum, b) => sum + b.final_amount, 0);

    const growth = previousTotal === 0 ? 0 : ((currentTotal - previousTotal) / previousTotal) * 100;

    return {
      currentMonth: currentTotal,
      previousMonth: previousTotal,
      growth: growth.toFixed(1),
      budgetCount: currentMonthBudgets.length,
    };
  };


  const monthlyData = getMonthlyData();
  const statusData = getStatusData();
  const topCustomers = getTopCustomers();
  const growthAnalysis = getGrowthAnalysis();


  return (
    <div className="p-6 space-y-6">
      <h1 className="text-3xl font-bold">📊 Dashboard Avançado</h1>
      <p className="text-gray-600">Resumo geral e análises da sua marcenaria</p>


      {/* Cards de estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <div key={index} className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 font-medium">{stat.label}</p>
                <p className="text-2xl font-bold mt-2">{stat.value}</p>
                <p className="text-xs text-gray-500 mt-2">{stat.change}</p>
              </div>
              <div className={`${stat.color} text-white text-3xl p-4 rounded-lg`}>
                {stat.icon}
              </div>
            </div>
          </div>
        ))}
      </div>


      {/* Análise de Crescimento */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">📈 Crescimento do Mês</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <p className="text-sm text-gray-600">Faturamento Atual</p>
            <p className="text-2xl font-bold text-blue-600">R$ {growthAnalysis.currentMonth.toFixed(2)}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Mês Anterior</p>
            <p className="text-2xl font-bold text-gray-600">R$ {growthAnalysis.previousMonth.toFixed(2)}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Crescimento</p>
            <p className={`text-2xl font-bold ${growthAnalysis.growth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {growthAnalysis.growth >= 0 ? '+' : ''}{growthAnalysis.growth}%
            </p>
          </div>
        </div>
      </div>


      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Gráfico de Faturamento por Mês */}
        {monthlyData.length > 0 && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">💵 Faturamento por Mês</h2>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value) => `R$ ${value.toFixed(2)}`} />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="faturamento"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  dot={{ fill: '#3b82f6', r: 5 }}
                  activeDot={{ r: 7 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}


        {/* Gráfico de Status de Orçamentos */}
        {statusData.length > 0 && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">📊 Status dos Orçamentos</h2>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}


        {/* Gráfico de Top Clientes */}
        {topCustomers.length > 0 && (
          <div className="bg-white rounded-lg shadow p-6 lg:col-span-2">
            <h2 className="text-xl font-semibold mb-4">🏆 Top 5 Clientes por Faturamento</h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={topCustomers}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip formatter={(value) => `R$ ${value.toFixed(2)}`} />
                <Legend />
                <Bar dataKey="faturamento" fill="#10b981" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>


      {/* Seção de Orçamentos Recentes e Clientes */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Orçamentos Recentes */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">📋 Orçamentos Recentes</h2>
          {budgets.length === 0 ? (
            <p className="text-gray-500">Nenhum orçamento cadastrado</p>
          ) : (
            <div className="space-y-3">
              {budgets.slice(0, 5).map((budget) => {
                const customer = customers.find((c) => c.id === budget.customer_id);
                return (
                  <div key={budget.id} className="flex items-center justify-between p-3 border-l-4 border-blue-500 bg-gray-50 rounded">
                    <div>
                      <p className="font-semibold">{budget.title}</p>
                      <p className="text-sm text-gray-600">{customer?.name || 'Sem cliente'}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">R$ {budget.final_amount.toFixed(2)}</p>
                      <span
                        className={`text-xs font-semibold px-2 py-1 rounded ${
                          budget.status === 'approved'
                            ? 'bg-green-100 text-green-800'
                            : budget.status === 'rejected'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}
                      >
                        {budget.status === 'approved'
                          ? 'Aprovado'
                          : budget.status === 'rejected'
                          ? 'Rejeitado'
                          : 'Rascunho'}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>


        {/* Clientes Cadastrados */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">👥 Clientes Cadastrados</h2>
          {customers.length === 0 ? (
            <p className="text-gray-500">Nenhum cliente cadastrado</p>
          ) : (
            <div className="space-y-3">
              {customers.slice(0, 5).map((customer) => {
                const customerBudgets = budgets.filter((b) => b.customer_id === customer.id);
                const customerRevenue = budgets
                  .filter((b) => b.customer_id === customer.id)
                  .reduce((sum, b) => sum + b.final_amount, 0);
                return (
                  <div key={customer.id} className="flex items-center justify-between p-3 border-l-4 border-green-500 bg-gray-50 rounded">
                    <div>
                      <p className="font-semibold">{customer.name}</p>
                      <p className="text-sm text-gray-600">{customer.email || 'Sem email'}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">{customerBudgets.length}</p>
                      <p className="text-xs text-gray-600">R$ {customerRevenue.toFixed(2)}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
