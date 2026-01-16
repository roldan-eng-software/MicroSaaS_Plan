import { useState } from 'react';
import { useBudgets } from '../hooks/useBudgets';
import { useCustomers } from '../hooks/useCustomers';

export default function Budgets() {
  const { budgets, loading, error, createBudget, updateBudget, deleteBudget } = useBudgets();
  const { customers } = useCustomers();
  const [formData, setFormData] = useState({
    title: '',
    customer_id: '',
    subtotal_amount: 0,
    discount_percent: 0,
    final_amount: 0,
    status: 'draft',
  });
  const [editingId, setEditingId] = useState<string | null>(null);

  // Calcular final_amount automaticamente
  const calculateFinalAmount = (subtotal: number, discount: number) => {
    return subtotal - (subtotal * (discount / 100));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      alert('Título é obrigatório');
      return;
    }

    try {
      const budgetData = {
        ...formData,
        final_amount: calculateFinalAmount(formData.subtotal_amount, formData.discount_percent),
      };

      if (editingId) {
        // Modo edição
        await updateBudget(editingId, budgetData);
        setEditingId(null);
      } else {
        // Modo criação
        await createBudget(budgetData);
      }
      setFormData({
        title: '',
        customer_id: '',
        subtotal_amount: 0,
        discount_percent: 0,
        final_amount: 0,
        status: 'draft',
      });
    } catch (err) {
      alert('Erro ao salvar orçamento');
    }
  };

  const handleEdit = (budget: any) => {
    setFormData({
      title: budget.title,
      customer_id: budget.customer_id || '',
      subtotal_amount: budget.subtotal_amount,
      discount_percent: budget.discount_percent,
      final_amount: budget.final_amount,
      status: budget.status || 'draft',
    });
    setEditingId(budget.id);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Tem certeza que deseja deletar este orçamento?')) {
      try {
        await deleteBudget(id);
      } catch (err) {
        alert('Erro ao deletar orçamento');
      }
    }
  };

  const handleCancel = () => {
    setFormData({
      title: '',
      customer_id: '',
      subtotal_amount: 0,
      discount_percent: 0,
      final_amount: 0,
      status: 'draft',
    });
    setEditingId(null);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  if (loading) return <div className="p-6">Carregando...</div>;

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-3xl font-bold">Orçamentos</h1>

      {error && <div className="bg-red-100 text-red-700 p-4 rounded">{error}</div>}

      {/* Formulário */}
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow space-y-4">
        <h2 className="text-xl font-semibold">
          {editingId ? 'Editar Orçamento' : 'Novo Orçamento'}
        </h2>

        <input
          type="text"
          placeholder="Título"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          className="w-full px-4 py-2 border rounded"
        />

                <select
          value={formData.customer_id}
          onChange={(e) => setFormData({ ...formData, customer_id: e.target.value })}
          className="w-full px-4 py-2 border rounded"
        >
          <option value="">Selecione um cliente (opcional)</option>
          {customers.map((customer) => (
            <option key={customer.id} value={customer.id}>
              {customer.name}
            </option>
          ))}
        </select>


        <div className="grid grid-cols-3 gap-4">
          <input
            type="number"
            placeholder="Subtotal"
            value={formData.subtotal_amount}
            onChange={(e) => {
              const subtotal = parseFloat(e.target.value) || 0;
              setFormData({
                ...formData,
                subtotal_amount: subtotal,
                final_amount: calculateFinalAmount(subtotal, formData.discount_percent),
              });
            }}
            className="px-4 py-2 border rounded"
            step="0.01"
          />

          <input
            type="number"
            placeholder="Desconto %"
            value={formData.discount_percent}
            onChange={(e) => {
              const discount = parseFloat(e.target.value) || 0;
              setFormData({
                ...formData,
                discount_percent: discount,
                final_amount: calculateFinalAmount(formData.subtotal_amount, discount),
              });
            }}
            className="px-4 py-2 border rounded"
            step="0.01"
          />

          <input
            type="number"
            placeholder="Total Final"
            value={formData.final_amount.toFixed(2)}
            disabled
            className="px-4 py-2 border rounded bg-gray-100"
          />
        </div>

        <select
          value={formData.status}
          onChange={(e) => setFormData({ ...formData, status: e.target.value })}
          className="w-full px-4 py-2 border rounded"
        >
          <option value="draft">Rascunho</option>
          <option value="approved">Aprovado</option>
          <option value="rejected">Rejeitado</option>
        </select>

        <div className="flex gap-2">
          <button
            type="submit"
            className="flex-1 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            {editingId ? 'Atualizar' : 'Criar'}
          </button>
          {editingId && (
            <button
              type="button"
              onClick={handleCancel}
              className="flex-1 bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-500"
            >
              Cancelar
            </button>
          )}
        </div>
      </form>

      {/* Tabela */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-6 py-3 text-left font-semibold">Título</th>
              <th className="px-6 py-3 text-left font-semibold">Cliente</th>
              <th className="px-6 py-3 text-right font-semibold">Subtotal</th>
              <th className="px-6 py-3 text-right font-semibold">Desconto</th>
              <th className="px-6 py-3 text-right font-semibold">Total</th>
              <th className="px-6 py-3 text-center font-semibold">Status</th>
              <th className="px-6 py-3 text-center font-semibold">Ações</th>
            </tr>
          </thead>
          <tbody>
            {budgets.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-4 text-center text-gray-500">
                  Nenhum orçamento cadastrado
                </td>
              </tr>
            ) : (
              budgets.map((budget) => (
                <tr key={budget.id} className="border-t hover:bg-gray-50">
                  <td className="px-6 py-4">{budget.title}</td>
                                    <td className="px-6 py-4">
                    {budget.customer_id
                      ? customers.find((c) => c.id === budget.customer_id)?.name || 'Cliente não encontrado'
                      : '-'}
                  </td>
                  <td className="px-6 py-4 text-right">R$ {budget.subtotal_amount.toFixed(2)}</td>
                  <td className="px-6 py-4 text-right">{budget.discount_percent}%</td>
                  <td className="px-6 py-4 text-right font-semibold">R$ {budget.final_amount.toFixed(2)}</td>
                  <td className="px-6 py-4 text-center">
                    <span className={`px-2 py-1 rounded text-sm font-semibold ${getStatusColor(budget.status || 'draft')}`}>
                      {budget.status === 'draft' && 'Rascunho'}
                      {budget.status === 'approved' && 'Aprovado'}
                      {budget.status === 'rejected' && 'Rejeitado'}
                    </span>
                  </td>
                  <td className="px-6 py-4 flex justify-center gap-2">
                    <button
                      onClick={() => handleEdit(budget)}
                      className="bg-yellow-500 text-white px-3 py-1 rounded text-sm hover:bg-yellow-600"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => handleDelete(budget.id)}
                      className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700"
                    >
                      Deletar
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
