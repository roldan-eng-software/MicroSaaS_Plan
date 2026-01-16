import { BrowserRouter as Router, Routes, Route, NavLink } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import Customers from './pages/Customers';
import Budgets from './pages/Budgets';
import Settings from './pages/Settings';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
        {/* Header */}
        <header className="bg-white shadow-sm border-b border-slate-200 sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-slate-900 rounded-lg flex items-center justify-center shadow-md">
                  <span className="text-white font-bold text-lg">🪵</span>
                </div>
                <div>
                  <h1 className="text-xl font-bold text-slate-900">Marcenaria MDF</h1>
                  <p className="text-xs text-slate-500 font-medium">Painel Administrativo</p>
                </div>
              </div>
              <div className="hidden md:block text-sm text-slate-500">
                Bem-vindo ao sistema
              </div>
            </div>
          </div>
        </header>

        <div className="flex">
          {/* Sidebar */}
          <aside className="w-64 bg-white border-r border-slate-200 shadow-sm h-screen-minus-header fixed left-0 top-16 z-40">
            <nav className="p-6 space-y-2">
              <NavLink 
                to="/dashboard" 
                className={({ isActive }) =>
                  `flex items-center px-4 py-3 rounded-xl font-medium text-sm transition-all duration-200 ${
                    isActive
                      ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-500 shadow-md'
                      : 'text-slate-700 hover:bg-slate-50 hover:text-slate-900 hover:shadow-sm'
                  }`
                }
              >
                <span className="w-5 mr-3">📊</span>
                Dashboard
              </NavLink>
              
              <NavLink 
                to="/customers" 
                className={({ isActive }) =>
                  `flex items-center px-4 py-3 rounded-xl font-medium text-sm transition-all duration-200 ${
                    isActive
                      ? 'bg-emerald-50 text-emerald-700 border-r-2 border-emerald-500 shadow-md'
                      : 'text-slate-700 hover:bg-slate-50 hover:text-slate-900 hover:shadow-sm'
                  }`
                }
              >
                <span className="w-5 mr-3">👥</span>
                Clientes
              </NavLink>

              <NavLink 
                to="/budgets" 
                className={({ isActive }) =>
                  `flex items-center px-4 py-3 rounded-xl font-medium text-sm transition-all duration-200 ${
                    isActive
                      ? 'bg-orange-50 text-orange-700 border-r-2 border-orange-500 shadow-md'
                      : 'text-slate-700 hover:bg-slate-50 hover:text-slate-900 hover:shadow-sm'
                  }`
                }
              >
                <span className="w-5 mr-3">💰</span>
                Orçamentos
              </NavLink>

              <NavLink 
                to="/settings" 
                className={({ isActive }) =>
                  `flex items-center px-4 py-3 rounded-xl font-medium text-sm transition-all duration-200 ${
                    isActive
                      ? 'bg-purple-50 text-purple-700 border-r-2 border-purple-500 shadow-md'
                      : 'text-slate-700 hover:bg-slate-50 hover:text-slate-900 hover:shadow-sm'
                  }`
                }
              >
                <span className="w-5 mr-3">⚙️</span>
                Configurações
              </NavLink>
            </nav>
          </aside>

          {/* Main Content */}
          <main className="ml-64 p-8 flex-1 min-h-screen">
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
    </Router>
  );
}

export default App;
