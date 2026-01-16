import { useState } from 'react';
import { useBudgets } from '../hooks/useBudgets';

export default function Budgets() {
  const [newBudgetTitle, setNewBudgetTitle] = useState('');
  const [newBudgetSubtotal, setNewBudgetSubtotal] = useState('');
  const { budgets, loading, error, refetch, createBudget } = useBudgets();

  const handleCreate = async () => {
    if (!newBudgetTitle.trim()) return;
    try {
      const subtotal = parseFloat(newBudgetSubtotal) || 0;
      await createBudget(newBudgetTitle.trim(), subtotal);
      setNewBudgetTitle('');
      setNewBudgetSubtotal('');
    } catch (err) {
      alert('Erro ao criar orçamento');
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'draft': return 'bg-yellow-100 text-yellow-800';
      case 'sent': return 'bg-blue-100 text-blue-800';
      case 'approved': return 'bg-emerald-100 text-emerald-800';
      case 'paid': return 'bg-green-100 text-green-800';
      default: return 'bg-slate-100 text-slate-800';
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 mb-2">💰 Orçamentos</h1>
        <p className="text-slate-600">Crie e gerencie orçamentos para seus clientes</p>
      </div>

      {/* Form Novo Orçamento */}
      <div className="bg-white p-8 rounded-2xl shadow-lg border border-slate-200">
        <h2 className="text-xl font-semibold text-slate-900 mb-6">➕ Novo Orçamento</h2>
        <div className="grid md:grid-cols-4 gap-4">
          <input
            type="text"
            placeholder="Título do orçamento (ex: Cozinha Planejada)"
            value={newBudgetTitle}
            onChange={(e) => setNewBudgetTitle(e.target.value)}
            className="px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition md:col-span-2"
          />
          <input
            type="number"
            placeholder="Subtotal (R$)"
            value={newBudgetSubtotal}
            onChange={(e) => setNewBudgetSubtotal(e.target.value)}
            className="px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition"
          />
          <button
            onClick={handleCreate}
            disabled={!newBudgetTitle.trim()}
            className="bg-orange-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-orange-700 focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm hover:shadow-md md:col-span-1"
          >
            ➕ Criar Orçamento
          </button>
        </div>
      </div>

      {/* Lista de Orçamentos */}
      <div className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden">
        <div className="p-6 border-b border-slate-200">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-slate-900">
              📋 Orçamentos ({budgets.length})
            </h2>
            <button
              onClick={refetch}
              disabled={loading}
              className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition flex items-center gap-2 text-sm"
            >
              {loading ? '🔄 Carregando...' : '🔄 Atualizar'}
            </button>
          </div>
        </div>

        {error && (
          <div className="p-6 bg-red-50 border-t border-red-200">
            <p className="text-red-800 text-sm">❌ {error}</p>
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">ID</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">Título</th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-slate-700 uppercase tracking-wider">Subtotal</th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-slate-700 uppercase tracking-wider">Desconto</th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-slate-700 uppercase tracking-wider">Total</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider w-28">Status</th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-slate-700 uppercase tracking-wider w-32">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-slate-500">
                    🔄 Carregando orçamentos...
                  </td>
                </tr>
              ) : budgets.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-slate-500">
                    📭 Nenhum orçamento criado
                  </td>
                </tr>
              ) : (
                budgets.map((budget) => (
                  <tr key={budget.id} className="hover:bg-slate-50 transition">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-slate-500">
                      {budget.id}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-slate-900 truncate max-w-xs" title={budget.title}>
                        {budget.title}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="text-sm font-semibold text-slate-900">
                        {formatCurrency(budget.subtotal_amount)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="text-sm text-slate-600">
                        {budget.discount_percent}%
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="text-lg font-bold text-emerald-600">
                        {formatCurrency(budget.final_amount)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(budget.status)}`}>
                        {budget.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button className="text-blue-600 hover:text-blue-900 mr-3 hover:underline">Editar</button>
                      <button className="text-red-600 hover:text-red-900 hover:underline">Deletar</button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Adicionar função formatCurrency no final da página */}
      {(() => {
        const formatCurrency = (value: number) => {
          return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL',
          }).format(value);
        };

        return null;
      })()}
    </div>
  );
}
// Adicione ANTES do export default
const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
};

const getStatusColor = (status: string) => {
  switch (status.toLowerCase()) {
    case 'draft': return 'bg-yellow-100 text-yellow-800';
    case 'sent': return 'bg-blue-100 text-blue-800';
    case 'approved': return 'bg-emerald-100 text-emerald-800';
    case 'paid': return 'bg-green-100 text-green-800';
    default: return 'bg-slate-100 text-slate-800';
  }
};
