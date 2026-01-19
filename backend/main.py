import os
import json
import base64
from whatsapp_service import send_whatsapp_message
from export_generator import generate_customers_excel, generate_budgets_excel, generate_monthly_report_excel
from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime
from dotenv import load_dotenv
from supabase import create_client, Client
from pdf_generator import generate_budget_pdf

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
# FUNÇÃO AUXILIAR - CONVERTER PARA STRING
# ============================================

def to_string(value):
    """Converte qualquer tipo para string, incluindo listas"""
    if isinstance(value, list):
        return value[0] if value else ""
    return str(value).strip()

# ============================================
# FUNÇÃO DE AUTENTICAÇÃO - VERSÃO 6 (CORRIGIDA)
# ============================================

def get_user_id(request: Request) -> str:
    """
    Extrai o user_id do token JWT do Supabase
    Decodifica manualmente com tratamento correto de strings
    """
    auth_header = request.headers.get("Authorization")
    
    if not auth_header:
        print("❌ Erro: Authorization header não fornecido")
        raise HTTPException(status_code=401, detail="Token não fornecido")
    
    # Converter para string se necessário
    auth_header = to_string(auth_header)
    
    if not auth_header.startswith("Bearer "):
        print(f"❌ Erro: Authorization header mal formatado")
        raise HTTPException(status_code=401, detail="Formato de token inválido")
    
    # Extrair token após "Bearer "
    token = auth_header.split(" ", 1)[1]
    token = to_string(token)
    
    if not token:
        print("❌ Erro: Token vazio")
        raise HTTPException(status_code=401, detail="Token não fornecido")
    
    try:
        # Dividir o token em partes (header.payload.signature)
        parts = token.split('.')
        if len(parts) != 3:
            raise ValueError(f"Token não tem 3 partes, tem {len(parts)}")
        
        # Decodificar apenas o payload (segunda parte - índice 1)
        payload = to_string(parts[1])
        
        if not payload:
            raise ValueError("Payload vazio")
        
        # Adicionar padding se necessário
        padding = 4 - len(payload) % 4
        if padding != 4:
            payload += '=' * padding
        
        # Decodificar do base64
        decoded_bytes = base64.urlsafe_b64decode(payload)
        decoded_dict = json.loads(decoded_bytes)
        
        print(f"✅ Token decodificado com sucesso!")
        print(f"   Sub: {decoded_dict.get('sub', 'N/A')}")
        print(f"   Email: {decoded_dict.get('email', 'N/A')}")
        
        user_id = decoded_dict.get("sub")
        
        if not user_id:
            print(f"❌ Erro: 'sub' não encontrado no token")
            print(f"   Payload: {decoded_dict}")
            raise HTTPException(status_code=401, detail="User ID não encontrado no token")
        
        return user_id
        
    except json.JSONDecodeError as e:
        print(f"❌ Erro ao decodificar JSON do token: {str(e)}")
        raise HTTPException(status_code=401, detail="Token inválido")
    except ValueError as e:
        print(f"❌ Erro ao processar token: {str(e)}")
        raise HTTPException(status_code=401, detail=f"Token inválido: {str(e)}")
    except Exception as e:
        print(f"❌ Erro inesperado ao processar token: {str(e)}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=401, detail=f"Erro ao processar token: {str(e)}")

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
    cnpj = cnpj.replace(".", "").replace("/", "").replace("-", "").replace(" ", "")
    
    if len(cnpj) != 14 or not cnpj.isdigit():
        return False
    
    sum1 = sum(int(cnpj[i]) * (5 - i % 5) if i < 4 else int(cnpj[i]) * (13 - i % 5) for i in range(12))
    digit1 = 11 - (sum1 % 11)
    digit1 = 0 if digit1 > 9 else digit1
    
    sum2 = sum(int(cnpj[i]) * (6 - i % 5) if i < 5 else int(cnpj[i]) * (14 - i % 5) for i in range(13))
    digit2 = 11 - (sum2 % 11)
    digit2 = 0 if digit2 > 9 else digit2
    
    return cnpj == str(digit1) and cnpj == str(digit2)

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
async def list_customers(request: Request):
    try:
        user_id = get_user_id(request)
        print(f"📋 Buscando clientes para user_id: {user_id}")
        
        response = supabase.table("customers").select("*").eq("user_id", user_id).execute()
        
        print(f"✅ {len(response.data)} clientes encontrados")
        return response.data
    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ Erro ao listar clientes: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/customers")
async def create_customer(customer: dict, request: Request):
    try:
        user_id = get_user_id(request)
        print(f"➕ Criando novo cliente para user_id: {user_id}")
        
        # Validar CPF/CNPJ se fornecido
        if customer.get("cpf_cnpj"):
            cpf_cnpj = customer["cpf_cnpj"]
            if customer.get("tipo_pessoa") == "fisica":
                if not validate_cpf(cpf_cnpj):
                    raise HTTPException(status_code=400, detail="CPF inválido")
            elif customer.get("tipo_pessoa") == "juridica":
                if not validate_cnpj(cpf_cnpj):
                    raise HTTPException(status_code=400, detail="CNPJ inválido")
        
        response = supabase.table("customers").insert({
            "name": customer["name"],
            "cep": customer.get("cep"),
            "endereco": customer.get("endereco"),
            "numero": customer.get("numero"),
            "complemento": customer.get("complemento"),
            "bairro": customer.get("bairro"),
            "cidade": customer.get("cidade"),
            "estado": customer.get("estado"),
            "telefone": customer.get("telefone"),
            "email": customer.get("email"),
            "cpf_cnpj": customer.get("cpf_cnpj"),
            "tipo_pessoa": customer.get("tipo_pessoa", "fisica"),
            "detalhes": customer.get("detalhes"),
            "user_id": user_id,
        }).execute()
        
        print(f"✅ Cliente criado: {response.data[0]['id'] if response.data else 'desconhecido'}")
        return response.data if response.data else customer
    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ Erro ao criar cliente: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.put("/api/customers/{customer_id}")
async def update_customer(customer_id: str, customer: dict, request: Request):
    try:
        user_id = get_user_id(request)
        print(f"✏️ Atualizando cliente {customer_id}")
        
        # Validar CPF/CNPJ se fornecido
        if customer.get("cpf_cnpj"):
            cpf_cnpj = customer["cpf_cnpj"]
            if customer.get("tipo_pessoa") == "fisica":
                if not validate_cpf(cpf_cnpj):
                    raise HTTPException(status_code=400, detail="CPF inválido")
            elif customer.get("tipo_pessoa") == "juridica":
                if not validate_cnpj(cpf_cnpj):
                    raise HTTPException(status_code=400, detail="CNPJ inválido")
        
        response = supabase.table("customers").update({
            "name": customer["name"],
            "cep": customer.get("cep"),
            "endereco": customer.get("endereco"),
            "numero": customer.get("numero"),
            "complemento": customer.get("complemento"),
            "bairro": customer.get("bairro"),
            "cidade": customer.get("cidade"),
            "estado": customer.get("estado"),
            "telefone": customer.get("telefone"),
            "email": customer.get("email"),
            "cpf_cnpj": customer.get("cpf_cnpj"),
            "tipo_pessoa": customer.get("tipo_pessoa", "fisica"),
            "detalhes": customer.get("detalhes"),
        }).eq("id", customer_id).eq("user_id", user_id).execute()
        
        if not response.data:
            raise HTTPException(status_code=404, detail="Cliente não encontrado")
        
        print(f"✅ Cliente {customer_id} atualizado")
        return response.data
    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ Erro ao atualizar cliente: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.delete("/api/customers/{customer_id}")
async def delete_customer(customer_id: str, request: Request):
    try:
        user_id = get_user_id(request)
        print(f"🗑️ Deletando cliente {customer_id}")
        
        response = supabase.table("customers").delete().eq("id", customer_id).eq("user_id", user_id).execute()
        
        print(f"✅ Cliente {customer_id} deletado")
        return {"message": "Cliente deletado", "customer_id": customer_id}
    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ Erro ao deletar cliente: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

# ============================================
# ENDPOINTS - BUDGETS
# ============================================

@app.get("/api/budgets")
async def list_budgets(request: Request):
    try:
        user_id = get_user_id(request)
        response = supabase.table("budgets").select("*").eq("user_id", user_id).execute()
        return response.data
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/budgets")
async def create_budget(budget: dict, request: Request):
    try:
        user_id = get_user_id(request)
        print(f"Criando orçamento para user_id: {user_id}")
        
        # Gerar número automático ANTES de inserir
        year = datetime.now().strftime("%Y")
        # Buscar último número deste ano para este usuário
        last_budget = supabase.table("budgets")\
            .select("budget_number")\
            .eq("user_id", user_id)\
            .gte("budget_number", f"{year}-001")\
            .order("budget_number", desc=True)\
            .limit(1)\
            .execute()
        
        if last_budget.data:
            last_num = int(last_budget.data[0]["budget_number"].split("-")[1])
            new_num = last_num + 1
        else:
            new_num = 1
        
        budget_number = f"{year}-{new_num:03d}"  # 2026-001, 2026-002...
        
        print(f"Novo número gerado: {budget_number}")
        
        # Inserir com número automático
        response = supabase.table("budgets").insert({
            "title": budget["title"],
            "budget_number": budget_number,  # ← NOVO
            "customer_id": budget.get("customer_id"),
            "project_name": budget.get("project_name"),
            "project_details": budget.get("project_details"),
            "validity": budget.get("validity"),
            "delivery_deadline": budget.get("delivery_deadline"),
            "subtotal_amount": budget["subtotal_amount"],
            "discount_percent": budget["discount_percent"],
            "discount_amount": budget.get("discount_amount", 0),
            "discount_type": budget.get("discount_type"),
            "final_amount": budget["final_amount"],
            "payment_conditions": budget.get("payment_conditions"),
            "payment_methods": budget.get("payment_methods"),
            "drawing_url": budget.get("drawing_url"),
            "observations": budget.get("observations"),
            "status": budget.get("status", "draft"),
            "user_id": user_id
        }).execute()
        
        print(f"Orçamento criado: {budget_number}")
        return response.data if response.data else budget
        
    except Exception as e:
        print(f"Erro ao criar orçamento: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@app.put("/api/budgets/{budget_id}")
async def update_budget(budget_id: str, budget: dict, request: Request):
    try:
        user_id = get_user_id(request)
        response = supabase.table("budgets").update({
            "title": budget["title"],
            "customer_id": budget.get("customer_id"),
            "subtotal_amount": budget["subtotal_amount"],
            "discount_percent": budget["discount_percent"],
            "final_amount": budget["final_amount"],
            "status": budget.get("status", "draft"),
        }).eq("id", budget_id).eq("user_id", user_id).execute()
        
        if not response.data:
            raise HTTPException(status_code=404, detail="Orçamento não encontrado")
        
        return response.data
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.delete("/api/budgets/{budget_id}")
async def delete_budget(budget_id: str, request: Request):
    try:
        user_id = get_user_id(request)
        response = supabase.table("budgets").delete().eq("id", budget_id).eq("user_id", user_id).execute()
        return {"message": "Orçamento deletado", "budget_id": budget_id}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ============================================
# ENDPOINTS - EXPORTAÇÃO
# ============================================

@app.get("/api/export/customers")
async def export_customers(request: Request):
    try:
        user_id = get_user_id(request)
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
        raise HTTPException(status_code=500, detail=f"Erro ao exportar clientes: {str(e)}")

@app.get("/api/export/budgets")
async def export_budgets(request: Request):
    try:
        user_id = get_user_id(request)
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
        raise HTTPException(status_code=500, detail=f"Erro ao exportar orçamentos: {str(e)}")

@app.get("/api/export/monthly-report")
async def export_monthly_report(request: Request):
    try:
        user_id = get_user_id(request)
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
        raise HTTPException(status_code=500, detail=f"Erro ao gerar relatório: {str(e)}")

# ============================================
# ENDPOINTS - PDF E WHATSAPP
# ============================================

@app.get("/api/budgets/{budget_id}/pdf")
async def download_budget_pdf(budget_id: str, request: Request):
    try:
        user_id = get_user_id(request)
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
        raise HTTPException(status_code=500, detail=f"Erro ao gerar PDF: {str(e)}")

@app.get("/api/budgets/{budget_id}/whatsapp")
async def generate_whatsapp_link(budget_id: str, request: Request):
    try:
        user_id = get_user_id(request)
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
        raise HTTPException(status_code=500, detail=f"Erro ao gerar link WhatsApp: {str(e)}")