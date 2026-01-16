import { useState } from 'react';
import { useCustomers } from '../hooks/useCustomers';

export default function Customers() {
  const { customers, loading, error, createCustomer, updateCustomer, deleteCustomer } = useCustomers();
  const [formData, setFormData] = useState({ name: '', email: '', phone: '' });
  const [editingId, setEditingId] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      alert('Nome é obrigatório');
      return;
    }

    try {
      if (editingId) {
        // Modo edição
        await updateCustomer(editingId, formData);
        setEditingId(null);
      } else {
        // Modo criação
        await createCustomer(formData);
      }
      setFormData({ name: '', email: '', phone: '' });
    } catch (err) {
      alert('Erro ao salvar cliente');
    }
  };

  const handleEdit = (customer: any) => {
    setFormData({
      name: customer.name,
      email: customer.email || '',
      phone: customer.phone || '',
    });
    setEditingId(customer.id);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Tem certeza que deseja deletar este cliente?')) {
      try {
        await deleteCustomer(id);
      } catch (err) {
        alert('Erro ao deletar cliente');
      }
    }
  };

  const handleCancel = () => {
    setFormData({ name: '', email: '', phone: '' });
    setEditingId(null);
  };

  if (loading) return <div className="p-6">Carregando...</div>;

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-3xl font-bold">Clientes</h1>

      {error && <div className="bg-red-100 text-red-700 p-4 rounded">{error}</div>}

      {/* Formulário */}
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow space-y-4">
        <h2 className="text-xl font-semibold">
          {editingId ? 'Editar Cliente' : 'Novo Cliente'}
        </h2>

        <input
          type="text"
          placeholder="Nome"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          className="w-full px-4 py-2 border rounded"
        />

        <input
          type="email"
          placeholder="Email (opcional)"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          className="w-full px-4 py-2 border rounded"
        />

        <input
          type="tel"
          placeholder="Telefone (opcional)"
          value={formData.phone}
          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
          className="w-full px-4 py-2 border rounded"
        />

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
              <th className="px-6 py-3 text-left font-semibold">Nome</th>
              <th className="px-6 py-3 text-left font-semibold">Email</th>
              <th className="px-6 py-3 text-left font-semibold">Telefone</th>
              <th className="px-6 py-3 text-center font-semibold">Ações</th>
            </tr>
          </thead>
          <tbody>
            {customers.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-6 py-4 text-center text-gray-500">
                  Nenhum cliente cadastrado
                </td>
              </tr>
            ) : (
              customers.map((customer) => (
                <tr key={customer.id} className="border-t hover:bg-gray-50">
                  <td className="px-6 py-4">{customer.name}</td>
                  <td className="px-6 py-4">{customer.email || '-'}</td>
                  <td className="px-6 py-4">{customer.phone || '-'}</td>
                  <td className="px-6 py-4 flex justify-center gap-2">
                    <button
                      onClick={() => handleEdit(customer)}
                      className="bg-yellow-500 text-white px-3 py-1 rounded text-sm hover:bg-yellow-600"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => handleDelete(customer.id)}
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
