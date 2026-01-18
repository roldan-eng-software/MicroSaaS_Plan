import { useState, useEffect } from 'react';
import { useCustomers } from '../hooks/useCustomers';

interface FormDataType {
  name: string;
  cep: string;
  endereco: string;
  numero: string;
  complemento: string;
  bairro: string;
  cidade: string;
  estado: string;
  telefone: string;
  email: string;
  cpf_cnpj: string;
  tipo_pessoa: 'fisica' | 'juridica';
  detalhes: string;
}

const initialFormData: FormDataType = {
  name: '',
  cep: '',
  endereco: '',
  numero: '',
  complemento: '',
  bairro: '',
  cidade: '',
  estado: '',
  telefone: '',
  email: '',
  cpf_cnpj: '',
  tipo_pessoa: 'fisica',
  detalhes: '',
};

export default function Customers() {
  const { customers, loading, error, createCustomer, updateCustomer, deleteCustomer } = useCustomers();

  const [formData, setFormData] = useState<FormDataType>(initialFormData);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [exporting, setExporting] = useState(false);
  const [searchingCep, setSearchingCep] = useState(false);
  const [cepError, setCepError] = useState('');
  const [validationError, setValidationError] = useState('');

  // Função para buscar endereço via ViaCEP
  const searchCep = async (cep: string) => {
    if (cep.length !== 8 && cep.length !== 9) return;

    setSearchingCep(true);
    setCepError('');

    try {
      const cleanCep = cep.replace('-', '').replace('.', '');
      const response = await fetch(`https://viacep.com.br/ws/${cleanCep}/json/`);
      const data = await response.json();

      if (data.erro) {
        setCepError('CEP não encontrado');
        setSearchingCep(false);
        return;
      }

      // Auto-preencher campos
      setFormData((prev) => ({
        ...prev,
        endereco: data.logradouro || '',
        bairro: data.bairro || '',
        cidade: data.localidade || '',
        estado: data.uf || '',
      }));

      setCepError('');
    } catch (err) {
      setCepError('Erro ao buscar CEP');
    } finally {
      setSearchingCep(false);
    }
  };

  // Debounce para busca de CEP
  useEffect(() => {
    const timer = setTimeout(() => {
      if (formData.cep && formData.cep.length >= 8) {
        searchCep(formData.cep);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [formData.cep]);

  // Validar CPF
  const validateCPF = (cpf: string): boolean => {
    const cleanCpf = cpf.replace(/[^\\d]/g, '');
    if (cleanCpf.length !== 11) return false;

    let sum = 0;
    let remainder;

    for (let i = 1; i <= 9; i++) {
      sum += parseInt(cleanCpf.substring(i - 1, i)) * (11 - i);
    }

    remainder = (sum * 10) % 11;
    if (remainder === 10 || remainder === 11) remainder = 0;
    if (remainder !== parseInt(cleanCpf.substring(9, 10))) return false;

    sum = 0;
    for (let i = 1; i <= 10; i++) {
      sum += parseInt(cleanCpf.substring(i - 1, i)) * (12 - i);
    }

    remainder = (sum * 10) % 11;
    if (remainder === 10 || remainder === 11) remainder = 0;
    if (remainder !== parseInt(cleanCpf.substring(10, 11))) return false;

    return true;
  };

  // Validar CNPJ
  const validateCNPJ = (cnpj: string): boolean => {
    const cleanCnpj = cnpj.replace(/[^\\d]/g, '');
    if (cleanCnpj.length !== 14) return false;

    let sum = 0;
    let remainder;

    const firstMultiplier = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
    for (let i = 0; i < 12; i++) {
      sum += parseInt(cleanCnpj[i]) * firstMultiplier[i];
    }

    remainder = sum % 11;
    if (remainder < 2) remainder = 0;
    else remainder = 11 - remainder;

    if (remainder !== parseInt(cleanCnpj)) return false;

    sum = 0;
    const secondMultiplier = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
    for (let i = 0; i < 13; i++) {
      sum += parseInt(cleanCnpj[i]) * secondMultiplier[i];
    }

    remainder = sum % 11;
    if (remainder < 2) remainder = 0;
    else remainder = 11 - remainder;

    if (remainder !== parseInt(cleanCnpj)) return false;

    return true;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    setValidationError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validações
    if (!formData.name.trim()) {
      setValidationError('Nome é obrigatório');
      return;
    }

    if (!formData.telefone.trim()) {
      setValidationError('Telefone é obrigatório');
      return;
    }

    if (formData.cpf_cnpj) {
      if (formData.tipo_pessoa === 'fisica') {
        if (!validateCPF(formData.cpf_cnpj)) {
          setValidationError('CPF inválido');
          return;
        }
      } else {
        if (!validateCNPJ(formData.cpf_cnpj)) {
          setValidationError('CNPJ inválido');
          return;
        }
      }
    }

    try {
      if (editingId) {
        await updateCustomer(editingId, formData);
      } else {
        await createCustomer(formData);
      }

      setFormData(initialFormData);
      setEditingId(null);
      setValidationError('');
    } catch (err) {
      setValidationError('Erro ao salvar cliente');
    }
  };

  const handleEdit = (customer: any) => {
    setFormData({
      name: customer.name || '',
      cep: customer.cep || '',
      endereco: customer.endereco || '',
      numero: customer.numero || '',
      complemento: customer.complemento || '',
      bairro: customer.bairro || '',
      cidade: customer.cidade || '',
      estado: customer.estado || '',
      telefone: customer.telefone || '',
      email: customer.email || '',
      cpf_cnpj: customer.cpf_cnpj || '',
      tipo_pessoa: customer.tipo_pessoa || 'fisica',
      detalhes: customer.detalhes || '',
    });
    setEditingId(customer.id);
    window.scrollTo(0, 0);
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
    setFormData(initialFormData);
    setEditingId(null);
    setValidationError('');
  };

  const handleExportClients = async () => {
    try {
      setExporting(true);
      const token = localStorage.getItem('access_token');

      if (!token) {
        alert('Token não encontrado. Faça login novamente.');
        return;
      }

      const response = await fetch('http://localhost:8000/api/export/customers', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Erro ao exportar clientes');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `clientes_${new Date().toLocaleDateString('pt-BR')}.xlsx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      alert('✅ Arquivo de clientes exportado com sucesso!');
    } catch (err) {
      console.error('Erro ao exportar:', err);
      alert('❌ Erro ao exportar clientes');
    } finally {
      setExporting(false);
    }
  };

  if (loading) return <div className="p-6 text-center">Carregando...</div>;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">👥 Clientes</h1>
          <button
            onClick={handleExportClients}
            disabled={exporting || customers.length === 0}
            className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50 transition"
          >
            {exporting ? '⏳ Exportando...' : '📥 Exportar Excel'}
          </button>
        </div>

        {/* Error Messages */}
        {error && <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 text-red-700">{error}</div>}
        {validationError && <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 text-red-700">{validationError}</div>}
        {cepError && <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 mb-6 text-yellow-700">{cepError}</div>}

        {/* Form */}
        <div className="bg-white rounded-lg shadow-md p-8 mb-8">
          <h2 className="text-xl font-bold mb-6 text-gray-900">
            {editingId ? '✏️ Editar Cliente' : '➕ Novo Cliente'}
          </h2>

          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Row 1: Nome, Telefone */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Nome *</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="Nome do cliente"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Telefone *</label>
              <input
                type="tel"
                name="telefone"
                value={formData.telefone}
                onChange={handleInputChange}
                placeholder="(11) 98765-4321"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Row 2: Email, Tipo Pessoa */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">E-mail (Opcional)</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="email@example.com"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Tipo de Pessoa</label>
              <select
                name="tipo_pessoa"
                value={formData.tipo_pessoa}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="fisica">Pessoa Física</option>
                <option value="juridica">Pessoa Jurídica</option>
              </select>
            </div>

            {/* Row 3: CPF/CNPJ, CEP */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {formData.tipo_pessoa === 'fisica' ? 'CPF' : 'CNPJ'} (Opcional)
              </label>
              <input
                type="text"
                name="cpf_cnpj"
                value={formData.cpf_cnpj}
                onChange={handleInputChange}
                placeholder={formData.tipo_pessoa === 'fisica' ? '123.456.789-00' : '12.345.678/0001-00'}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">CEP (Opcional)</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  name="cep"
                  value={formData.cep}
                  onChange={handleInputChange}
                  placeholder="01310-100"
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                {searchingCep && <span className="text-blue-600 text-sm py-2">⏳ Buscando...</span>}
              </div>
            </div>

            {/* Row 4: Endereço, Número */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Endereço (Opcional)</label>
              <input
                type="text"
                name="endereco"
                value={formData.endereco}
                onChange={handleInputChange}
                placeholder="Rua, Avenida, etc."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Número (Opcional)</label>
              <input
                type="text"
                name="numero"
                value={formData.numero}
                onChange={handleInputChange}
                placeholder="123"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Row 5: Complemento, Bairro */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Complemento (Opcional)</label>
              <input
                type="text"
                name="complemento"
                value={formData.complemento}
                onChange={handleInputChange}
                placeholder="Apto 101, Bloco A, etc."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Bairro (Opcional)</label>
              <input
                type="text"
                name="bairro"
                value={formData.bairro}
                onChange={handleInputChange}
                placeholder="Bairro"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Row 6: Cidade, Estado */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Cidade (Opcional)</label>
              <input
                type="text"
                name="cidade"
                value={formData.cidade}
                onChange={handleInputChange}
                placeholder="São Paulo"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Estado (Opcional)</label>
              <input
                type="text"
                name="estado"
                value={formData.estado}
                maxLength={2}
                onChange={handleInputChange}
                placeholder="SP"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent uppercase"
              />
            </div>

            {/* Row 7: Detalhes (Full Width) */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Observações (Opcional)</label>
              <textarea
                name="detalhes"
                value={formData.detalhes}
                onChange={handleInputChange}
                placeholder="Notas adicionais sobre o cliente..."
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Buttons */}
            <div className="md:col-span-2 flex gap-3">
              <button
                type="submit"
                className="flex-1 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 font-medium transition"
              >
                {editingId ? '✏️ Atualizar' : '➕ Criar'}
              </button>
              {editingId && (
                <button
                  type="button"
                  onClick={handleCancel}
                  className="flex-1 bg-gray-500 text-white px-6 py-2 rounded-lg hover:bg-gray-600 font-medium transition"
                >
                  Cancelar
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Table */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-100 border-b border-gray-300">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Nome</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Telefone</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Email</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">CPF/CNPJ</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Cidade</th>
                  <th className="px-6 py-3 text-center text-sm font-semibold text-gray-700">Ações</th>
                </tr>
              </thead>
              <tbody>
                {customers.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                      Nenhum cliente cadastrado
                    </td>
                  </tr>
                ) : (
                  customers.map((customer) => (
                    <tr key={customer.id} className="border-b border-gray-200 hover:bg-gray-50 transition">
                      <td className="px-6 py-4 text-sm text-gray-900 font-medium">{customer.name}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{customer.telefone || '-'}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{customer.email || '-'}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{customer.cpf_cnpj || '-'}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{customer.cidade || '-'}</td>
                      <td className="px-6 py-4 text-center">
                        <button
                          onClick={() => handleEdit(customer)}
                          className="bg-yellow-500 text-white px-3 py-1 rounded text-sm hover:bg-yellow-600 mr-2"
                        >
                          ✏️ Editar
                        </button>
                        <button
                          onClick={() => handleDelete(customer.id)}
                          className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700"
                        >
                          🗑️ Deletar
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
