import { useState, useEffect } from 'react';

interface Customer {
  id: string;
  name: string;
  email?: string;
  phone?: string;
}

export function useCustomers() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:8000/api/customers');
      if (!response.ok) throw new Error('Erro ao buscar clientes');
      const data = await response.json();
      setCustomers(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
    } finally {
      setLoading(false);
    }
  };

  const createCustomer = async (name: string, email?: string) => {
    try {
      const response = await fetch('http://localhost:8000/api/customers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email }),
      });
      if (!response.ok) throw new Error('Erro ao criar cliente');
      await fetchCustomers(); // Recarrega lista
    } catch (err) {
      throw err;
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  return { customers, loading, error, refetch: fetchCustomers, createCustomer };
}
