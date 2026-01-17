import { useState, useEffect } from 'react';
import { authenticatedFetch } from '../lib/api';
import { useToast } from '../components/Toast';

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
  const toast = useToast();

  // Buscar clientes
  const fetchCustomers = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await authenticatedFetch(API_URL);
      setCustomers(data);
    } catch (err: any) {
      const errorMsg = err.message || 'Erro ao carregar clientes';
      setError(errorMsg);
      toast.error(`❌ ${errorMsg}`);
      console.error('Erro ao buscar clientes:', err);
    } finally {
      setLoading(false);
    }
  };

  // Criar cliente
  const createCustomer = async (customer: Omit<Customer, 'id'>) => {
    try {
      const newCustomer = await authenticatedFetch(API_URL, {
        method: 'POST',
        body: JSON.stringify(customer),
      });
      setCustomers([...customers, newCustomer]);
      toast.success(`✅ Cliente "${customer.name}" criado com sucesso!`);
      return newCustomer;
    } catch (err: any) {
      const errorMsg = err.message || 'Erro ao criar cliente';
      setError(errorMsg);
      toast.error(`❌ ${errorMsg}`);
      console.error('Erro ao criar cliente:', err);
      throw err;
    }
  };

  // Editar cliente
  const updateCustomer = async (id: string, customer: Omit<Customer, 'id'>) => {
    try {
      const updatedCustomer = await authenticatedFetch(`${API_URL}/${id}`, {
        method: 'PUT',
        body: JSON.stringify(customer),
      });
      setCustomers(customers.map(c => c.id === id ? updatedCustomer : c));
      toast.success(`✅ Cliente "${customer.name}" atualizado com sucesso!`);
      return updatedCustomer;
    } catch (err: any) {
      const errorMsg = err.message || 'Erro ao editar cliente';
      setError(errorMsg);
      toast.error(`❌ ${errorMsg}`);
      console.error('Erro ao editar cliente:', err);
      throw err;
    }
  };

  // Deletar cliente
  const deleteCustomer = async (id: string) => {
    try {
      await authenticatedFetch(`${API_URL}/${id}`, {
        method: 'DELETE',
      });
      setCustomers(customers.filter(c => c.id !== id));
      toast.success('✅ Cliente deletado com sucesso!');
    } catch (err: any) {
      const errorMsg = err.message || 'Erro ao deletar cliente';
      setError(errorMsg);
      toast.error(`❌ ${errorMsg}`);
      console.error('Erro ao deletar cliente:', err);
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