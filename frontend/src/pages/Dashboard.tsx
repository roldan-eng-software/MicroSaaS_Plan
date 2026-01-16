import { useEffect, useState } from 'react';
import { useCustomers } from '../hooks/useCustomers';
import { useBudgets } from '../hooks/useBudgets';

interface Stats {
  totalCustomers: number;
  totalBudgets: number;
  totalRevenue: number;
  pendingBudgets: number;
}

export default function Dashboard() {
  const { customers } = useCustomers();
  const { budgets } = useBudgets();
  const [stats, setStats] = useState<Stats>({
    totalCustomers: 0,
    totalBudgets: 0,
    totalRevenue: 0,
    pendingBudgets: 0,
  });

  useEffect(() => {
    const totalRevenue = budgets.reduce((sum, budget) => sum + budget.final_amount, 0);
    const pending = budgets.filter(b => b.status === 'draft').length;

    setStats({
      totalCustomers: customers.length,
      totalBudgets: budgets.length,
      totalRevenue,
      pendingBudgets: pending,
    });
  }, [customers, budgets]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  return (
    <div className="p-0 space-y-8">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 px-8 py-6">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold text-slate-900 mb-1">📊 Dashboard</h1>
          <p className="text-lg text-slate-600">Resumo geral da sua marcenaria</p>
        </div>
      </div>

      <div className="px-8 max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-6 pb-8">
        {/* Cards de Estatísticas */}
        <div className="lg:col-span-2 xl:col-span-1">
          <div className="bg-white p-8 rounded-2xl shadow-lg border border-slate-200 hover:shadow-xl transition-all h-full">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm font-medium text-slate-600 uppercase tracking-wide">Total Clientes</p>
                <p className="text-3xl font-bold text-slate-900 mt-1">{stats.totalCustomers}</p>
              </div>
              <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center">
                <span className="text-2xl">👥</span>
              </div>
            </div>
            <p className="text-sm text-emerald-600 font-medium">+12% este mês</p>
          </div>
        </div>

        <div className="lg:col-span-1 xl:col-span-1">
          <div className="bg-white p-8 rounded-2xl shadow-lg border border-slate-200 hover:shadow-xl transition-all h-full">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm font-medium text-slate-600 uppercase tracking-wide">Orçamentos</p>
                <p className="text-3xl font-bold text-slate-900 mt-1">{stats.totalBudgets}</p>
              </div>
              <div className="w-16 h-16 bg-emerald-100 rounded-2xl flex items-center justify-center">
                <span className="text-2xl">💰</span>
              </div>
            </div>
            <p className="text-sm text-emerald-600 font-medium">+8% este mês</p>
          </div>
        </div>

        <div className="lg:col-span-1 xl:col-span-1">
          <div className="bg-white p-8 rounded-2xl shadow-lg border border-slate-200 hover:shadow-xl transition-all h-full">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm font-medium text-slate-600 uppercase tracking-wide">Pendentes</p>
                <p className="text-3xl font-bold text-slate-900 mt-1">{stats.pendingBudgets}</p>
              </div>
              <div className="w-16 h-16 bg-yellow-100 rounded-2xl flex items-center justify-center">
                <span className="text-2xl">⏳</span>
              </div>
            </div>
            <p className="text-sm text-amber-600 font-medium">-3% este mês</p>
          </div>
        </div>

        <div className="lg:col-span-1 xl:col-span-1">
          <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 text-white p-8 rounded-2xl shadow-xl hover:shadow-2xl transition-all h-full">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm font-medium text-emerald-100 uppercase tracking-wide">Faturamento Total</p>
                <p className="text-3xl font-bold mt-1">{formatCurrency(stats.totalRevenue)}</p>
              </div>
              <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center">
                <span className="text-2xl">📈</span>
              </div>
            </div>
            <p className="text-emerald-100 text-sm font-medium">+25% este mês</p>
          </div>
        </div>
      </div>

      {/* Gráficos e Atividade */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 pb-12">
        <div className="xl:col-span-2">
          <div className="bg-white p-8 rounded-2xl shadow-lg border border-slate-200">
            <h3 className="text-xl font-semibold text-slate-900 mb-6 flex items-center">
              📈 Faturamento Mensal
              <button className="ml-auto px-3 py-1 bg-slate-100 text-slate-700 rounded-lg text-sm hover:bg-slate-200 transition">
                Este mês
              </button>
            </h3>
            <div className="h-80 bg-gradient-to-r from-slate-50 to-slate-100 rounded-2xl flex items-center justify-center border-2 border-dashed border-slate-200">
              <div className="text-center text-slate-500">
                <div className="w-20 h-20 bg-slate-200 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  📊
                </div>
                <p className="text-lg font-medium">Gráfico em breve</p>
                <p className="text-sm">Recharts ou Chart.js</p>
              </div>
            </div>
          </div>
        </div>

        <div>
          <div className="bg-white p-8 rounded-2xl shadow-lg border border-slate-200 h-full">
            <h3 className="text-xl font-semibold text-slate-900 mb-6">🔥 Atividade Recente</h3>
            <div className="space-y-4">
              <div className="flex items-start p-4 bg-slate-50 rounded-xl hover:bg-slate-100 transition">
                <div className="w-2 h-2 bg-emerald-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-slate-900 text-sm truncate">Novo cliente criado</p>
                  <p className="text-xs text-slate-500 mt-1">João Silva • 2 min atrás</p>
                </div>
              </div>
              <div className="flex items-start p-4 bg-slate-50 rounded-xl hover:bg-slate-100 transition">
                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-slate-900 text-sm truncate">Orçamento enviado</p>
                  <p className="text-xs text-slate-500 mt-1">Cozinha Ana • 1h atrás</p>
                </div>
              </div>
              <div className="flex items-start p-4 bg-slate-50 rounded-xl hover:bg-slate-100 transition">
                <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-slate-900 text-sm truncate">Orçamento aprovado</p>
                  <p className="text-xs text-slate-500 mt-1">Balcão João • 3h atrás</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Próximos Passos */}
      <div className="bg-white p-8 rounded-2xl shadow-lg border border-slate-200">
        <h3 className="text-xl font-semibold text-slate-900 mb-6">📋 Próximos Passos</h3>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="p-6 border border-slate-200 rounded-xl hover:shadow-md transition cursor-pointer group">
            <div className="flex items-center mb-3">
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mr-3 group-hover:bg-blue-200 transition">
                <span className="text-blue-600 text-sm font-bold">1</span>
              </div>
              <span className="text-sm font-medium text-slate-900 group-hover:text-blue-600 transition">PostgreSQL</span>
            </div>
            <p className="text-sm text-slate-600">Conectar banco real</p>
          </div>
          <div className="p-6 border border-slate-200 rounded-xl hover:shadow-md transition cursor-pointer group">
            <div className="flex items-center mb-3">
              <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center mr-3 group-hover:bg-emerald-200 transition">
                <span className="text-emerald-600 text-sm font-bold">2</span>
              </div>
              <span className="text-sm font-medium text-slate-900 group-hover:text-emerald-600 transition">Autenticação</span>
            </div>
            <p className="text-sm text-slate-600">Login JWT</p>
          </div>
          <div className="p-6 border border-slate-200 rounded-xl hover:shadow-md transition cursor-pointer group">
            <div className="flex items-center mb-3">
              <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center mr-3 group-hover:bg-orange-200 transition">
                <span className="text-orange-600 text-sm font-bold">3</span>
              </div>
              <span className="text-sm font-medium text-slate-900 group-hover:text-orange-600 transition">Deploy</span>
            </div>
            <p className="text-sm text-slate-600">Vercel + Railway</p>
          </div>
        </div>
      </div>
    </div>
  );
}
