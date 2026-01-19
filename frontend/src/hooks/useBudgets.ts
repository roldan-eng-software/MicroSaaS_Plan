import { useState, useEffect } from 'react';
import { authenticatedFetch } from '../lib/api';
import { useEmailJS } from './useEmailJS';
import { useToast } from '../components/Toast';

const API_URL = 'http://localhost:8000/api/budgets';

// ==================== TIPOS ====================

interface BudgetItem {
  id?: string;
  description: string;
  unit_type: 'metro' | 'unidade';
  quantity: number;
  unit_price: number;
  total_price: number;
  order_index?: number;
}

interface Budget {
  id: string;
  title: string;
  customer_id?: string;
  project_name?: string;
  project_details?: string;
  validity?: string;
  delivery_deadline?: string;
  subtotal_amount: number;
  discount_percent?: number;
  discount_amount?: number;
  discount_type?: 'fixed' | 'percent';
  final_amount: number;
  payment_conditions?: string;
  payment_methods?: string[];
  drawing_url?: string;
  observations?: string;
  status?: string;
  items?: BudgetItem[];
  created_at?: string;
  customer_email?: string;
  customer_name?: string;
}

// ==================== HOOK ====================

export function useBudgets() {
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { sendBudgetConfirmationEmail } = useEmailJS();
  const toast = useToast();

  // ==================== BUSCAR ORÇAMENTOS ====================

  const fetchBudgets = async () => {
    setLoading(true);
    try {
      const data = await authenticatedFetch(API_URL);
      console.log("Orçamentos recebidos:", data);  // ← ADICIONE
      setBudgets(data);
    } catch (err) {
      console.error("Erro fetch budgets:", err);
    } finally {
      setLoading(false);
    }
  };
  

  // ==================== CRIAR ORÇAMENTO ====================

  const createBudget = async (budget: Omit<Budget, 'id' | 'created_at'>) => {
    try {
      const newBudget = await authenticatedFetch(API_URL, {
        method: 'POST',
        body: JSON.stringify(budget),
      });

      setBudgets([...budgets, newBudget]);
      toast.success(`✅ Orçamento "${budget.project_name || budget.title}" criado com sucesso!`);

      return newBudget;
    } catch (err: any) {
      const errorMsg = err.message || 'Erro ao criar orçamento';
      setError(errorMsg);
      toast.error(`❌ ${errorMsg}`);
      console.error('Erro ao criar orçamento:', err);
      throw err;
    }
  };

  // ==================== ATUALIZAR ORÇAMENTO ====================

  const updateBudget = async (id: string, budget: Omit<Budget, 'id' | 'created_at'>) => {
    try {
      const updatedBudget = await authenticatedFetch(`${API_URL}/${id}`, {
        method: 'PUT',
        body: JSON.stringify(budget),
      });

      setBudgets(budgets.map(b => b.id === id ? updatedBudget : b));
      toast.success(`✅ Orçamento "${budget.project_name || budget.title}" atualizado com sucesso!`);

      return updatedBudget;
    } catch (err: any) {
      const errorMsg = err.message || 'Erro ao editar orçamento';
      setError(errorMsg);
      toast.error(`❌ ${errorMsg}`);
      console.error('Erro ao editar orçamento:', err);
      throw err;
    }
  };

  // ==================== DELETAR ORÇAMENTO ====================

  const deleteBudget = async (id: string) => {
    try {
      await authenticatedFetch(`${API_URL}/${id}`, {
        method: 'DELETE',
      });

      setBudgets(budgets.filter(b => b.id !== id));
      toast.success('✅ Orçamento deletado com sucesso!');
    } catch (err: any) {
      const errorMsg = err.message || 'Erro ao deletar orçamento';
      setError(errorMsg);
      toast.error(`❌ ${errorMsg}`);
      console.error('Erro ao deletar orçamento:', err);
      throw err;
    }
  };

  // ==================== UPLOAD DE DESENHO ====================

  const uploadDrawing = async (budgetId: string, file: File): Promise<string> => {
    try {
      const token = localStorage.getItem('access_token');
      if (!token) {
        throw new Error('Token não encontrado');
      }

      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch(`${API_URL}/${budgetId}/upload-drawing`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Erro ao fazer upload da imagem');
      }

      const data = await response.json();
      toast.success('✅ Imagem do desenho enviada com sucesso!');
      return data.url || data.drawing_url;
    } catch (err: any) {
      const errorMsg = err.message || 'Erro ao fazer upload';
      toast.error(`❌ ${errorMsg}`);
      console.error('Erro ao fazer upload:', err);
      throw err;
    }
  };

  // ==================== FUNÇÕES AUXILIARES ====================

  /**
   * Calcula o subtotal de um array de itens
   */
  const calculateSubtotal = (items: BudgetItem[]): number => {
    return items.reduce((sum, item) => sum + (item.total_price || 0), 0);
  };

  /**
   * Calcula o total final com desconto
   */
  const calculateFinalAmount = (
    subtotal: number,
    discountAmount: number,
    discountType: 'fixed' | 'percent' = 'fixed'
  ): number => {
    if (discountType === 'percent') {
      const discountValue = (subtotal * discountAmount) / 100;
      return Math.max(0, subtotal - discountValue);
    }
    return Math.max(0, subtotal - discountAmount);
  };

  /**
   * Calcula o preço total de um item
   */
  const calculateItemTotal = (quantity: number, unitPrice: number): number => {
    return quantity * unitPrice;
  };

  // ==================== USEEFFECT ====================

  useEffect(() => {
    fetchBudgets();
  }, []);

  // ==================== RETORNO ====================

  return {
    budgets,
    loading,
    error,
    fetchBudgets,
    createBudget,
    updateBudget,
    deleteBudget,
    uploadDrawing,
    calculateSubtotal,
    calculateFinalAmount,
    calculateItemTotal,
  };
}