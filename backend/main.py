import os
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

import jwt


# Carregar variáveis de ambiente
load_dotenv()


SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")


# Inicializar cliente Supabase
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)


app = FastAPI(title="🪵 Marcenaria API")


app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Função para extrair user_id do token
def get_user_id(request: Request) -> str:
    auth_header = request.headers.get("Authorization")
    if not auth_header or not auth_header.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Token não fornecido")
    
    token = auth_header.split(" ")[1]
    try:
        # Decodificar token (sem verificar assinatura, pois é do Supabase)
        decoded = jwt.decode(token, options={"verify_signature": False})
        user_id = decoded.get("sub")
        if not user_id:
            raise HTTPException(status_code=401, detail="User ID não encontrado no token")
        return user_id
    except Exception as e:
        raise HTTPException(status_code=401, detail=f"Token inválido: {str(e)}")


# Modelos Pydantic
class Customer(BaseModel):
    id: Optional[str] = None
    name: str
    email: Optional[str] = None
    phone: Optional[str] = None


class Budget(BaseModel):
    id: Optional[str] = None
    title: str
    customer_id: Optional[str] = None
    subtotal_amount: float
    discount_percent: float
    final_amount: float
    status: str = "draft"


# ENDPOINTS - CUSTOMERS
@app.get("/")
async def root():
    return {"message": "🚀 Backend Marcenaria com Auth!"}


@app.get("/api/customers")
async def list_customers(request: Request):
    try:
        user_id = get_user_id(request)
        response = supabase.table("customers").select("*").eq("user_id", user_id).execute()
        return response.data
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/customers")
async def create_customer(customer: dict, request: Request):
    try:
        user_id = get_user_id(request)
        response = supabase.table("customers").insert({
            "name": customer["name"],
            "email": customer.get("email"),
            "phone": customer.get("phone"),
            "user_id": user_id,
        }).execute()
        return response.data[0] if response.data else customer
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.put("/api/customers/{customer_id}")
async def update_customer(customer_id: str, customer: dict, request: Request):
    try:
        user_id = get_user_id(request)
        response = supabase.table("customers").update({
            "name": customer["name"],
            "email": customer.get("email"),
            "phone": customer.get("phone"),
        }).eq("id", customer_id).eq("user_id", user_id).execute()
        
        if not response.data:
            raise HTTPException(status_code=404, detail="Cliente não encontrado")
        return response.data[0]
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.delete("/api/customers/{customer_id}")
async def delete_customer(customer_id: str, request: Request):
    try:
        user_id = get_user_id(request)
        response = supabase.table("customers").delete().eq("id", customer_id).eq("user_id", user_id).execute()
        return {"message": "Cliente deletado", "customer_id": customer_id}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ENDPOINTS - BUDGETS
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
        response = supabase.table("budgets").insert({
            "title": budget["title"],
            "customer_id": budget.get("customer_id"),
            "subtotal_amount": budget["subtotal_amount"],
            "discount_percent": budget["discount_percent"],
            "final_amount": budget["final_amount"],
            "status": budget.get("status", "draft"),
            "user_id": user_id,
        }).execute()
        return response.data[0] if response.data else budget
    except HTTPException:
        raise
    except Exception as e:
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
        return response.data[0]
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


# ENDPOINTS - EXPORTAÇÃO DE DADOS
@app.get("/api/export/customers")
async def export_customers(request: Request):
    """
    Download Excel com dados dos clientes
    """
    try:
        user_id = get_user_id(request)
        
        # Buscar clientes do usuário
        response = supabase.table("customers").select("*").eq("user_id", user_id).execute()
        customers = response.data
        
        if not customers:
            raise HTTPException(status_code=404, detail="Nenhum cliente encontrado")
        
        # Gerar Excel
        excel_buffer = generate_customers_excel(customers)
        
        # Retornar Excel como resposta
        return StreamingResponse(
            iter([excel_buffer.getvalue()]),
            media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            headers={
                "Content-Disposition": f"attachment; filename=clientes_{datetime.now().strftime('%d-%m-%Y')}.xlsx"
            }
        )
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao exportar clientes: {str(e)}")


@app.get("/api/export/budgets")
async def export_budgets(request: Request):
    """
    Download Excel com dados dos orçamentos
    """
    try:
        user_id = get_user_id(request)
        
        # Buscar orçamentos do usuário
        budgets_response = supabase.table("budgets").select("*").eq("user_id", user_id).execute()
        budgets = budgets_response.data
        
        # Buscar clientes do usuário (para referência)
        customers_response = supabase.table("customers").select("*").eq("user_id", user_id).execute()
        customers = customers_response.data
        
        if not budgets:
            raise HTTPException(status_code=404, detail="Nenhum orçamento encontrado")
        
        # Gerar Excel
        excel_buffer = generate_budgets_excel(budgets, customers)
        
        # Retornar Excel como resposta
        return StreamingResponse(
            iter([excel_buffer.getvalue()]),
            media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            headers={
                "Content-Disposition": f"attachment; filename=orcamentos_{datetime.now().strftime('%d-%m-%Y')}.xlsx"
            }
        )
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao exportar orçamentos: {str(e)}")


