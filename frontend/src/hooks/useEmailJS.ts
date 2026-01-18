import emailjs from '@emailjs/browser';
import { useToast } from '../components/Toast';

// Pegar IDs do EmailJS das variáveis de ambiente
const SERVICE_ID = import.meta.env.VITE_EMAILJS_SERVICE_ID;
const PUBLIC_KEY = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;
const TEMPLATE_ID = import.meta.env.VITE_EMAILJS_TEMPLATE_ID;

// Validar se as variáveis estão configuradas
if (!SERVICE_ID || !PUBLIC_KEY || !TEMPLATE_ID) {
  console.warn(
    '⚠️ Variáveis do EmailJS não configuradas! ' +
    'Configure VITE_EMAILJS_SERVICE_ID, VITE_EMAILJS_PUBLIC_KEY e VITE_EMAILJS_TEMPLATE_ID'
  );
}

// Inicializar EmailJS
if (PUBLIC_KEY) {
  emailjs.init(PUBLIC_KEY);
  console.log('✅ EmailJS inicializado com sucesso');
}

export function useEmailJS() {
  const toast = useToast();

  const sendBudgetConfirmationEmail = async (
    customerEmail: string,
    customerName: string,
    budgetTitle: string,
    budgetAmount: number,
    budgetId: string
  ) => {
    try {
      if (!SERVICE_ID || !TEMPLATE_ID) {
        throw new Error('EmailJS não está configurado. Verifique as variáveis de ambiente.');
      }

      console.log('📧 Enviando email de confirmação para:', customerEmail);

      const templateParams = {
        customer_email: customerEmail,
        customer_name: customerName,
        budget_title: budgetTitle,
        budget_amount: budgetAmount.toFixed(2),
        budget_id: budgetId,
        date: new Date().toLocaleDateString('pt-BR'),
        time: new Date().toLocaleTimeString('pt-BR'),
      };

      const response = await emailjs.send(
        SERVICE_ID,
        TEMPLATE_ID,
        templateParams
      );

      console.log('✅ Email de confirmação enviado com sucesso!', response);
      toast.success('✅ Email de confirmação enviado com sucesso!');

      return response;
    } catch (error: any) {
      const errorMsg = error.message || 'Erro ao enviar email de confirmação';
      console.error('❌ Erro ao enviar email de confirmação:', error);
      toast.error(`❌ ${errorMsg}`);
      throw error;
    }
  };

  const sendBudgetApprovalEmail = async (
    customerEmail: string,
    customerName: string,
    budgetTitle: string,
    budgetAmount: number,
    status: string
  ) => {
    try {
      if (!SERVICE_ID || !TEMPLATE_ID) {
        throw new Error('EmailJS não está configurado. Verifique as variáveis de ambiente.');
      }

      console.log('📧 Enviando email de aprovação para:', customerEmail);

      const statusLabel = status === 'approved' ? 'Aprovado ✅' : 'Rejeitado ❌';

      const templateParams = {
        customer_email: customerEmail,
        customer_name: customerName,
        budget_title: budgetTitle,
        budget_amount: budgetAmount.toFixed(2),
        status: statusLabel,
        date: new Date().toLocaleDateString('pt-BR'),
        time: new Date().toLocaleTimeString('pt-BR'),
      };

      const response = await emailjs.send(
        SERVICE_ID,
        TEMPLATE_ID,
        templateParams
      );

      console.log('✅ Email de atualização enviado com sucesso!', response);
      toast.success('✅ Email de atualização enviado com sucesso!');

      return response;
    } catch (error: any) {
      const errorMsg = error.message || 'Erro ao enviar email de atualização';
      console.error('❌ Erro ao enviar email de atualização:', error);
      toast.error(`❌ ${errorMsg}`);
      throw error;
    }
  };

  const sendContactEmail = async (
    senderEmail: string,
    senderName: string,
    message: string
  ) => {
    try {
      if (!SERVICE_ID || !TEMPLATE_ID) {
        throw new Error('EmailJS não está configurado. Verifique as variáveis de ambiente.');
      }

      console.log('📧 Enviando email de contato de:', senderEmail);

      const templateParams = {
        sender_email: senderEmail,
        sender_name: senderName,
        message: message,
        date: new Date().toLocaleDateString('pt-BR'),
        time: new Date().toLocaleTimeString('pt-BR'),
      };

      const response = await emailjs.send(
        SERVICE_ID,
        TEMPLATE_ID,
        templateParams
      );

      console.log('✅ Email de contato enviado com sucesso!', response);
      toast.success('✅ Email de contato enviado com sucesso!');

      return response;
    } catch (error: any) {
      const errorMsg = error.message || 'Erro ao enviar email de contato';
      console.error('❌ Erro ao enviar email de contato:', error);
      toast.error(`❌ ${errorMsg}`);
      throw error;
    }
  };

  return {
    sendBudgetConfirmationEmail,
    sendBudgetApprovalEmail,
    sendContactEmail,
  };
}