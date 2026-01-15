import { useState, useEffect } from 'react';

interface Customer {
  id: string;
  name: string;
  email?: string;
  phone?: string;
}

interface Budget {
  id: string;
  title: string;
  customer_id?: string;
  subtotal_amount: number;
  discount_percent: number;
  final_amount: number;
  status: string;
}

function App() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [loading, setLoading] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const [customersRes, budgetsRes] = await Promise.all([
        fetch('http://localhost:8000/api/customers'),
        fetch('http://localhost:8000/api/budgets')
      ]);
      setCustomers(await customersRes.json());
      setBudgets(await budgetsRes.json());
    } catch (error) {
      console.error('Erro:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const createCustomer = async () => {
    const name = prompt('Nome do cliente:');
    if (name) {
      await fetch('http://localhost:8000/api/customers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: 'c' + Date.now(),
          name,
          email: 'cliente@test.com'
        })
      });
      loadData();
    }
  };

  const createBudget = async () => {
    const title = prompt('Título do orçamento:');
    if (title) {
      await fetch('http://localhost:8000/api/budgets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: 'b' + Date.now(),
          title,
          customer_id: customers[0]?.id,
          subtotal_amount: 1500.00,
          discount_percent: 10,
          final_amount: 1350.00,
          status: 'draft'
        })
      });
      loadData();
    }
  };

  return (
    <div style={{padding: '20px', maxWidth: '1200px', margin: '0 auto'}}>
      <h1>🪵 MicroSaaS Marcenaria MDF</h1>
      
      <div style={{display: 'flex', gap: '20px', marginBottom: '30px'}}>
        <button onClick={createCustomer} style={{padding: '10px 20px', fontSize: '16px'}}>
          ➕ Novo Cliente
        </button>
        <button onClick={createBudget} style={{padding: '10px 20px', fontSize: '16px'}}>
          ➕ Novo Orçamento
        </button>
        <button onClick={loadData} disabled={loading} style={{padding: '10px 20px'}}>
          🔄 Atualizar
        </button>
      </div>

      {loading && <p>Carregando...</p>}

      <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px'}}>
        {/* Clientes */}
        <div>
          <h2>👥 Clientes ({customers.length})</h2>
          <div style={{border: '1px solid #ddd', borderRadius: '8px', padding: '15px'}}>
            {customers.map(customer => (
              <div key={customer.id} style={{
                padding: '10px', 
                borderBottom: '1px solid #eee',
                display: 'flex',
                justifyContent: 'space-between'
              }}>
                <div>
                  <strong>{customer.name}</strong>
                  {customer.email && <p>{customer.email}</p>}
                </div>
                <small>ID: {customer.id}</small>
              </div>
            ))}
          </div>
        </div>

        {/* Orçamentos */}
        <div>
          <h2>📋 Orçamentos ({budgets.length})</h2>
          <div style={{border: '1px solid #ddd', borderRadius: '8px', padding: '15px'}}>
            {budgets.map(budget => (
              <div key={budget.id} style={{
                padding: '10px', 
                borderBottom: '1px solid #eee',
                display: 'flex',
                justifyContent: 'space-between'
              }}>
                <div>
                  <strong>{budget.title}</strong>
                  <p>R$ {budget.final_amount.toLocaleString('pt-BR', {minimumFractionDigits: 2})}</p>
                  <span style={{background: '#e3f2fd', padding: '2px 8px', borderRadius: '12px', fontSize: '12px'}}>
                    {budget.status}
                  </span>
                </div>
                <small>ID: {budget.id}</small>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
