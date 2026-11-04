from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from ..database import get_db
from ..dependencies import get_current_user
from ..models import Budget, Category
from ..schemas import BudgetCreate, BudgetOut

router = APIRouter(prefix="/budgets", tags=["Budgets"])


@router.post("/", response_model=BudgetOut)
def create_budget(data: BudgetCreate, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    category = db.query(Category).filter(Category.id == data.category_id).first()
    if not category:
        raise HTTPException(status_code=404, detail="Category not found")

    existing = db.query(Budget).filter(
        Budget.user_id == current_user.id,
        Budget.category_id == data.category_id,
        Budget.month == data.month
    ).first()

    if existing:
        existing.budget_limit = data.budget_limit
        db.commit()
        db.refresh(existing)
        return existing

    budget = Budget(
        user_id=current_user.id,
        category_id=data.category_id,
        month=data.month,
        budget_limit=data.budget_limit
    )
    db.add(budget)
    db.commit()
    db.refresh(budget)
    return budget


@router.get("/", response_model=List[BudgetOut])
def get_budgets(db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    return db.query(Budget).filter(Budget.user_id == current_user.id).all()