@app.get("/api/export/monthly-report")
async def export_monthly_report(request: Request):
    """
    Download Excel com relatório mensal completo
    """
    try:
        user_id = get_user_id(request)
        
        # Buscar orçamentos do usuário
        budgets_response = supabase.table("budgets").select("*").eq("user_id", user_id).execute()
        budgets = budgets_response.data
        
        # Buscar clientes do usuário
        customers_response = supabase.table("customers").select("*").eq("user_id", user_id).execute()
        customers = customers_response.data
        
        if not budgets:
            raise HTTPException(status_code=404, detail="Nenhum orçamento encontrado")
        
        # Gerar Excel
        excel_buffer = generate_monthly_report_excel(budgets, customers)
        
        # Retornar Excel como resposta
        return StreamingResponse(
            iter([excel_buffer.getvalue()]),
            media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            headers={
                "Content-Disposition": f"attachment; filename=relatorio_mensal_{datetime.now().strftime('%d-%m-%Y')}.xlsx"
            }
        )
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao gerar relatório: {str(e)}")


# ENDPOINTS - PDF
@app.get("/api/budgets/{budget_id}/pdf")
async def download_budget_pdf(budget_id: str, request: Request):
    """
    Download PDF de um orçamento
    """
    try:
        user_id = get_user_id(request)
        
        # Buscar orçamento no banco
        budget_response = supabase.table("budgets").select(
            "id, title, subtotal_amount, discount_percent, final_amount, status, created_at, customer_id"
        ).eq("id", budget_id).eq("user_id", user_id).execute()
        
        if not budget_response.data:
            raise HTTPException(status_code=404, detail="Orçamento não encontrado")
        
        budget = budget_response.data[0]
        
        # Buscar dados do cliente
        customer_response = supabase.table("customers").select(
            "id, name, email, phone"
        ).eq("id", budget["customer_id"]).execute()
        
        if not customer_response.data:
            raise HTTPException(status_code=404, detail="Cliente não encontrado")
        
        customer = customer_response.data[0]
        
        # Preparar dados do orçamento para o PDF
        budget_data = {
            "id": budget["id"],
            "description": budget["title"],
            "amount": budget["final_amount"],
            "status": budget["status"],
            "created_at": budget["created_at"],
            "subtotal": budget["subtotal_amount"],
            "discount": budget["discount_percent"],
        }
        
        # Gerar PDF
        pdf_buffer = generate_budget_pdf(
            customer_name=customer["name"],
            customer_email=customer["email"] or "não informado",
            customer_phone=customer["phone"] or "não informado",
            budget_data=budget_data
        )
        
        # Retornar PDF como resposta
        return StreamingResponse(
            iter([pdf_buffer.getvalue()]),
            media_type="application/pdf",
            headers={
                "Content-Disposition": f"attachment; filename=orcamento_{budget_id}.pdf"
            }
        )
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao gerar PDF: {str(e)}")


# ENDPOINTS - WHATSAPP
@app.get("/api/budgets/{budget_id}/whatsapp")
async def generate_whatsapp_link(budget_id: str, request: Request):
    """
    Gera link para enviar orçamento via WhatsApp
    """
    try:
        user_id = get_user_id(request)
        
        # Buscar orçamento
        budget_response = supabase.table("budgets").select(
            "id, title, final_amount, customer_id, created_at"
        ).eq("id", budget_id).eq("user_id", user_id).execute()
        
        if not budget_response.data:
            raise HTTPException(status_code=404, detail="Orçamento não encontrado")
        
        budget = budget_response.data[0]
        
        # Buscar dados do cliente
        customer_response = supabase.table("customers").select(
            "id, name, phone"
        ).eq("id", budget["customer_id"]).execute()
        
        if not customer_response.data:
            raise HTTPException(status_code=404, detail="Cliente não encontrado")
        
        customer = customer_response.data[0]
        
        # Validar se cliente tem telefone
        if not customer.get("phone"):
            raise HTTPException(
                status_code=400, 
                detail="Cliente não possui telefone cadastrado"
            )
        
        # Gerar link WhatsApp
        result = send_whatsapp_message(
            phone_number=customer["phone"],
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