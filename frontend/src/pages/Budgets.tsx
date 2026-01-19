import { useState, useEffect } from 'react';
import { useBudgets } from '../hooks/useBudgets';
import { useCustomers } from '../hooks/useCustomers';

interface FormDataType {
  title: string;
  budget_number?: string;
  customer_id: string;
  project_name?: string;
  project_details?: string;
  validity?: string;
  delivery_deadline?: string;
  subtotal_amount: number;
  discount_percent: number;
  discount_amount?: number;
  discount_type?: 'fixed' | 'percent';
  final_amount: number;
  payment_conditions?: string;
  payment_methods?: string[];
  drawing_url?: string;
  observations?: string;
  status?: string;
}

const initialFormData: FormDataType = {
  title: '',
  budget_number: '',
  customer_id: '',
  project_name: '',
  project_details: '',
  validity: '30 dias',
  delivery_deadline: '20 dias',
  subtotal_amount: 0,
  discount_percent: 0,
  discount_amount: 0,
  discount_type: 'fixed',
  final_amount: 0,
  payment_conditions: 'à vista',
  payment_methods: [],
  drawing_url: '',
  observations: '',
  status: 'draft',
};

const paymentMethodOptions = [
  { value: 'pix', label: 'Pix' },
  { value: 'boleto', label: 'Boleto' },
  { value: 'cartao_credito', label: 'Cartão Crédito' },
  { value: 'cartao_debito', label: 'Cartão Débito' },
  { value: 'transferencia', label: 'Transferência' },
  { value: 'dinheiro', label: 'Dinheiro' },
];

