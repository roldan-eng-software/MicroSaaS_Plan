import { useState } from 'react';
import { authenticatedFetch } from '../lib/api';
import { useToast } from '../components/Toast';

const API_URL = 'http://localhost:8000/api/budgets';

export function useWhatsApp() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const toast = useToast();

  /**
   * Gera link para enviar orçamento via WhatsApp
   * Abre o WhatsApp Web em nova aba
   */
  const sendBudgetViaWhatsApp = async (budgetId: string) => {
    setLoading(true);
    setError(null);

    try {
      console.log('📱 Gerando link WhatsApp para orçamento:', budgetId);

      // Requisitar link do backend
      const result = await authenticatedFetch(
        `${API_URL}/${budgetId}/whatsapp`
      );

      if (!result.success) {
        throw new Error(result.message || 'Erro ao gerar link WhatsApp');
      }

      // Abrir link em nova aba
      if (result.link) {
        window.open(result.link, '_blank');
        toast.success('📱 WhatsApp aberto! Envie a mensagem ao cliente.');
        console.log('✅ Link WhatsApp aberto');
      }

      return result;
    } catch (err: any) {
      const errorMsg = err.message || 'Erro ao enviar via WhatsApp';
      setError(errorMsg);
      toast.error(`❌ ${errorMsg}`);
      console.error('Erro ao gerar link WhatsApp:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    error,
    sendBudgetViaWhatsApp,
  };
}