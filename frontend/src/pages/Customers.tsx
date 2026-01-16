import { useState } from 'react';
import { useCustomers } from '../hooks/useCustomers';

export default function Customers() {
  const [newCustomerName, setNewCustomerName] = useState('');
  const [newCustomerEmail, setNewCustomerEmail] = useState('');
  const { customers, loading, error, refetch, createCustomer } = useCustomers();

  const handleCreate = async () => {
    if (!newCustomerName.trim()) return;
    try {
      await createCustomer(newCustomerName.trim(), newCustomerEmail.trim() || undefined);
      setNewCustomerName('');
      setNewCustomerEmail('');
    } catch (err) {
      alert('Erro ao criar cliente');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 mb-2">👥 Clientes</h1>
        <p className="text-slate-600">Gerencie seus clientes e contatos</p>
      </div>

      {/* Form Novo Cliente */}
      <div className="bg-white p-8 rounded-2xl shadow-lg border border-slate-200">
        <h2 className="text-xl font-semibold text-slate-900 mb-6">➕ Novo Cliente</h2>
        <div className="grid md:grid-cols-3 gap-4">
          <input
            type="text"
            placeholder="Nome do cliente"
            value={newCustomerName}
            onChange={(e) => setNewCustomerName(e.target.value)}
            className="px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
          />
          <input
            type="email"
            placeholder="email@exemplo.com (opcional)"
            value={newCustomerEmail}
            onChange={(e) => setNewCustomerEmail(e.target.value)}
            className="px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
          />
          <button
            onClick={handleCreate}
            disabled={!newCustomerName.trim()}
            className="bg-blue-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm hover:shadow-md"
          >
            ➕ Criar Cliente
          </button>
        </div>
      </div>

      {/* Lista de Clientes */}
      <div className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden">
        <div className="p-6 border-b border-slate-200">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-slate-900">📋 Clientes Cadastrados</h2>
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
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">Nome</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">Email</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider w-32">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {loading ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-slate-500">
                    🔄 Carregando clientes...
                  </td>
                </tr>
              ) : customers.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-slate-500">
                    📭 Nenhum cliente cadastrado
                  </td>
                </tr>
              ) : (
                customers.map((customer) => (
                  <tr key={customer.id} className="hover:bg-slate-50 transition">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-slate-500">
                      {customer.id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-slate-900">{customer.name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-slate-600">{customer.email || '—'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button className="text-blue-600 hover:text-blue-900 mr-3">Editar</button>
                      <button className="text-red-600 hover:text-red-900">Deletar</button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
