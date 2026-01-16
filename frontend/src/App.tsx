import { BrowserRouter, Routes, Route, Link, useLocation } from 'react-router-dom';
import { useState } from 'react';
import Dashboard from './pages/Dashboard';
import Customers from './pages/Customers';
import Budgets from './pages/Budgets';
import Settings from './pages/Settings';
import './index.css';

function App() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  const menuItems = [
    { path: '/dashboard', label: 'Dashboard', icon: '📊' },
    { path: '/customers', label: 'Clientes', icon: '👥' },
    { path: '/budgets', label: 'Orçamentos', icon: '📋' },
    { path: '/settings', label: 'Configurações', icon: '⚙️' },
  ];

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <aside
        className={`${
          sidebarOpen ? 'w-64' : 'w-20'
        } bg-gradient-to-b from-gray-900 to-gray-800 text-white transition-all duration-300 shadow-lg`}
      >
        {/* Logo */}
        <div className="p-4 border-b border-gray-700">
          <Link to="/dashboard" className="flex items-center gap-3 text-xl font-bold hover:opacity-80 transition">
            <span className="text-3xl">🪵</span>
            {sidebarOpen && <span>Marcenaria</span>}
          </Link>
        </div>

        {/* Menu */}
        <nav className="p-4 space-y-2">
          {menuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition ${
                isActive(item.path)
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-300 hover:bg-gray-700'
              }`}
            >
              <span className="text-xl">{item.icon}</span>
              {sidebarOpen && <span>{item.label}</span>}
            </Link>
          ))}
        </nav>

        {/* Toggle Button */}
        <div className="absolute bottom-4 left-4">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 rounded-lg bg-gray-700 hover:bg-gray-600 transition"
            title={sidebarOpen ? 'Recolher' : 'Expandir'}
          >
            {sidebarOpen ? '◀' : '▶'}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white shadow-sm border-b">
          <div className="px-6 py-4 flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-800">
              {menuItems.find((item) => isActive(item.path))?.label || 'Dashboard'}
            </h1>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">
                👋 Bem-vindo ao seu sistema!
              </span>
              <button
                onClick={() => alert('Função de logout será implementada em breve!')}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition text-sm"
              >
                Sair
              </button>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto">
          <Routes>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/customers" element={<Customers />} />
            <Route path="/budgets" element={<Budgets />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/" element={<Dashboard />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}

function AppWrapper() {
  return (
    <BrowserRouter>
      <App />
    </BrowserRouter>
  );
}

export default AppWrapper;
