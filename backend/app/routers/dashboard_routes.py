from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import datetime

from ..database import get_db
from ..dependencies import get_current_user
from ..models import Expense, Budget, Alert, Receipt, Category

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])


@router.get("/summary")
def get_dashboard_summary(db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    current_month = datetime.now().strftime("%Y-%m")

    total_spending = (
        db.query(func.coalesce(func.sum(Expense.amount), 0))
        .filter(Expense.user_id == current_user.id)
        .scalar()
    )

    total_budget = (
        db.query(func.coalesce(func.sum(Budget.budget_limit), 0))
        .filter(Budget.user_id == current_user.id, Budget.month == current_month)
        .scalar()
    )

    total_receipts = (
        db.query(func.count(Receipt.id))
        .filter(Receipt.user_id == current_user.id)
        .scalar()
    )

    unread_alerts = (
        db.query(func.count(Alert.id))
        .filter(Alert.user_id == current_user.id, Alert.is_read == False)
        .scalar()
    )

    recent_expenses = (
        db.query(Expense)
        .filter(Expense.user_id == current_user.id)
        .order_by(Expense.id.desc())
        .limit(5)
        .all()
    )

    spending_by_category = (
        db.query(
            Category.name,
            func.coalesce(func.sum(Expense.amount), 0).label("total")
        )
        .join(Expense, Expense.category_id == Category.id)
        .filter(Expense.user_id == current_user.id)
        .group_by(Category.name)
        .all()
    )

    return {
        "total_spending": float(total_spending or 0),
        "total_budget": float(total_budget or 0),
        "total_receipts": total_receipts or 0,
        "unread_alerts": unread_alerts or 0,
        "recent_expenses": [
            {
                "id": e.id,
                "title": e.title,
                "amount": e.amount,
                "transaction_date": e.transaction_date,
                "category_id": e.category_id
            }
            for e in recent_expenses
        ],
        "spending_by_category": [
            {
                "category": name,
                "total": float(total)
            }
            for name, total in spending_by_category
        ]
    }