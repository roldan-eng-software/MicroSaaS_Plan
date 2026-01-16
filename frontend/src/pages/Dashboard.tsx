import { useCustomers } from '../hooks/useCustomers';
import { useBudgets } from '../hooks/useBudgets';

export default function Dashboard() {
  const { customers } = useCustomers();
  const { budgets } = useBudgets();

  // Cálculos dinâmicos
  const totalCustomers = customers.length;
  const totalBudgets = budgets.length;
  const totalRevenue = budgets.reduce((sum, b) => sum + b.final_amount, 0);
  const pendingBudgets = budgets.filter((b) => b.status !== 'approved').length;

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

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-3xl font-bold">📊 Dashboard</h1>
      <p className="text-gray-600">Resumo geral da sua marcenaria</p>

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

      {/* Seção de Orçamentos Recentes */}
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

        {/* Clientes Recentes */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">👥 Clientes Cadastrados</h2>
          {customers.length === 0 ? (
            <p className="text-gray-500">Nenhum cliente cadastrado</p>
          ) : (
            <div className="space-y-3">
              {customers.slice(0, 5).map((customer) => {
                const customerBudgets = budgets.filter((b) => b.customer_id === customer.id);
                return (
                  <div key={customer.id} className="flex items-center justify-between p-3 border-l-4 border-green-500 bg-gray-50 rounded">
                    <div>
                      <p className="font-semibold">{customer.name}</p>
                      <p className="text-sm text-gray-600">{customer.email || 'Sem email'}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">{customerBudgets.length}</p>
                      <p className="text-xs text-gray-600">orçamento(s)</p>
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
