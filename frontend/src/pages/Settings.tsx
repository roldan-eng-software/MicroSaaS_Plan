import { useState, useEffect } from 'react';

interface CompanyData {
  name: string;
  email: string;
  phone: string;
  address: string;
}

export default function Settings() {
  const [companyData, setCompanyData] = useState<CompanyData>({
    name: 'Marcenaria MDF',
    email: 'contato@marcenariasmdf.com.br',
    phone: '(11) 9999-9999',
    address: 'São Paulo, SP',
  });

  const [isSaved, setIsSaved] = useState(false);

  // Carregar dados do localStorage
  useEffect(() => {
    const saved = localStorage.getItem('companyData');
    if (saved) {
      setCompanyData(JSON.parse(saved));
    }
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem('companyData', JSON.stringify(companyData));
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCompanyData({ ...companyData, [name]: value });
  };

  const systemInfo = [
    { label: 'Nome do Projeto', value: '🪵 Marcenaria MDF' },
    { label: 'Versão', value: '1.0.0' },
    { label: 'Ambiente', value: 'Desenvolvimento' },
    { label: 'Backend', value: 'http://localhost:8000' },
    { label: 'Frontend', value: 'http://localhost:5173' },
    { label: 'Framework Backend', value: 'FastAPI (Python)' },
    { label: 'Framework Frontend', value: 'React + Vite + TypeScript' },
    { label: 'Estilização', value: 'Tailwind CSS v3' },
  ];

  return (
    <div className="p-6 space-y-6 max-w-4xl">
      <h1 className="text-3xl font-bold">⚙️ Configurações</h1>

      {/* Dados da Empresa */}
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow space-y-4">
        <h2 className="text-xl font-semibold">📍 Dados da Empresa</h2>

        <input
          type="text"
          name="name"
          placeholder="Nome da Empresa"
          value={companyData.name}
          onChange={handleChange}
          className="w-full px-4 py-2 border rounded"
        />

        <input
          type="email"
          name="email"
          placeholder="Email"
          value={companyData.email}
          onChange={handleChange}
          className="w-full px-4 py-2 border rounded"
        />

        <input
          type="tel"
          name="phone"
          placeholder="Telefone"
          value={companyData.phone}
          onChange={handleChange}
          className="w-full px-4 py-2 border rounded"
        />

        <input
          type="text"
          name="address"
          placeholder="Endereço"
          value={companyData.address}
          onChange={handleChange}
          className="w-full px-4 py-2 border rounded"
        />

        <button
          type="submit"
          className="w-full bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          💾 Salvar Configurações
        </button>

        {isSaved && (
          <div className="bg-green-100 text-green-700 p-3 rounded text-center">
            ✅ Configurações salvas com sucesso!
          </div>
        )}
      </form>

      {/* Informações do Sistema */}
      <div className="bg-white p-6 rounded-lg shadow space-y-4">
        <h2 className="text-xl font-semibold">🖥️ Informações do Sistema</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {systemInfo.map((info, index) => (
            <div key={index} className="p-4 border rounded bg-gray-50">
              <p className="text-sm text-gray-600 font-medium">{info.label}</p>
              <p className="text-lg font-semibold text-gray-800 mt-1">{info.value}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Armazenamento Local */}
      <div className="bg-blue-50 p-6 rounded-lg border-l-4 border-blue-500">
        <h3 className="font-semibold text-blue-900 mb-2">💾 Armazenamento de Dados</h3>
        <p className="text-sm text-blue-800">
          Os dados de clientes e orçamentos são armazenados em memória no backend. 
          Ao reiniciar o servidor, os dados serão perdidos. Para persistência permanente, 
          considere integrar um banco de dados (PostgreSQL, MongoDB, etc).
        </p>
      </div>

      {/* Roadmap */}
      <div className="bg-purple-50 p-6 rounded-lg border-l-4 border-purple-500">
        <h3 className="font-semibold text-purple-900 mb-3">🚀 Próximos Passos</h3>
        <ul className="space-y-2 text-sm text-purple-800">
          <li>✅ CRUD de Clientes</li>
          <li>✅ CRUD de Orçamentos</li>
          <li>✅ Dashboard Dinâmico</li>
          <li>⬜ Integração com Banco de Dados</li>
          <li>⬜ Autenticação de Usuários</li>
          <li>⬜ Relatórios e Exportação (PDF/Excel)</li>
          <li>⬜ Notificações e Alertas</li>
        </ul>
      </div>
    </div>
  );
}
