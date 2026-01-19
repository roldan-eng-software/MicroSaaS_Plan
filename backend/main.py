import os
import json
import base64
from whatsapp_service import send_whatsapp_message
from export_generator import generate_customers_excel, generate_budgets_excel, generate_monthly_report_excel
from fastapi import FastAPI, HTTPException, Request, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime
from dotenv import load_dotenv
from supabase import create_client, Client
from pdf_generator import generate_budget_pdf
from email_service import send_budget_confirmation_email

# Carregar variáveis de ambiente
load_dotenv()
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")

# Inicializar cliente Supabase
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

app = FastAPI(title="🪵 Marcenaria API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ============================================
# DEPENDÊNCIA DE AUTENTICAÇÃO
# ============================================

def get_current_user_id(request: Request) -> str:
    """
    Dependência do FastAPI para obter o ID do usuário a partir do token JWT.
    Utiliza o método `supabase.auth.get_user()` que VALIDA a assinatura do token.
    """
    auth_header = request.headers.get("Authorization")
    if not auth_header:
        raise HTTPException(status_code=401, detail="Token de autenticação não fornecido")

    # Extrai o token do cabeçalho
    token = auth_header.replace("Bearer ", "")

    try:
        # `get_user` valida o token e retorna o usuário ou lança uma exceção
        user_response = supabase.auth.get_user(token)
        user = user_response.user
        if not user:
            raise HTTPException(status_code=401, detail="Token inválido ou expirado")
        
        print(f"✅ Token verificado com sucesso para o usuário: {user.id}")
        return user.id
    except Exception as e:
        # Log do erro para depuração, mas não o exponha ao cliente
        print(f"❌ Erro na verificação do token: {e}")
        raise HTTPException(status_code=401, detail="Token inválido ou expirado")

# ============================================
# MODELOS PYDANTIC
# ============================================

class Customer(BaseModel):
    id: Optional[str] = None
    name: str
    cep: Optional[str] = None
    endereco: Optional[str] = None
    numero: Optional[str] = None
    complemento: Optional[str] = None
    bairro: Optional[str] = None
    cidade: Optional[str] = None
    estado: Optional[str] = None
    telefone: Optional[str] = None
    email: Optional[str] = None
    cpf_cnpj: Optional[str] = None
    tipo_pessoa: Optional[str] = None
    detalhes: Optional[str] = None

class Budget(BaseModel):
    id: Optional[str] = None
    title: str
    customer_id: Optional[str] = None
    subtotal_amount: float
    discount_percent: float
    final_amount: float
    status: str = "draft"

# ============================================
# FUNÇÃO DE VALIDAÇÃO - CPF/CNPJ
# ============================================

def validate_cpf(cpf: str) -> bool:
    # Remove máscara ANTES de validar
    cpf = cpf.replace(".", "").replace("-", "").replace(" ", "")
    if len(cpf) != 11 or not cpf.isdigit():
        return False
    
    # Resto da lógica permanece igual
    sum1 = sum(int(cpf[i]) * (10 - i) for i in range(9))
    digit1 = (11 - sum1) % 11
    digit1 = 0 if digit1 == 10 else digit1
    if digit1 != int(cpf[9]):
        return False
    
    sum2 = sum(int(cpf[i]) * (11 - i) for i in range(10))
    digit2 = (11 - sum2) % 11
    digit2 = 0 if digit2 == 10 else digit2
    return digit2 == int(cpf[10])


def validate_cnpj(cnpj: str) -> bool:
    """Valida CNPJ"""
    cnpj = "".join(filter(str.isdigit, cnpj))

    if len(cnpj) != 14 or len(set(cnpj)) == 1:
        return False

    # Validação do primeiro dígito verificador
    soma = 0
    peso = 5
    for i in range(12):
        soma += int(cnpj[i]) * peso
        peso -= 1
        if peso < 2:
            peso = 9
    resto = soma % 11
    dv1 = 0 if resto < 2 else 11 - resto
    if dv1 != int(cnpj[12]):
        return False

    # Validação do segundo dígito verificador
    soma = 0
    peso = 6
    for i in range(13):
        soma += int(cnpj[i]) * peso
        peso -= 1
        if peso < 2:
            peso = 9
    resto = soma % 11
    dv2 = 0 if resto < 2 else 11 - resto
    if dv2 != int(cnpj[13]):
        return False

    return True

# ============================================
# ENDPOINTS - ROOT
# ============================================

@app.get("/")
async def root():
    return {"message": "🚀 Backend Marcenaria com Supabase Auth!"}

# ============================================
# ENDPOINTS - CUSTOMERS
# ============================================

@app.get("/api/customers")
async def list_customers(user_id: str = Depends(get_current_user_id)):
    try:
        print(f"📋 Buscando clientes para user_id: {user_id}")
        
        response = supabase.table("customers").select("*").eq("user_id", user_id).execute()
        
        print(f"✅ {len(response.data)} clientes encontrados")
        return response.data
    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ Erro ao listar clientes: {str(e)}")
        raise HTTPException(status_code=500, detail="Erro interno ao processar a solicitação.")

@app.post("/api/customers")
async def create_customer(customer: Customer, user_id: str = Depends(get_current_user_id)):
    try:
        print(f"➕ Criando novo cliente para user_id: {user_id}")
        
        # A validação do Pydantic já tratou os tipos de dados
        # A validação de lógica de negócio permanece
        if customer.cpf_cnpj:
            if customer.tipo_pessoa == "fisica" and not validate_cpf(customer.cpf_cnpj):
                raise HTTPException(status_code=400, detail="CPF inválido")
            elif customer.tipo_pessoa == "juridica" and not validate_cnpj(customer.cpf_cnpj):
                raise HTTPException(status_code=400, detail="CNPJ inválido")

        customer_data = customer.model_dump(exclude_none=True)
        customer_data["user_id"] = user_id
        
        response = supabase.table("customers").insert(customer_data).execute()
        
        print(f"✅ Cliente criado: {response.data[0]['id'] if response.data else 'desconhecido'}")
        return response.data[0] if response.data else customer
    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ Erro ao criar cliente: {str(e)}")
        raise HTTPException(status_code=500, detail="Erro interno ao processar a solicitação.")

@app.put("/api/customers/{customer_id}")
async def update_customer(customer_id: str, customer: Customer, user_id: str = Depends(get_current_user_id)):
    try:
        print(f"✏️ Atualizando cliente {customer_id}")
        
        if customer.cpf_cnpj:
            if customer.tipo_pessoa == "fisica" and not validate_cpf(customer.cpf_cnpj):
                raise HTTPException(status_code=400, detail="CPF inválido")
            elif customer.tipo_pessoa == "juridica" and not validate_cnpj(customer.cpf_cnpj):
                raise HTTPException(status_code=400, detail="CNPJ inválido")
        
        # Usa exclude_unset para não sobrescrever campos existentes com None
        update_data = customer.model_dump(exclude_unset=True)

        # Garante que o ID e o user_id não sejam passados no corpo da atualização
        update_data.pop("id", None)
        update_data.pop("user_id", None)

        response = supabase.table("customers").update(update_data).eq("id", customer_id).eq("user_id", user_id).execute()
        
        if not response.data:
            raise HTTPException(status_code=404, detail="Cliente não encontrado ou não pertence ao usuário.")
        
        print(f"✅ Cliente {customer_id} atualizado")
        return response.data[0]
    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ Erro ao atualizar cliente: {str(e)}")
        raise HTTPException(status_code=500, detail="Erro interno ao processar a solicitação.")

@app.delete("/api/customers/{customer_id}")
async def delete_customer(customer_id: str, user_id: str = Depends(get_current_user_id)):
    try:
        print(f"🗑️ Deletando cliente {customer_id}")
        
        response = supabase.table("customers").delete().eq("id", customer_id).eq("user_id", user_id).execute()
        
        print(f"✅ Cliente {customer_id} deletado")
        return {"message": "Cliente deletado", "customer_id": customer_id}
    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ Erro ao deletar cliente: {str(e)}")
        raise HTTPException(status_code=500, detail="Erro interno ao processar a solicitação.")

# ============================================
# ENDPOINTS - BUDGETS
# ============================================

@app.get("/api/budgets")
async def list_budgets(user_id: str = Depends(get_current_user_id)):
    try:
        response = supabase.table("budgets").select("*").eq("user_id", user_id).execute()
        return response.data
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail="Erro interno ao processar a solicitação.")