export default function Budgets() {
  const { budgets, createBudget, updateBudget, deleteBudget, loading, error } = useBudgets();
  const { customers } = useCustomers();
  const [formData, setFormData] = useState<FormDataType>(initialFormData);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [validationError, setValidationError] = useState('');
  const [uploadingImage, setUploadingImage] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  // ==================== FUNÇÕES AUXILIARES ====================

  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  // Calcular Total Final automaticamente
  const calculateFinalAmount = (subtotal: number, discount: number, discountType: string): number => {
    if (discountType === 'percent') {
      // Desconto percentual: subtotal - (subtotal * desconto / 100)
      return subtotal - (subtotal * discount / 100);
    } else {
      // Desconto fixo: subtotal - desconto
      return subtotal - discount;
    }
  };

  // Gerar número sequencial do orçamento
  const generateBudgetNumber = (): string => {
    const year = new Date().getFullYear();
    const count = budgets.length + 1;
    const sequencial = String(count).padStart(3, '0');
    return `${year}-${sequencial}`;
  };

  // Auto-gerar número ao entrar na página
  useEffect(() => {
    if (!editingId && !formData.budget_number) {
      setFormData(prev => ({
        ...prev,
        budget_number: generateBudgetNumber()
      }));
    }
  }, [budgets.length, editingId]);

  // Recalcular Total Final quando subtotal ou desconto mudar
  useEffect(() => {
    const newTotal = calculateFinalAmount(
      formData.subtotal_amount,
      formData.discount_percent,
      formData.discount_type || 'fixed'
    );
    
    if (newTotal !== formData.final_amount) {
      setFormData(prev => ({
        ...prev,
        final_amount: newTotal
      }));
    }
  }, [formData.subtotal_amount, formData.discount_percent, formData.discount_type]);

  const handlePaymentMethodChange = (method: string) => {
    setFormData(prev => {
      const methods = (prev.payment_methods || []).includes(method)
        ? (prev.payment_methods || []).filter(m => m !== method)
        : [...(prev.payment_methods || []), method];
      return { ...prev, payment_methods: methods };
    });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    if (name === 'subtotal_amount' || name === 'discount_percent' || name === 'discount_amount') {
      setFormData({ ...formData, [name]: parseFloat(value) || 0 });
    } else {
      setFormData({ ...formData, [name]: value });
    }
    
    setValidationError('');
  };

  // ==================== UPLOAD DE IMAGEM ====================

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validar tipo de arquivo
    if (!file.type.startsWith('image/')) {
      setValidationError('Por favor, selecione uma imagem válida');
      return;
    }

    // Validar tamanho (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setValidationError('Imagem muito grande (máx 5MB)');
      return;
    }

    try {
      setUploadingImage(true);

      // Converter para Base64 ou usar FormData
      // Opção 1: Base64 (simples, sem backend)
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64String = event.target?.result as string;
        setFormData(prev => ({
          ...prev,
          drawing_url: base64String
        }));
        setPreviewImage(base64String);
      };
      reader.readAsDataURL(file);

      // Opção 2: Uncomment se tiver endpoint de upload
      /*
      const formDataUpload = new FormData();
      formDataUpload.append('file', file);
      
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formDataUpload,
      });
      
      const data = await response.json();
      setFormData(prev => ({
        ...prev,
        drawing_url: data.url
      }));
      setPreviewImage(data.url);
      */

    } catch (err) {
      setValidationError('Erro ao fazer upload da imagem');
      console.error('Erro:', err);
    } finally {
      setUploadingImage(false);
    }
  };

  const handleRemoveImage = () => {
    setFormData(prev => ({
      ...prev,
      drawing_url: ''
    }));
    setPreviewImage(null);
  };

  // ==================== VALIDAÇÃO E SUBMIT ====================

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError('');

    // Validações básicas
    if (!formData.title.trim()) {
      setValidationError('Título é obrigatório');
      return;
    }

    if (!formData.customer_id.trim()) {
      setValidationError('Cliente é obrigatório');
      return;
    }

    if (formData.subtotal_amount <= 0) {
      setValidationError('Subtotal deve ser maior que 0');
      return;
    }

    try {
      const selectedCustomer = customers.find(c => c.id === formData.customer_id);
      
      const budgetData = {
        ...formData,
        budget_number: formData.budget_number || generateBudgetNumber(),
        customer_name: selectedCustomer?.name,
        customer_email: selectedCustomer?.email,
      };

      if (editingId) {
        await updateBudget(editingId, budgetData);
        setEditingId(null);
      } else {
        await createBudget(budgetData);
      }

      setFormData(initialFormData);
      setPreviewImage(null);
    } catch (err) {
      setValidationError('Erro ao salvar orçamento');
      console.error('Erro:', err);
    }
  };

  const handleEdit = (budget: any) => {
    setFormData({
      title: budget.title || '',
      budget_number: budget.budget_number || '',
      customer_id: budget.customer_id || '',
      project_name: budget.project_name || '',
      project_details: budget.project_details || '',
      validity: budget.validity || '30 dias',
      delivery_deadline: budget.delivery_deadline || '20 dias',
      subtotal_amount: budget.subtotal_amount || 0,
      discount_percent: budget.discount_percent || 0,
      discount_amount: budget.discount_amount || 0,
      discount_type: budget.discount_type || 'fixed',
      final_amount: budget.final_amount || 0,
      payment_conditions: budget.payment_conditions || 'à vista',
      payment_methods: budget.payment_methods || [],
      drawing_url: budget.drawing_url || '',
      observations: budget.observations || '',
      status: budget.status || 'draft',
    });
    setPreviewImage(budget.drawing_url || null);
    setEditingId(budget.id);
    window.scrollTo(0, 0);
  };

  const handleCancel = () => {
    setFormData(initialFormData);
    setEditingId(null);
    setValidationError('');
    setPreviewImage(null);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Tem certeza que deseja deletar este orçamento?')) {
      try {
        await deleteBudget(id);
      } catch (err) {
        console.error('Erro ao deletar:', err);
      }
    }
  };

  if (loading) return <div className="p-4 text-center">Carregando...</div>;

  return (
    <div className="p-4 md:p-8 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800">📊 Orçamentos</h1>
      </div>

      {/* Error Messages */}
      {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">{error}</div>}
      {validationError && <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded mb-4">{validationError}</div>}

      {/* Form */}
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded shadow-md mb-8">
        <h2 className="text-2xl font-bold mb-6 text-gray-700">
          {editingId ? '✏️ Editar Orçamento' : '➕ Novo Orçamento'}
        </h2>

        {/* Row 1: Número, Título, Cliente */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div>
            <label className="block text-gray-700 font-semibold mb-2">Nº Orçamento</label>
            <input 
  type="text" 
  name="budget_number" 
  value={formData.budget_number || "Número auto-gerado"}
  readOnly 
  className="w-full bg-gray-100 border border-gray-300 rounded px-3 py-2"
/>

            <p className="text-xs text-gray-500 mt-1">Gerado automaticamente</p>
          </div>
          <div>
            <label className="block text-gray-700 font-semibold mb-2">Título *</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-blue-500"
              placeholder="Ex: Projeto Cliente XYZ"
            />
          </div>
          <div>
            <label className="block text-gray-700 font-semibold mb-2">Cliente *</label>
            <select
              name="customer_id"
              value={formData.customer_id}
              onChange={handleInputChange}
              className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-blue-500"
            >
              <option value="">Selecione um cliente</option>
              {customers.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Row 2: Nome Projeto, Detalhes */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-gray-700 font-semibold mb-2">Nome do Projeto</label>
            <input
              type="text"
              name="project_name"
              value={formData.project_name || ''}
              onChange={handleInputChange}
              className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-blue-500"
              placeholder="Ex: Reforma Cozinha"
            />
          </div>
          <div>
            <label className="block text-gray-700 font-semibold mb-2">Detalhes do Projeto</label>
            <input
              type="text"
              name="project_details"
              value={formData.project_details || ''}
              onChange={handleInputChange}
              className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-blue-500"
              placeholder="Descrição breve do projeto"
            />
          </div>
        </div>

        {/* Row 3: Upload Desenho */}
        <div className="mb-4 border-t pt-4">
          <label className="block text-gray-700 font-semibold mb-2">📐 Desenho/Imagem do Projeto</label>
          <div className="flex gap-4">
            <div className="flex-1">
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                disabled={uploadingImage}
                className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-blue-500"
              />
              <p className="text-xs text-gray-500 mt-1">Formatos: JPG, PNG, GIF (máx 5MB)</p>
            </div>
            {previewImage && (
              <button
                type="button"
                onClick={handleRemoveImage}
                className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 font-semibold"
              >
                🗑️ Remover
              </button>
            )}
          </div>

          {/* Preview Imagem */}
          {previewImage && (
            <div className="mt-4">
              <p className="text-gray-700 font-semibold mb-2">📸 Prévia:</p>
              <img
                src={previewImage}
                alt="Desenho projeto"
                className="max-w-sm max-h-64 rounded border border-gray-300"
              />
            </div>
          )}

          {uploadingImage && (
            <div className="mt-2 text-blue-600">⏳ Fazendo upload...</div>
          )}
        </div>

        {/* Row 4: Prazos */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-gray-700 font-semibold mb-2">Validade</label>
            <input
              type="text"
              name="validity"
              value={formData.validity || ''}
              onChange={handleInputChange}
              className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-blue-500"
              placeholder="Ex: 30 dias"
            />
          </div>
          <div>
            <label className="block text-gray-700 font-semibold mb-2">Prazo de Entrega</label>
            <input
              type="text"
              name="delivery_deadline"
              value={formData.delivery_deadline || ''}
              onChange={handleInputChange}
              className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-blue-500"
              placeholder="Ex: 20 dias"
            />
          </div>
        </div>

        {/* Row 5: Valores - Com Cálculo Automático */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4 border-t pt-4">
          <div>
            <label className="block text-gray-700 font-semibold mb-2">Subtotal (R$) *</label>
            <input
              type="number"
              name="subtotal_amount"
              value={formData.subtotal_amount}
              onChange={handleInputChange}
              min="0"
              step="0.01"
              className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-gray-700 font-semibold mb-2">Desconto (%)</label>
            <input
              type="number"
              name="discount_percent"
              value={formData.discount_percent}
              onChange={handleInputChange}
              min="0"
              max="100"
              step="0.01"
              className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-gray-700 font-semibold mb-2">Total Final (R$) 🔄</label>
            <input
              type="number"
              name="final_amount"
              value={formData.final_amount}
              readOnly
              className="w-full border border-gray-300 rounded px-3 py-2 bg-blue-50 font-bold text-blue-600 cursor-not-allowed"
            />
            <p className="text-xs text-blue-600 mt-1">Calculado automaticamente</p>
          </div>
        </div>

        {/* Row 6: Desconto Fixo */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-gray-700 font-semibold mb-2">Tipo de Desconto</label>
            <select
              name="discount_type"
              value={formData.discount_type || 'fixed'}
              onChange={handleInputChange}
              className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-blue-500"
            >
              <option value="fixed">Fixo (R$)</option>
              <option value="percent">Percentual (%)</option>
            </select>
          </div>
          <div>
            <label className="block text-gray-700 font-semibold mb-2">Valor Desconto (R$)</label>
            <input
              type="number"
              name="discount_amount"
              value={formData.discount_amount || 0}
              onChange={handleInputChange}
              min="0"
              step="0.01"
              className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-blue-500"
            />
          </div>
        </div>

        {/* Row 7: Condições de Pagamento */}
        <div className="mb-4 border-t pt-4">
          <label className="block text-gray-700 font-semibold mb-2">Condições de Pagamento</label>
          <select
            name="payment_conditions"
            value={formData.payment_conditions || 'à vista'}
            onChange={handleInputChange}
            className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-blue-500"
          >
            <option value="à vista">À Vista</option>
            <option value="sinal + saldo">Sinal + Saldo</option>
            <option value="3 parcelas">3 Parcelas</option>
            <option value="6 parcelas">6 Parcelas</option>
            <option value="à combinar">À Combinar</option>
          </select>
        </div>

        {/* Row 8: Meios de Pagamento */}
        <div className="mb-4">
          <label className="block text-gray-700 font-semibold mb-2">Meios de Pagamento</label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {paymentMethodOptions.map(method => (
              <label key={method.value} className="flex items-center">
                <input
                  type="checkbox"
                  checked={(formData.payment_methods || []).includes(method.value)}
                  onChange={() => handlePaymentMethodChange(method.value)}
                  className="mr-2 w-4 h-4"
                />
                <span className="text-gray-700">{method.label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Row 9: Observações */}
        <div className="mb-4 border-t pt-4">
          <label className="block text-gray-700 font-semibold mb-2">Observações</label>
          <textarea
            name="observations"
            value={formData.observations || ''}
            onChange={handleInputChange}
            rows={3}
            className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-blue-500"
            placeholder="Anotações adicionais..."
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
              ❌ Cancelar
            </button>
          )}
        </div>
      </form>

      {/* Table */}
      <div className="bg-white rounded shadow-md overflow-x-auto">
        <table className="w-full border-collapse">
          <thead className="bg-gray-200">
            <tr>
              <th className="border border-gray-300 px-4 py-2 text-left">Nº</th>
              <th className="border border-gray-300 px-4 py-2 text-left">Título</th>
              <th className="border border-gray-300 px-4 py-2 text-left">Cliente</th>
              <th className="border border-gray-300 px-4 py-2 text-left">Subtotal</th>
              <th className="border border-gray-300 px-4 py-2 text-left">Desconto</th>
              <th className="border border-gray-300 px-4 py-2 text-left">Total</th>
              <th className="border border-gray-300 px-4 py-2 text-left">Desenho</th>
              <th className="border border-gray-300 px-4 py-2 text-left">Status</th>
              <th className="border border-gray-300 px-4 py-2 text-center">Ações</th>
            </tr>
          </thead>
          <tbody>
            {budgets.length === 0 ? (
              <tr>
                <td colSpan={9} className="text-center py-8 text-gray-500">
                  Nenhum orçamento cadastrado
                </td>
              </tr>
            ) : (
              budgets.map((budget: any) => (
                <tr key={budget.id} className="hover:bg-gray-100">
                  <td className="border border-gray-300 px-4 py-2 font-bold text-blue-600">{budget.budget_number || '-'}</td>
                  <td className="border border-gray-300 px-4 py-2">{budget.title}</td>
                  <td className="border border-gray-300 px-4 py-2">
                    {budget.customer_id ? customers.find((c) => c.id === budget.customer_id)?.name || 'Cliente não encontrado' : '-'}
                  </td>
                  <td className="border border-gray-300 px-4 py-2">{formatCurrency(budget.subtotal_amount || 0)}</td>
                  <td className="border border-gray-300 px-4 py-2">{budget.discount_percent}%</td>
                  <td className="border border-gray-300 px-4 py-2 font-bold text-blue-600">{formatCurrency(budget.final_amount || 0)}</td>
                  <td className="border border-gray-300 px-4 py-2 text-center">
                    {budget.drawing_url ? (
                      <button
                        onClick={() => window.open(budget.drawing_url, '_blank')}
                        className="text-blue-600 hover:text-blue-800 font-semibold"
                      >
                        📸 Ver
                      </button>
                    ) : (
                      <span className="text-gray-500">-</span>
                    )}
                  </td>
                  <td className="border border-gray-300 px-4 py-2">
                    <span className={`px-2 py-1 rounded text-sm ${
                      budget.status === 'draft' ? 'bg-yellow-100 text-yellow-800' :
                      budget.status === 'approved' ? 'bg-green-100 text-green-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {budget.status === 'draft' && 'Rascunho'}
                      {budget.status === 'approved' && 'Aprovado'}
                      {budget.status === 'rejected' && 'Rejeitado'}
                    </span>
                  </td>
                  <td className="border border-gray-300 px-4 py-2 text-center">
                    <button
                      onClick={() => handleEdit(budget)}
                      className="bg-yellow-500 text-white px-3 py-1 rounded text-sm hover:bg-yellow-600 mr-2"
                    >
                      ✏️ Editar
                    </button>
                    <button
                      onClick={() => handleDelete(budget.id)}
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