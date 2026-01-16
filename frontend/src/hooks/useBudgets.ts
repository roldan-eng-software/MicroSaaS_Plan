import { useState, useEffect } from 'react';

interface Budget {
  id: string;
  title: string;
  customer_id?: string;
  subtotal_amount: number;
  discount_percent: number;
  final_amount: number;
  status: string;
}

export function useBudgets() {
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchBudgets = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:8000/api/budgets');
      if (!response.ok) throw new Error('Erro ao buscar orçamentos');
      const data = await response.json();
      setBudgets(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
    } finally {
      setLoading(false);
    }
  };

  const createBudget = async (title: string, subtotal: number = 0, customerId?: string) => {
    try {
      const response = await fetch('http://localhost:8000/api/budgets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          title, 
          customer_id: customerId || null,
          subtotal_amount: subtotal,
          discount_percent: 0,
          final_amount: subtotal,
          status: 'draft' 
        }),
      });
      if (!response.ok) throw new Error('Erro ao criar orçamento');
      await fetchBudgets();
    } catch (err) {
      throw err;
    }
  };

  useEffect(() => {
    fetchBudgets();
  }, []);

  return { budgets, loading, error, refetch: fetchBudgets, createBudget };
}
