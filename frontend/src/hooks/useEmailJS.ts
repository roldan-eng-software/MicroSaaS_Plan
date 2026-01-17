import emailjs from '@emailjs/browser';

// IDs do EmailJS
const SERVICE_ID = 'service_9tnugi8';
const PUBLIC_KEY = 'ljiKvSeNsFKBPIhPI';
const TEMPLATE_ID = 'template_qa06lt3';

// Inicializar EmailJS
emailjs.init(PUBLIC_KEY);

export function useEmailJS() {
  
  const sendBudgetConfirmationEmail = async (
    customerEmail: string,
    customerName: string,
    budgetTitle: string,
    budgetAmount: number,
    budgetId: string
  ) => {
    try {
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

      return response;
    } catch (error) {
      console.error('Erro ao enviar email:', error);
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

      return response;
    } catch (error) {
      console.error('Erro ao enviar email:', error);
      throw error;
    }
  };

  return {
    sendBudgetConfirmationEmail,
    sendBudgetApprovalEmail,
  };
}
