import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export default function Login() {
  const navigate = useNavigate();
  const { signIn, signUp, error: authError, loading } = useAuth();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    if (!email.trim() || !password.trim()) {
      setError('Email e senha são obrigatórios');
      return;
    }

    if (password.length < 6) {
      setError('Senha deve ter pelo menos 6 caracteres');
      return;
    }

    try {
      if (isSignUp) {
        await signUp(email, password);
        setSuccess(true);
        setEmail('');
        setPassword('');
        setTimeout(() => {
          setIsSignUp(false);
          setSuccess(false);
        }, 2000);
      } else {
        await signIn(email, password);
        navigate('/dashboard');
      }
    } catch (err: any) {
      setError(err.message || 'Erro ao autenticar');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-2xl p-8 w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="text-5xl mb-4">🪵</div>
          <h1 className="text-3xl font-bold text-gray-800">Marcenaria MDF</h1>
          <p className="text-gray-600 mt-2">Gerenciador de Orçamentos</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-4 mb-6 border-b">
          <button
            onClick={() => {
              setIsSignUp(false);
              setError(null);
              setSuccess(false);
            }}
            className={`flex-1 py-3 font-semibold transition ${
              !isSignUp
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-500'
            }`}
          >
            Login
          </button>
          <button
            onClick={() => {
              setIsSignUp(true);
              setError(null);
              setSuccess(false);
            }}
            className={`flex-1 py-3 font-semibold transition ${
              isSignUp
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-500'
            }`}
          >
            Registrar
          </button>
        </div>

        {/* Formulário */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="seu@email.com"
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
              disabled={loading}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Senha
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
              disabled={loading}
            />
          </div>

          {/* Mensagens de Erro */}
          {(error || authError) && (
            <div className="bg-red-100 text-red-700 p-4 rounded-lg text-sm">
              ❌ {error || authError}
            </div>
          )}

          {/* Mensagem de Sucesso */}
          {success && (
            <div className="bg-green-100 text-green-700 p-4 rounded-lg text-sm">
              ✅ Conta criada com sucesso! Fazendo login...
            </div>
          )}

          {/* Botão Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white font-semibold py-2 rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
          >
            {loading ? 'Carregando...' : isSignUp ? 'Criar Conta' : 'Entrar'}
          </button>
        </form>

        {/* Informações */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg text-sm text-gray-700">
          <p className="font-semibold mb-2">👤 Dados de Teste:</p>
          <p>Email: <code className="bg-gray-200 px-2 py-1 rounded">teste@example.com</code></p>
          <p>Senha: <code className="bg-gray-200 px-2 py-1 rounded">123456</code></p>
          <p className="text-xs text-gray-600 mt-2">Crie uma nova conta ou use os dados acima para testar</p>
        </div>
      </div>
    </div>
  );
}
