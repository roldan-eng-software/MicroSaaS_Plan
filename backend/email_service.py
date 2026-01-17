import os
import httpx
from datetime import datetime
from dotenv import load_dotenv

# Carregar variáveis de ambiente
load_dotenv()

RESEND_API_KEY = os.getenv("RESEND_API_KEY")

# Verificar se a chave foi carregada
if not RESEND_API_KEY:
    print("⚠️ AVISO: RESEND_API_KEY não foi encontrada no .env")
else:
    print(f"✓ RESEND_API_KEY carregada: {RESEND_API_KEY[:10]}...")


async def send_email(
    to: str,
    subject: str,
    html: str,
    from_email: str = "roldan.marcenaria@gmail.com"
):
    """
    Envia email usando a API do Resend
    """
    if not RESEND_API_KEY:
        print("✗ Erro: API Key não configurada!")
        return None
    
    try:
        async with httpx.AsyncClient() as client:
            response = await client.post(
                "https://api.resend.com/emails",
                headers={
                    "Authorization": f"Bearer {RESEND_API_KEY}",
                    "Content-Type": "application/json",
                },
                json={
                    "from": from_email,
                    "to": to,
                    "subject": subject,
                    "html": html,
                }
            )
            
            if response.status_code == 200:
                print(f"✓ Email enviado para {to}")
                return response.json()
            else:
                print(f"✗ Erro ao enviar email: {response.text}")
                return None
    
    except Exception as e:
        print(f"✗ Erro ao enviar email: {str(e)}")
        return None


async def send_email(
    to: str,
    subject: str,
    html: str,
    from_email: str = "roldan.marcenaria@gmail.com"
):
    """
    Envia email usando a API do Resend
    """
    try:
        async with httpx.AsyncClient() as client:
            response = await client.post(
                "https://api.resend.com/emails",
                headers={
                    "Authorization": f"Bearer {RESEND_API_KEY}",
                    "Content-Type": "application/json",
                },
                json={
                    "from": from_email,
                    "to": to,
                    "subject": subject,
                    "html": html,
                }
            )
            
            if response.status_code == 200:
                print(f"✓ Email enviado para {to}")
                return response.json()
            else:
                print(f"✗ Erro ao enviar email: {response.text}")
                return None
    
    except Exception as e:
        print(f"✗ Erro ao enviar email: {str(e)}")
        return None


async def send_budget_confirmation_email(
    customer_email: str,
    customer_name: str,
    budget_title: str,
    budget_amount: float,
    budget_id: str
):
    """
    Envia email de confirmação quando um orçamento é criado
    """
    html_content = f"""
    <html>
        <body style="font-family: Arial, sans-serif; color: #333;">
            <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
                <h2 style="color: #1f2937;">✅ Novo Orçamento Criado</h2>
                
                <p>Olá <strong>{customer_name}</strong>,</p>
                
                <p>Um novo orçamento foi criado para você:</p>
                
                <div style="background-color: #f3f4f6; padding: 15px; border-radius: 8px; margin: 20px 0;">
                    <p><strong>Título:</strong> {budget_title}</p>
                    <p><strong>Valor:</strong> R$ {budget_amount:.2f}</p>
                    <p><strong>ID do Orçamento:</strong> {budget_id}</p>
                    <p><strong>Data:</strong> {datetime.now().strftime('%d/%m/%Y às %H:%M')}</p>
                </div>
                
                <p>Você pode acompanhar o status do seu orçamento no sistema.</p>
                
                <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
                
                <p style="color: #6b7280; font-size: 12px;">
                    Este é um email automático da Marcenaria MDF. Não responda este email.
                </p>
            </div>
        </body>
    </html>
    """
    
    return await send_email(
        to=customer_email,
        subject=f"✅ Novo Orçamento: {budget_title}",
        html=html_content
    )


async def send_budget_approval_email(
    customer_email: str,
    customer_name: str,
    budget_title: str,
    budget_amount: float,
    status: str
):
    """
    Envia email quando um orçamento é aprovado ou rejeitado
    """
    status_label = "Aprovado ✅" if status == "approved" else "Rejeitado ❌"
    status_color = "#10b981" if status == "approved" else "#ef4444"
    
    html_content = f"""
    <html>
        <body style="font-family: Arial, sans-serif; color: #333;">
            <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
                <h2 style="color: #1f2937;">📋 Atualização de Orçamento</h2>
                
                <p>Olá <strong>{customer_name}</strong>,</p>
                
                <p>Seu orçamento foi atualizado:</p>
                
                <div style="background-color: #f3f4f6; padding: 15px; border-radius: 8px; margin: 20px 0;">
                    <p><strong>Título:</strong> {budget_title}</p>
                    <p><strong>Valor:</strong> R$ {budget_amount:.2f}</p>
                    <p><strong>Status:</strong> <span style="color: {status_color}; font-weight: bold;">{status_label}</span></p>
                    <p><strong>Data:</strong> {datetime.now().strftime('%d/%m/%Y às %H:%M')}</p>
                </div>
                
                <p>Entre em contato conosco se tiver dúvidas.</p>
                
                <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
                
                <p style="color: #6b7280; font-size: 12px;">
                    Este é um email automático da Marcenaria MDF. Não responda este email.
                </p>
            </div>
        </body>
    </html>
    """
    
    return await send_email(
        to=customer_email,
        subject=f"📋 Orçamento {status_label}: {budget_title}",
        html=html_content
    )


async def send_welcome_email(user_email: str, user_name: str):
    """
    Envia email de boas-vindas para novo usuário
    """
    html_content = f"""
    <html>
        <body style="font-family: Arial, sans-serif; color: #333;">
            <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
                <h2 style="color: #1f2937;">🎉 Bem-vindo à Marcenaria MDF!</h2>
                
                <p>Olá <strong>{user_name}</strong>,</p>
                
                <p>Sua conta foi criada com sucesso! 🎊</p>
                
                <p>Agora você pode:</p>
                <ul style="color: #4b5563;">
                    <li>Gerenciar seus clientes</li>
                    <li>Criar e acompanhar orçamentos</li>
                    <li>Gerar relatórios em PDF</li>
                    <li>Exportar dados em Excel</li>
                </ul>
                
                <p style="margin-top: 30px;">Comece agora acessando seu dashboard!</p>
                
                <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
                
                <p style="color: #6b7280; font-size: 12px;">
                    Este é um email automático da Marcenaria MDF. Não responda este email.
                </p>
            </div>
        </body>
    </html>
    """
    
    return await send_email(
        to=user_email,
        subject="🎉 Bem-vindo à Marcenaria MDF!",
        html=html_content
    )
