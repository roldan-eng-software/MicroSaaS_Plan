import React from 'react';

interface Props {
  children: React.ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

/**
 * Error Boundary Component
 * Captura erros em qualquer componente filho e exibe uma UI amigável
 */
export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('❌ ERRO CAPTURADO PELO ERROR BOUNDARY:', error);
    console.error('Info:', errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-red-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full">
            {/* Ícone de Erro */}
            <div className="text-center mb-6">
              <div className="text-6xl mb-4">⚠️</div>
              <h1 className="text-2xl font-bold text-red-600">Oops! Algo deu errado</h1>
            </div>

            {/* Mensagem de Erro */}
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
              <p className="font-semibold text-sm">Detalhes do Erro:</p>
              <p className="text-xs mt-2 font-mono break-words">
                {this.state.error?.message || 'Erro desconhecido'}
              </p>
            </div>

            {/* Mensagem Amigável */}
            <p className="text-gray-600 text-center mb-6">
              Uma situação inesperada ocorreu. Tente recarregar a página ou entrar em contato com suporte.
            </p>

            {/* Botões de Ação */}
            <div className="flex gap-3">
              <button
                onClick={this.handleReset}
                className="flex-1 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition font-semibold"
              >
                🔄 Tentar Novamente
              </button>
              <button
                onClick={() => window.location.href = '/'}
                className="flex-1 bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700 transition font-semibold"
              >
                🏠 Voltar ao Início
              </button>
            </div>

            {/* Info de Desenvolvimento */}
            {process.env.NODE_ENV === 'development' && (
              <details className="mt-6 text-xs">
                <summary className="cursor-pointer text-gray-500 hover:text-gray-700">
                  📋 Stack Trace (apenas desenvolvimento)
                </summary>
                <pre className="mt-3 bg-gray-100 p-3 rounded overflow-auto max-h-48 text-gray-700">
                  {this.state.error?.stack}
                </pre>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}