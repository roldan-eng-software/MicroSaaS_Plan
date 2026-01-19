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
  const [formData, setFormData] = useState(initialFormData);
  const [editingId, setEditingId] = useState(null);
  const [exporting, setExporting] = useState(false);
  const [searchingCep, setSearchingCep] = useState(false);
  const [cepError, setCepError] = useState('');
  const [validationError, setValidationError] = useState('');

  // ==================== FUNÇÕES DE MÁSCARA ====================

  // Máscara para Telefone: (xx) XXXX-XXXX
  const formatPhoneNumber = (value: string): string => {
    const cleaned = value.replace(/\D/g, '');
    if (cleaned.length === 0) return '';
    if (cleaned.length <= 2) return `(${cleaned}`;
    if (cleaned.length <= 6) return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2)}`;
    return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 6)}-${cleaned.slice(6, 10)}`;
  };

  // Máscara para CPF: XXX.XXX.XXX-XX
  const formatCPF = (value: string): string => {
    const cleaned = value.replace(/\D/g, '');
    if (cleaned.length === 0) return '';
    if (cleaned.length <= 3) return cleaned;
    if (cleaned.length <= 6) return `${cleaned.slice(0, 3)}.${cleaned.slice(3)}`;
    if (cleaned.length <= 9) return `${cleaned.slice(0, 3)}.${cleaned.slice(3, 6)}.${cleaned.slice(6)}`;
    return `${cleaned.slice(0, 3)}.${cleaned.slice(3, 6)}.${cleaned.slice(6, 9)}-${cleaned.slice(9, 11)}`;
  };

  // Máscara para CNPJ: XX.XXX.XXX/XXXX-XX
  const formatCNPJ = (value: string): string => {
    const cleaned = value.replace(/\D/g, '');
    if (cleaned.length === 0) return '';
    if (cleaned.length <= 2) return cleaned;
    if (cleaned.length <= 5) return `${cleaned.slice(0, 2)}.${cleaned.slice(2)}`;
    if (cleaned.length <= 8) return `${cleaned.slice(0, 2)}.${cleaned.slice(2, 5)}.${cleaned.slice(5)}`;
    if (cleaned.length <= 12) return `${cleaned.slice(0, 2)}.${cleaned.slice(2, 5)}.${cleaned.slice(5, 8)}/${cleaned.slice(8)}`;
    return `${cleaned.slice(0, 2)}.${cleaned.slice(2, 5)}.${cleaned.slice(5, 8)}/${cleaned.slice(8, 12)}-${cleaned.slice(12, 14)}`;
  };

  // Máscara para CEP: XXXXX-XXX
  const formatCEP = (value: string): string => {
    const cleaned = value.replace(/\D/g, '');
    if (cleaned.length === 0) return '';
    if (cleaned.length <= 5) return cleaned;
    return `${cleaned.slice(0, 5)}-${cleaned.slice(5, 8)}`;
  };

  // ==================== FIM FUNÇÕES DE MÁSCARA ====================

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
    const cleanCpf = cpf.replace(/\D/g, '');
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
    const cleanCnpj = cnpj.replace(/\D/g, '');
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

    if (remainder !== parseInt(cleanCnpj[12])) return false;

    sum = 0;
    const secondMultiplier = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];

    for (let i = 0; i < 13; i++) {
      sum += parseInt(cleanCnpj[i]) * secondMultiplier[i];
    }

    remainder = sum % 11;
    if (remainder < 2) remainder = 0;
    else remainder = 11 - remainder;

    if (remainder !== parseInt(cleanCnpj[13])) return false;

    return true;
  };

  // Handle Input Change com máscaras
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    let formattedValue = value;

    // Aplicar máscaras conforme o campo
    if (name === 'telefone') {
      formattedValue = formatPhoneNumber(value);
    } else if (name === 'cpf_cnpj') {
      if (formData.tipo_pessoa === 'fisica') {
        formattedValue = formatCPF(value);
      } else {
        formattedValue = formatCNPJ(value);
      }
    } else if (name === 'cep') {
      formattedValue = formatCEP(value);
    }

    setFormData({ ...formData, [name]: formattedValue });
    setValidationError('');
  };

  // Handle quando muda tipo de pessoa (reset CPF/CNPJ)
  const handleTipoPessoaChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFormData({
      ...formData,
      tipo_pessoa: e.target.value as 'fisica' | 'juridica',
      cpf_cnpj: '', // Limpa o campo para evitar confusão
    });
  };

  // Handle Submit
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

  // Handle Edit
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

  // Handle Delete
  const handleDelete = async (id: string) => {
    if (window.confirm('Tem certeza que deseja deletar este cliente?')) {
      try {
        await deleteCustomer(id);
      } catch (err) {
        alert('Erro ao deletar cliente');
      }
    }
  };

  // Handle Cancel
  const handleCancel = () => {
    setFormData(initialFormData);
    setEditingId(null);
    setValidationError('');
  };

  // Handle Export Clients
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

  if (loading) return <div>Carregando...</div>;

  return (
    <div className="p-4 md:p-8 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">👥 Clientes</h1>
        <button
          onClick={handleExportClients}
          disabled={exporting || customers.length === 0}
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:bg-gray-400"
        >
          {exporting ? '⏳ Exportando...' : '📥 Exportar Excel'}
        </button>
      </div>

      {/* Error Messages */}
      {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">{error}</div>}
      {validationError && <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded mb-4">{validationError}</div>}
      {cepError && <div className="bg-orange-100 border border-orange-400 text-orange-700 px-4 py-3 rounded mb-4">{cepError}</div>}

      {/* Form */}
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded shadow-md mb-8">
        <h2 className="text-2xl font-bold mb-6 text-gray-700">
          {editingId ? '✏️ Editar Cliente' : '➕ Novo Cliente'}
        </h2>

        {/* Row 1: Nome, Telefone */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-gray-700 font-semibold mb-2">Nome *</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-blue-500"
              placeholder="Digite o nome completo"
            />
          </div>
          <div>
            <label className="block text-gray-700 font-semibold mb-2">Telefone * (xx) XXXX-XXXX</label>
            <input
              type="text"
              name="telefone"
              value={formData.telefone}
              onChange={handleInputChange}
              maxLength={14}
              className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-blue-500"
              placeholder="(11) 9999-9999"
            />
          </div>
        </div>

        {/* Row 2: Email, Tipo Pessoa */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-gray-700 font-semibold mb-2">E-mail (Opcional)</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-blue-500"
              placeholder="exemplo@email.com"
            />
          </div>
          <div>
            <label className="block text-gray-700 font-semibold mb-2">Tipo de Pessoa</label>
            <select
              name="tipo_pessoa"
              value={formData.tipo_pessoa}
              onChange={handleTipoPessoaChange}
              className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-blue-500"
            >
              <option value="fisica">Pessoa Física</option>
              <option value="juridica">Pessoa Jurídica</option>
            </select>
          </div>
        </div>

        {/* Row 3: CPF/CNPJ, CEP */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-gray-700 font-semibold mb-2">
              {formData.tipo_pessoa === 'fisica' ? 'CPF (Opcional) XXX.XXX.XXX-XX' : 'CNPJ (Opcional) XX.XXX.XXX/XXXX-XX'}
            </label>
            <input
              type="text"
              name="cpf_cnpj"
              value={formData.cpf_cnpj}
              onChange={handleInputChange}
              maxLength={formData.tipo_pessoa === 'fisica' ? 14 : 18}
              className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-blue-500"
              placeholder={formData.tipo_pessoa === 'fisica' ? '000.000.000-00' : '00.000.000/0000-00'}
            />
          </div>
          <div>
            <label className="block text-gray-700 font-semibold mb-2">CEP (Opcional)</label>
            <div className="relative">
              <input
                type="text"
                name="cep"
                value={formData.cep}
                onChange={handleInputChange}
                maxLength={9}
                className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-blue-500"
                placeholder="00000-000"
              />
              {searchingCep && <span className="text-sm text-blue-500">⏳ Buscando...</span>}
            </div>
          </div>
        </div>

        {/* Row 4: Endereço, Número */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-gray-700 font-semibold mb-2">Endereço (Opcional)</label>
            <input
              type="text"
              name="endereco"
              value={formData.endereco}
              onChange={handleInputChange}
              className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-blue-500"
              placeholder="Rua, Avenida, etc."
            />
          </div>
          <div>
            <label className="block text-gray-700 font-semibold mb-2">Número (Opcional)</label>
            <input
              type="text"
              name="numero"
              value={formData.numero}
              onChange={handleInputChange}
              className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-blue-500"
              placeholder="Ex: 123"
            />
          </div>
        </div>

        {/* Row 5: Complemento, Bairro */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-gray-700 font-semibold mb-2">Complemento (Opcional)</label>
            <input
              type="text"
              name="complemento"
              value={formData.complemento}
              onChange={handleInputChange}
              className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-blue-500"
              placeholder="Apto, sala, etc."
            />
          </div>
          <div>
            <label className="block text-gray-700 font-semibold mb-2">Bairro (Opcional)</label>
            <input
              type="text"
              name="bairro"
              value={formData.bairro}
              onChange={handleInputChange}
              className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-blue-500"
              placeholder="Nome do bairro"
            />
          </div>
        </div>

        {/* Row 6: Cidade, Estado */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-gray-700 font-semibold mb-2">Cidade (Opcional)</label>
            <input
              type="text"
              name="cidade"
              value={formData.cidade}
              onChange={handleInputChange}
              className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-blue-500"
              placeholder="Nome da cidade"
            />
          </div>
          <div>
            <label className="block text-gray-700 font-semibold mb-2">Estado (Opcional)</label>
            <input
              type="text"
              name="estado"
              value={formData.estado}
              onChange={handleInputChange}
              maxLength={2}
              className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-blue-500 uppercase"
              placeholder="SP"
            />
          </div>
        </div>

        {/* Row 7: Observações (Full Width) */}
        <div className="mb-6">
          <label className="block text-gray-700 font-semibold mb-2">Observações (Opcional)</label>
          <textarea
            name="detalhes"
            value={formData.detalhes}
            onChange={handleInputChange}
            rows={4}
            className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-blue-500"
            placeholder="Anotações sobre o cliente..."
          />
        </div>

        {/* Buttons */}
        <div className="flex gap-4">
          <button
            type="submit"
            className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 font-semibold"
          >
            {editingId ? '✏️ Atualizar' : '➕ Criar'}
          </button>
          {editingId && (
            <button
              type="button"
              onClick={handleCancel}
              className="bg-gray-500 text-white px-6 py-2 rounded hover:bg-gray-600 font-semibold"
            >
              Cancelar
            </button>
          )}
        </div>
      </form>

      {/* Table */}
      <div className="bg-white rounded shadow-md overflow-x-auto">
        <table className="w-full border-collapse">
          <thead className="bg-gray-200">
            <tr>
              <th className="border border-gray-300 px-4 py-2 text-left">Nome</th>
              <th className="border border-gray-300 px-4 py-2 text-left">Telefone</th>
              <th className="border border-gray-300 px-4 py-2 text-left">Email</th>
              <th className="border border-gray-300 px-4 py-2 text-left">CPF/CNPJ</th>
              <th className="border border-gray-300 px-4 py-2 text-left">Cidade</th>
              <th className="border border-gray-300 px-4 py-2 text-center">Ações</th>
            </tr>
          </thead>
          <tbody>
            {customers.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center py-8 text-gray-500">
                  Nenhum cliente cadastrado
                </td>
              </tr>
            ) : (
              customers.map((customer) => (
                <tr key={customer.id} className="hover:bg-gray-100">
                  <td className="border border-gray-300 px-4 py-2">{customer.name}</td>
                  <td className="border border-gray-300 px-4 py-2">{customer.telefone || '-'}</td>
                  <td className="border border-gray-300 px-4 py-2">{customer.email || '-'}</td>
                  <td className="border border-gray-300 px-4 py-2">{customer.cpf_cnpj || '-'}</td>
                  <td className="border border-gray-300 px-4 py-2">{customer.cidade || '-'}</td>
                  <td className="border border-gray-300 px-4 py-2 text-center">
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
  );
}
