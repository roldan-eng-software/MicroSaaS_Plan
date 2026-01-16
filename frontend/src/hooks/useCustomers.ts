import { useState, useEffect } from 'react';

const API_URL = 'http://localhost:8000/api/customers';

interface Customer {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  created_at?: string;
}


export function useCustomers() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Buscar clientes
  const fetchCustomers = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(API_URL);
      const data = await response.json();
      setCustomers(data);
    } catch (err) {
      setError('Erro ao carregar clientes');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Criar cliente
  const createCustomer = async (customer: Omit<Customer, 'id'>) => {
    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(customer),
      });
      const newCustomer = await response.json();
      setCustomers([...customers, newCustomer]);
      return newCustomer;
    } catch (err) {
      setError('Erro ao criar cliente');
      console.error(err);
      throw err;
    }
  };

  // Editar cliente
  const updateCustomer = async (id: string, customer: Omit<Customer, 'id'>) => {
    try {
      const response = await fetch(`${API_URL}/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(customer),
      });
      const updatedCustomer = await response.json();
      setCustomers(customers.map(c => c.id === id ? updatedCustomer : c));
      return updatedCustomer;
    } catch (err) {
      setError('Erro ao editar cliente');
      console.error(err);
      throw err;
    }
  };

  // Deletar cliente
  const deleteCustomer = async (id: string) => {
    try {
      await fetch(`${API_URL}/${id}`, {
        method: 'DELETE',
      });
      setCustomers(customers.filter(c => c.id !== id));
    } catch (err) {
      setError('Erro ao deletar cliente');
      console.error(err);
      throw err;
    }
  };

  // Carregar clientes na montagem
  useEffect(() => {
    fetchCustomers();
  }, []);

  return {
    customers,
    loading,
    error,
    fetchCustomers,
    createCustomer,
    updateCustomer,
    deleteCustomer,
  };
}
