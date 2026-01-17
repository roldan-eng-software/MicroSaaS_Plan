import { useState, useCallback } from 'react';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

interface ToastMessage {
  id: string;
  type: ToastType;
  message: string;
}

// Context global para toasts
let toastCallback: ((toast: ToastMessage) => void) | null = null;

/**
 * Hook para usar toasts em qualquer lugar da aplicação
 */
export function useToast() {
  const showToast = useCallback((message: string, type: ToastType = 'info') => {
    const id = Math.random().toString(36).substr(2, 9);
    const toast: ToastMessage = { id, type, message };

    if (toastCallback) {
      toastCallback(toast);
    } else {
      console.warn('Toast não está disponível:', message);
    }

    // Auto remover após 3 segundos
    setTimeout(() => {
      removeToast(id);
    }, 3000);
  }, []);

  return {
    success: (msg: string) => showToast(msg, 'success'),
    error: (msg: string) => showToast(msg, 'error'),
    warning: (msg: string) => showToast(msg, 'warning'),
    info: (msg: string) => showToast(msg, 'info'),
  };
}

function removeToast(id: string) {
  // Esta função será sobrescrita pelo componente ToastContainer
}

/**
 * Componente ToastContainer
 * Deve ser colocado uma vez na raiz da aplicação
 */
export function ToastContainer() {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = useCallback((toast: ToastMessage) => {
    setToasts((prev) => [...prev, toast]);
  }, []);

  const removeToastLocal = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // Registrar callback global
  toastCallback = addToast;
  removeToast = removeToastLocal;

  const getIcon = (type: ToastType) => {
    switch (type) {
      case 'success':
        return '✅';
      case 'error':
        return '❌';
      case 'warning':
        return '⚠️';
      case 'info':
        return 'ℹ️';
    }
  };

  const getColors = (type: ToastType) => {
    switch (type) {
      case 'success':
        return 'bg-green-100 text-green-700 border-green-300';
      case 'error':
        return 'bg-red-100 text-red-700 border-red-300';
      case 'warning':
        return 'bg-yellow-100 text-yellow-700 border-yellow-300';
      case 'info':
        return 'bg-blue-100 text-blue-700 border-blue-300';
    }
  };

  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 max-w-md">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`
            flex items-center gap-3 px-4 py-3 rounded-lg border 
            shadow-lg animate-fadeIn
            ${getColors(toast.type)}
          `}
          role="alert"
        >
          <span className="text-xl">{getIcon(toast.type)}</span>
          <p className="flex-1 text-sm font-medium">{toast.message}</p>
          <button
            onClick={() => removeToastLocal(toast.id)}
            className="ml-2 text-lg hover:opacity-70 transition"
            aria-label="Fechar"
          >
            ×
          </button>
        </div>
      ))}
    </div>
  );
}