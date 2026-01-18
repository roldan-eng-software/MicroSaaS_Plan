import requests
from urllib.parse import quote

"""
Serviço de Integração WhatsApp
Envia mensagens via WhatsApp Web Link
"""

def format_whatsapp_message(
    budget_title: str,
    budget_amount: float,
    customer_name: str,
    budget_id: str,
    company_name: str = "Marcenaria MDF"
) -> str:
    """
    Formata a mensagem de orçamento para WhatsApp
    
    Args:
        budget_title: Título do orçamento
        budget_amount: Valor final do orçamento
        customer_name: Nome do cliente
        budget_id: ID do orçamento
        company_name: Nome da empresa
        
    Returns:
        Mensagem formatada para WhatsApp
    """
    
    message = f"""
Olá {customer_name}! 👋

Você recebeu um novo *orçamento* de {company_name}! 🎉

📋 *Detalhes do Orçamento:*
• Título: {budget_title}
• Valor Total: R$ {budget_amount:.2f}
• ID: {budget_id}
• Data: {__import__('datetime').datetime.now().strftime('%d/%m/%Y às %H:%M')}

Para mais informações ou dúvidas, entre em contato conosco!

Obrigado! 😊
"""
    
    return message.strip()


def generate_whatsapp_link(
    phone_number: str,
    message: str
) -> str:
    """
    Gera link para enviar mensagem via WhatsApp
    
    Args:
        phone_number: Número do telefone (com código do país, ex: 55119999999999)
        message: Texto da mensagem
        
    Returns:
        Link clicável para WhatsApp Web
    """
    
    # Limpar telefone (remover caracteres especiais)
    clean_phone = phone_number.replace(" ", "").replace("-", "").replace("(", "").replace(")", "")
    
    # Garantir que começa com 55 (Brasil)
    if not clean_phone.startswith("55"):
        clean_phone = "55" + clean_phone
    
    # Codificar mensagem para URL
    encoded_message = quote(message)
    
    # Link WhatsApp Web
    whatsapp_link = f"https://wa.me/{clean_phone}?text={encoded_message}"
    
    return whatsapp_link


def validate_phone_number(phone_number: str) -> tuple[bool, str]:
    """
    Valida se o telefone é válido
    
    Args:
        phone_number: Número do telefone
        
    Returns:
        (is_valid, message)
    """
    
    # Limpar
    clean_phone = phone_number.replace(" ", "").replace("-", "").replace("(", "").replace(")", "")
    
    # Remover código do país se houver
    if clean_phone.startswith("55"):
        clean_phone = clean_phone[2:]
    
    # Validação básica - telefone Brasil deve ter 10-11 dígitos
    if not clean_phone.isdigit():
        return False, "Telefone deve conter apenas números"
    
    if len(clean_phone) < 10 or len(clean_phone) > 11:
        return False, "Telefone deve ter 10 ou 11 dígitos"
    
    return True, "Telefone válido"


def send_whatsapp_message(
    phone_number: str,
    budget_title: str,
    budget_amount: float,
    customer_name: str,
    budget_id: str,
    company_name: str = "Marcenaria MDF"
) -> dict:
    """
    Função principal para enviar orçamento via WhatsApp
    
    Args:
        phone_number: Número do telefone do cliente
        budget_title: Título do orçamento
        budget_amount: Valor do orçamento
        customer_name: Nome do cliente
        budget_id: ID do orçamento
        company_name: Nome da empresa
        
    Returns:
        Dicionário com status e link
    """
    
    # Validar telefone
    is_valid, validation_msg = validate_phone_number(phone_number)
    
    if not is_valid:
        return {
            "success": False,
            "message": validation_msg,
            "link": None
        }
    
    try:
        # Formatar mensagem
        message = format_whatsapp_message(
            budget_title,
            budget_amount,
            customer_name,
            budget_id,
            company_name
        )
        
        # Gerar link
        whatsapp_link = generate_whatsapp_link(phone_number, message)
        
        print(f"✅ Link WhatsApp gerado para: {phone_number}")
        print(f"📱 Link: {whatsapp_link}")
        
        return {
            "success": True,
            "message": "Link WhatsApp gerado com sucesso! Clique para enviar a mensagem.",
            "link": whatsapp_link,
            "phone_number": phone_number
        }
        
    except Exception as e:
        print(f"❌ Erro ao gerar link WhatsApp: {str(e)}")
        return {
            "success": False,
            "message": f"Erro ao gerar link: {str(e)}",
            "link": None
        }