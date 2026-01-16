import { useState, useEffect } from 'react';
import { authenticatedFetch } from '../lib/api';

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

  // Buscar orçamentos
  const fetchBudgets = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await authenticatedFetch(API_URL);
      setBudgets(data);
    } catch (err) {
      setError('Erro ao carregar orçamentos');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Criar orçamento
  const createBudget = async (budget: Omit<Budget, 'id'>) => {
    try {
      const newBudget = await authenticatedFetch(API_URL, {
        method: 'POST',
        body: JSON.stringify(budget),
      });
      setBudgets([...budgets, newBudget]);
      return newBudget;
    } catch (err) {
      setError('Erro ao criar orçamento');
      console.error(err);
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
      return updatedBudget;
    } catch (err) {
      setError('Erro ao editar orçamento');
      console.error(err);
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
    } catch (err) {
      setError('Erro ao deletar orçamento');
      console.error(err);
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
