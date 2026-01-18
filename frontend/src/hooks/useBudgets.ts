import { useState, useEffect } from 'react';
import { authenticatedFetch } from '../lib/api';
import { useEmailJS } from './useEmailJS';
import { useToast } from '../components/Toast';

const API_URL = 'http://localhost:8000/api/budgets';

interface Budget {
  id: string;
  title: string;
  customer_id?: string;
  subtotal_amount: number;
  discount_percent: number;
  final_amount: number;
  status?: string;
  created_at?: string;
}

export function useBudgets() {
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { sendBudgetConfirmationEmail } = useEmailJS();
  const toast = useToast();

  // Buscar orçamentos
  const fetchBudgets = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await authenticatedFetch(API_URL);
      setBudgets(data);
    } catch (err: any) {
      const errorMsg = err.message || 'Erro ao carregar orçamentos';
      setError(errorMsg);
      toast.error(`❌ ${errorMsg}`);
      console.error('Erro ao buscar orçamentos:', err);
    } finally {
      setLoading(false);
    }
  };

  // Criar orçamento
  const createBudget = async (budget: Omit<Budget, 'id'> & { customer_email?: string; customer_name?: string }) => {
    try {
      const newBudget = await authenticatedFetch(API_URL, {
        method: 'POST',
        body: JSON.stringify(budget),
      });
      setBudgets([...budgets, newBudget]);
      toast.success(`✅ Orçamento "${budget.title}" criado com sucesso!`);

      // ✅ Enviar email de confirmação
      if (budget.customer_email && budget.customer_name) {
        try {
          await sendBudgetConfirmationEmail(
            budget.customer_email,
            budget.customer_name,
            budget.title,
            newBudget.final_amount,
            newBudget.id
          );
          toast.success('📧 Email de confirmação enviado!');
          console.log('Email de confirmação enviado com sucesso!');
        } catch (emailError: any) {
          console.error('Erro ao enviar email:', emailError);
          toast.warning('⚠️ Orçamento criado, mas erro ao enviar email');
        }
      }

      return newBudget;
    } catch (err: any) {
      const errorMsg = err.message || 'Erro ao criar orçamento';
      setError(errorMsg);
      toast.error(`❌ ${errorMsg}`);
      console.error('Erro ao criar orçamento:', err);
      throw err;
    }
  };

  // Editar orçamento
  const updateBudget = async (id: string, budget: Omit<Budget, 'id'>) => {
    try {
      const updatedBudget = await authenticatedFetch(`${API_URL}/${id}`, {
        method: 'PUT',
        body: JSON.stringify(budget),
      });
      setBudgets(budgets.map(b => b.id === id ? updatedBudget : b));
      toast.success(`✅ Orçamento "${budget.title}" atualizado com sucesso!`);
      return updatedBudget;
    } catch (err: any) {
      const errorMsg = err.message || 'Erro ao editar orçamento';
      setError(errorMsg);
      toast.error(`❌ ${errorMsg}`);
      console.error('Erro ao editar orçamento:', err);
      throw err;
    }
  };

  // Deletar orçamento
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

  // Carregar orçamentos na montagem
  useEffect(() => {
    fetchBudgets();
  }, []);

  return {
    budgets,
    loading,
    error,
    fetchBudgets,
    createBudget,
    updateBudget,
    deleteBudget,
  };
}