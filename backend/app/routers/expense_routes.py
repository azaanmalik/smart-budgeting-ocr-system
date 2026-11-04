from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime
import csv
import io

from ..database import get_db
from ..dependencies import get_current_user
from ..models import Expense, Budget, Alert, Category
from ..schemas import ExpenseOut, ExpenseUpdate

router = APIRouter(prefix="/expenses", tags=["Expenses"])


@router.get("/", response_model=List[ExpenseOut])
def get_expenses(db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    return (
        db.query(Expense)
        .filter(Expense.user_id == current_user.id)
        .order_by(Expense.id.desc())
        .all()
    )


@router.put("/{expense_id}", response_model=ExpenseOut)
def update_expense(
    expense_id: int,
    payload: ExpenseUpdate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    expense = db.query(Expense).filter(
        Expense.id == expense_id,
        Expense.user_id == current_user.id
    ).first()

    if not expense:
        raise HTTPException(status_code=404, detail="Expense not found")

    expense.title = payload.title
    expense.amount = payload.amount
    expense.transaction_date = payload.transaction_date
    expense.category_id = payload.category_id

    if payload.category_id:
        now = datetime.now()
        current_month = now.strftime("%Y-%m")
        month_start = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
        if now.month == 12:
            next_month_start = month_start.replace(year=now.year + 1, month=1)
        else:
            next_month_start = month_start.replace(month=now.month + 1)

        budget = db.query(Budget).filter(
            Budget.user_id == current_user.id,
            Budget.category_id == payload.category_id,
            Budget.month == current_month
        ).first()

        if budget:
            total_spent = db.query(Expense).filter(
                Expense.user_id == current_user.id,
                Expense.category_id == payload.category_id,
                Expense.created_at >= month_start,
                Expense.created_at < next_month_start
            ).all()

            spent_amount = sum(item.amount for item in total_spent)

            category = db.query(Category).filter(Category.id == payload.category_id).first()
            category_name = category.name if category else "Category"

            if spent_amount >= budget.budget_limit:
                alert_message = f"You have exceeded your {category_name} budget."
                existing_alert = db.query(Alert).filter(
                    Alert.user_id == current_user.id,
                    Alert.category_id == payload.category_id,
                    Alert.message == alert_message
                ).first()

                if not existing_alert:
                    db.add(Alert(
                        user_id=current_user.id,
                        category_id=payload.category_id,
                        message=alert_message,
                        alert_type="Exceeded"
                    ))

            elif spent_amount >= (budget.budget_limit * 0.8):
                alert_message = f"You have reached 80% of your {category_name} budget."
                existing_alert = db.query(Alert).filter(
                    Alert.user_id == current_user.id,
                    Alert.category_id == payload.category_id,
                    Alert.message == alert_message
                ).first()

                if not existing_alert:
                    db.add(Alert(
                        user_id=current_user.id,
                        category_id=payload.category_id,
                        message=alert_message,
                        alert_type="Warning"
                    ))

    db.commit()
    db.refresh(expense)
    return expense


@router.delete("/{expense_id}")
def delete_expense(
    expense_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    expense = db.query(Expense).filter(
        Expense.id == expense_id,
        Expense.user_id == current_user.id
    ).first()

    if not expense:
        raise HTTPException(status_code=404, detail="Expense not found")

    db.delete(expense)
    db.commit()
    return {"message": "Expense deleted successfully"}


@router.get("/export/csv")
def export_expenses_csv(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    expenses = (
        db.query(Expense)
        .filter(Expense.user_id == current_user.id)
        .order_by(Expense.id.desc())
        .all()
    )

    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow(["ID", "Title", "Amount", "Transaction Date", "Category ID"])

    for expense in expenses:
        writer.writerow([
            expense.id,
            expense.title,
            expense.amount,
            expense.transaction_date or "",
            expense.category_id or "",
        ])

    output.seek(0)

    return StreamingResponse(
        iter([output.getvalue()]),
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=expenses.csv"}
    )
