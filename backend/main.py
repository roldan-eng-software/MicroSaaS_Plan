from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List
from datetime import datetime

app = FastAPI(title="🪵 Marcenaria API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Dados em memória (mock)
customers_db: List[dict] = []
budgets_db: List[dict] = []

class Customer(BaseModel):
    id: str
    name: str
    email: str | None = None
    phone: str | None = None

class Budget(BaseModel):
    id: str
    title: str
    customer_id: str | None = None
    subtotal_amount: float
    discount_percent: float
    final_amount: float
    status: str = "draft"

@app.get("/")
async def root():
    return {"message": "🚀 Backend Marcenaria funcionando!"}

@app.get("/api/customers")
async def list_customers():
    return customers_db

@app.post("/api/customers")
async def create_customer(customer: dict):
    customer["id"] = str(len(customers_db) + 1)
    customers_db.append(customer)
    return customer

@app.get("/api/budgets")
async def list_budgets():
    return budgets_db

@app.post("/api/budgets")
async def create_budget(budget: dict):
    budget["id"] = str(len(budgets_db) + 1)
    budgets_db.append(budget)
    return budget
