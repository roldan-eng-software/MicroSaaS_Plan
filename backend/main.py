import os
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime
from dotenv import load_dotenv
from supabase import create_client, Client

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
    return {"message": "🚀 Backend Marcenaria funcionando com Supabase!"}

@app.get("/api/customers")
async def list_customers():
    try:
        response = supabase.table("customers").select("*").execute()
        return response.data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/customers")
async def create_customer(customer: dict):
    try:
        response = supabase.table("customers").insert({
            "name": customer["name"],
            "email": customer.get("email"),
            "phone": customer.get("phone"),
        }).execute()
        return response.data[0] if response.data else customer
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.put("/api/customers/{customer_id}")
async def update_customer(customer_id: str, customer: dict):
    try:
        response = supabase.table("customers").update({
            "name": customer["name"],
            "email": customer.get("email"),
            "phone": customer.get("phone"),
        }).eq("id", customer_id).execute()
        
        if not response.data:
            raise HTTPException(status_code=404, detail="Cliente não encontrado")
        return response.data[0]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.delete("/api/customers/{customer_id}")
async def delete_customer(customer_id: str):
    try:
        response = supabase.table("customers").delete().eq("id", customer_id).execute()
        return {"message": "Cliente deletado", "customer_id": customer_id}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ENDPOINTS - BUDGETS
@app.get("/api/budgets")
async def list_budgets():
    try:
        response = supabase.table("budgets").select("*").execute()
        return response.data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/budgets")
async def create_budget(budget: dict):
    try:
        response = supabase.table("budgets").insert({
            "title": budget["title"],
            "customer_id": budget.get("customer_id"),
            "subtotal_amount": budget["subtotal_amount"],
            "discount_percent": budget["discount_percent"],
            "final_amount": budget["final_amount"],
            "status": budget.get("status", "draft"),
        }).execute()
        return response.data[0] if response.data else budget
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.put("/api/budgets/{budget_id}")
async def update_budget(budget_id: str, budget: dict):
    try:
        response = supabase.table("budgets").update({
            "title": budget["title"],
            "customer_id": budget.get("customer_id"),
            "subtotal_amount": budget["subtotal_amount"],
            "discount_percent": budget["discount_percent"],
            "final_amount": budget["final_amount"],
            "status": budget.get("status", "draft"),
        }).eq("id", budget_id).execute()
        
        if not response.data:
            raise HTTPException(status_code=404, detail="Orçamento não encontrado")
        return response.data[0]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.delete("/api/budgets/{budget_id}")
async def delete_budget(budget_id: str):
    try:
        response = supabase.table("budgets").delete().eq("id", budget_id).execute()
        return {"message": "Orçamento deletado", "budget_id": budget_id}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