@app.post("/api/budgets/{budget_id}/send-email")
async def send_budget_email(budget_id: str, user_id: str = Depends(get_current_user_id)):
    try:
        # 1. Buscar o orçamento
        budget_response = supabase.table("budgets").select(
            "id, title, final_amount, customer_id"
        ).eq("id", budget_id).eq("user_id", user_id).execute()

        if not budget_response.data:
            raise HTTPException(status_code=404, detail="Orçamento não encontrado")

        budget = budget_response.data[0]

        # 2. Buscar o cliente
        customer_response = supabase.table("customers").select(
            "id, name, email"
        ).eq("id", budget["customer_id"]).execute()

        if not customer_response.data:
            raise HTTPException(status_code=404, detail="Cliente associado não encontrado")

        customer = customer_response.data[0]
        customer_email = customer.get("email")
        customer_name = customer.get("name")

        # 3. Validar se o cliente tem email
        if not customer_email:
            raise HTTPException(status_code=400, detail="Cliente não possui um endereço de e-mail cadastrado.")

        # 4. Enviar o email
        email_result = await send_budget_confirmation_email(
            customer_email=customer_email,
            customer_name=customer_name,
            budget_title=budget["title"],
            budget_amount=budget["final_amount"],
            budget_id=budget["id"]
        )

        if email_result:
            return {"message": f"E-mail enviado com sucesso para {customer_email}"}
        else:
            raise HTTPException(status_code=500, detail="Falha ao enviar o e-mail.")

    except HTTPException:
        # Re-raise a exceção HTTP para que o FastAPI a manipule
        raise
    except Exception as e:
        # Captura outras exceções e retorna um erro 500 genérico
        print(f"Erro inesperado ao enviar e-mail: {e}")
        raise HTTPException(status_code=500, detail="Erro interno do servidor ao tentar enviar o e-mail.")

@app.post("/api/budgets")
async def create_budget(budget: Budget, user_id: str = Depends(get_current_user_id)):
    try:
        print(f"Criando orçamento para user_id: {user_id}")
        
        # Gerar número automático ANTES de inserir
        year = datetime.now().strftime("%Y")
        last_budget_response = supabase.table("budgets")\
            .select("budget_number")\
            .eq("user_id", user_id)\
            .like("budget_number", f"{year}-%")\
            .order("budget_number", desc=True)\
            .limit(1)\
            .execute()

        if last_budget_response.data:
            last_num = int(last_budget_response.data[0]["budget_number"].split("-")[1])
            new_num = last_num + 1
        else:
            new_num = 1
        
        budget_number = f"{year}-{new_num:03d}"
        
        budget_data = budget.model_dump(exclude_none=True)
        budget_data["user_id"] = user_id
        budget_data["budget_number"] = budget_number
        
        response = supabase.table("budgets").insert(budget_data).execute()
        
        print(f"Orçamento criado: {budget_number}")
        return response.data[0] if response.data else budget
        
    except Exception as e:
        print(f"Erro ao criar orçamento: {str(e)}")
        raise HTTPException(status_code=500, detail="Erro interno ao processar a solicitação.")


@app.put("/api/budgets/{budget_id}")
async def update_budget(budget_id: str, budget: Budget, user_id: str = Depends(get_current_user_id)):
    try:
        update_data = budget.model_dump(exclude_unset=True)

        # Campos que não devem ser atualizados via PUT
        update_data.pop("id", None)
        update_data.pop("user_id", None)
        update_data.pop("budget_number", None)

        response = supabase.table("budgets").update(update_data).eq("id", budget_id).eq("user_id", user_id).execute()
        
        if not response.data:
            raise HTTPException(status_code=404, detail="Orçamento não encontrado ou não pertence ao usuário.")
        
        return response.data[0]
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail="Erro interno ao processar a solicitação.")

@app.delete("/api/budgets/{budget_id}")
async def delete_budget(budget_id: str, user_id: str = Depends(get_current_user_id)):
    try:
        response = supabase.table("budgets").delete().eq("id", budget_id).eq("user_id", user_id).execute()
        return {"message": "Orçamento deletado", "budget_id": budget_id}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail="Erro interno ao processar a solicitação.")

# ============================================
# ENDPOINTS - EXPORTAÇÃO
# ============================================

@app.get("/api/export/customers")
async def export_customers(user_id: str = Depends(get_current_user_id)):
    try:
        response = supabase.table("customers").select("*").eq("user_id", user_id).execute()
        customers = response.data
        
        if not customers:
            raise HTTPException(status_code=404, detail="Nenhum cliente encontrado")
        
        excel_buffer = generate_customers_excel(customers)
        
        return StreamingResponse(
            iter([excel_buffer.getvalue()]),
            media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            headers={"Content-Disposition": f"attachment; filename=clientes_{datetime.now().strftime('%d-%m-%Y')}.xlsx"}
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail="Erro interno ao processar a solicitação.")

@app.get("/api/export/budgets")
async def export_budgets(user_id: str = Depends(get_current_user_id)):
    try:
        budgets_response = supabase.table("budgets").select("*").eq("user_id", user_id).execute()
        customers_response = supabase.table("customers").select("*").eq("user_id", user_id).execute()
        
        budgets = budgets_response.data
        customers = customers_response.data
        
        if not budgets:
            raise HTTPException(status_code=404, detail="Nenhum orçamento encontrado")
        
        excel_buffer = generate_budgets_excel(budgets, customers)
        
        return StreamingResponse(
            iter([excel_buffer.getvalue()]),
            media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            headers={"Content-Disposition": f"attachment; filename=orcamentos_{datetime.now().strftime('%d-%m-%Y')}.xlsx"}
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail="Erro interno ao processar a solicitação.")

@app.get("/api/export/monthly-report")
async def export_monthly_report(user_id: str = Depends(get_current_user_id)):
    try:
        budgets_response = supabase.table("budgets").select("*").eq("user_id", user_id).execute()
        customers_response = supabase.table("customers").select("*").eq("user_id", user_id).execute()
        
        budgets = budgets_response.data
        customers = customers_response.data
        
        if not budgets:
            raise HTTPException(status_code=404, detail="Nenhum orçamento encontrado")
        
        excel_buffer = generate_monthly_report_excel(budgets, customers)
        
        return StreamingResponse(
            iter([excel_buffer.getvalue()]),
            media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            headers={"Content-Disposition": f"attachment; filename=relatorio_mensal_{datetime.now().strftime('%d-%m-%Y')}.xlsx"}
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail="Erro interno ao processar a solicitação.")

# ============================================
# ENDPOINTS - PDF E WHATSAPP
# ============================================

@app.get("/api/budgets/{budget_id}/pdf")
async def download_budget_pdf(budget_id: str, user_id: str = Depends(get_current_user_id)):
    try:
        budget_response = supabase.table("budgets").select(
            "id, title, subtotal_amount, discount_percent, final_amount, status, created_at, customer_id"
        ).eq("id", budget_id).eq("user_id", user_id).execute()
        
        if not budget_response.data:
            raise HTTPException(status_code=404, detail="Orçamento não encontrado")
        
        budget = budget_response.data[0]
        
        customer_response = supabase.table("customers").select(
            "id, name, email, telefone"
        ).eq("id", budget["customer_id"]).execute()
        
        if not customer_response.data:
            raise HTTPException(status_code=404, detail="Cliente não encontrado")
        
        customer = customer_response.data[0]
        
        budget_data = {
            "id": budget["id"],
            "description": budget["title"],
            "amount": budget["final_amount"],
            "status": budget["status"],
            "created_at": budget["created_at"],
            "subtotal": budget["subtotal_amount"],
            "discount": budget["discount_percent"],
        }
        
        pdf_buffer = generate_budget_pdf(
            customer_name=customer["name"],
            customer_email=customer.get("email") or "não informado",
            customer_phone=customer.get("telefone") or "não informado",
            budget_data=budget_data
        )
        
        return StreamingResponse(
            iter([pdf_buffer.getvalue()]),
            media_type="application/pdf",
            headers={"Content-Disposition": f"attachment; filename=orcamento_{budget_id}.pdf"}
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail="Erro interno ao processar a solicitação.")

@app.get("/api/budgets/{budget_id}/whatsapp")
async def generate_whatsapp_link(budget_id: str, user_id: str = Depends(get_current_user_id)):
    try:
        budget_response = supabase.table("budgets").select(
            "id, title, final_amount, customer_id, created_at"
        ).eq("id", budget_id).eq("user_id", user_id).execute()
        
        if not budget_response.data:
            raise HTTPException(status_code=404, detail="Orçamento não encontrado")
        
        budget = budget_response.data[0]
        
        customer_response = supabase.table("customers").select(
            "id, name, telefone"
        ).eq("id", budget["customer_id"]).execute()
        
        if not customer_response.data:
            raise HTTPException(status_code=404, detail="Cliente não encontrado")
        
        customer = customer_response.data[0]
        
        if not customer.get("telefone"):
            raise HTTPException(status_code=400, detail="Cliente não possui telefone cadastrado")
        
        result = send_whatsapp_message(
            phone_number=customer["telefone"],
            budget_title=budget["title"],
            budget_amount=budget["final_amount"],
            customer_name=customer["name"],
            budget_id=budget["id"]
        )
        
        return result
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail="Erro interno ao processar a solicitação.")