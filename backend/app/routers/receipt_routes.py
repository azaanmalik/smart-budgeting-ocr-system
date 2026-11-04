from fastapi import APIRouter, Depends, UploadFile, File, HTTPException, Request
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from PIL import Image
import pytesseract
import shutil
import os
import re
from datetime import datetime
from pathlib import Path
import io
from uuid import uuid4

from ..database import get_db
from ..dependencies import get_current_user
from ..models import Receipt, Expense, Budget, Alert, Category
from ..schemas import ReceiptResponse, ReceiptUpdate

router = APIRouter(prefix="/receipts", tags=["Receipts"])

UPLOAD_DIR = Path(__file__).resolve().parents[3] / "receipts_storage"


def extract_amount(text):
    lines = text.split("\n")

    for line in lines:
        clean_line = line.strip()
        if re.search(r"\btotal\b", clean_line, re.IGNORECASE) and not re.search(r"sub[- ]?total", clean_line, re.IGNORECASE):
            numbers = re.findall(r"\d+\.\d{2}", clean_line)
            if numbers:
                return float(numbers[-1])

    for line in lines:
        clean_line = line.strip()
        if re.search(r"\bbalance\b", clean_line, re.IGNORECASE):
            numbers = re.findall(r"\d+\.\d{2}", clean_line)
            if numbers:
                return float(numbers[-1])

    matches = re.findall(r"\d+\.\d{2}", text)
    if matches:
        return float(matches[-1])

    return 0.0


def extract_date(text):
    match = re.search(r"\d{2}[-/]\d{2}[-/]\d{4}", text)
    if match:
        return match.group()
    return None


def extract_title(text):
    lines = text.split("\n")
    for line in lines:
        line = line.strip()
        if len(line) > 3 and not any(char.isdigit() for char in line):
            return line
    return "Receipt Expense"


def detect_category_id(title: str, db: Session):
    if not title:
        return None

    title_lower = title.lower()

    category_keywords = {
        "Groceries": ["mart", "supermarket", "grocery", "fresh", "foodland", "coles", "woolworths", "aldi"],
        "Transport": ["uber", "taxi", "fuel", "petrol", "shell", "bp", "caltex", "station"],
        "Food": ["cafe", "restaurant", "pizza", "burger", "kfc", "mcdonald", "meal", "coffee"],
        "Bills": ["electric", "water", "gas", "internet", "bill", "telstra", "optus"],
        "Health": ["pharmacy", "chemist", "medical", "clinic", "health"],
        "Shopping": ["store", "shopping", "mall", "fashion", "kmart", "target", "big w"],
    }

    for category_name, keywords in category_keywords.items():
        if any(keyword in title_lower for keyword in keywords):
            category = db.query(Category).filter(Category.name == category_name).first()
            if category:
                return category.id

    other = db.query(Category).filter(Category.name == "Other").first()
    return other.id if other else None


@router.get("/", response_model=list[ReceiptResponse])
def get_receipts(
    request: Request,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    receipts = (
        db.query(Receipt)
        .filter(Receipt.user_id == current_user.id)
        .order_by(Receipt.id.desc())
        .all()
    )

    for receipt in receipts:
        # Client fetches this authenticated endpoint with its bearer token.
        receipt.file_url = f"/receipts/file/{receipt.id}"

    return receipts


@router.get("/file/{receipt_id}")
def get_receipt_file(
    receipt_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    receipt = db.query(Receipt).filter(
        Receipt.id == receipt_id,
        Receipt.user_id == current_user.id,
    ).first()
    if not receipt:
        raise HTTPException(status_code=404, detail="Receipt not found")
    file_path = UPLOAD_DIR / receipt.filename
    if not file_path.is_file():
        raise HTTPException(status_code=404, detail="Receipt image not found")
    return FileResponse(str(file_path))


@router.post("/ocr-receipt")
async def ocr_receipt(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

    original_name = os.path.basename(file.filename or "")
    suffix = Path(original_name).suffix.lower()
    if suffix not in {".png", ".jpg", ".jpeg", ".webp"}:
        raise HTTPException(status_code=400, detail="Upload a PNG, JPG or WEBP receipt")

    max_bytes = 8 * 1024 * 1024
    data = await file.read(max_bytes + 1)
    if len(data) > max_bytes:
        raise HTTPException(status_code=413, detail="Receipt image exceeds 8 MB")

    safe_filename = f"{uuid4().hex}{suffix}"
    file_path = UPLOAD_DIR / safe_filename
    try:
        with Image.open(io.BytesIO(data)) as image:
            image.verify()
        file_path.write_bytes(data)
        with Image.open(file_path) as image:
            if image.format not in {"PNG", "JPEG", "WEBP"}:
                raise ValueError("Unsupported image content")
            grayscale = image.convert("L")
            custom_config = r"--oem 3 --psm 6"
            extracted_text = pytesseract.image_to_string(grayscale, config=custom_config)
    except Exception:
        file_path.unlink(missing_ok=True)
        raise HTTPException(status_code=400, detail="Unable to read or OCR the receipt image")

    amount = extract_amount(extracted_text)
    date = extract_date(extracted_text)
    title = extract_title(extracted_text)
    detected_category_id = detect_category_id(title, db)

    new_receipt = Receipt(
        user_id=current_user.id,
        filename=safe_filename,
        extracted_text=extracted_text,
        detected_title=title,
        detected_amount=amount,
        detected_date=date
    )
    db.add(new_receipt)
    db.flush()

    new_expense = Expense(
        user_id=current_user.id,
        receipt_id=new_receipt.id,
        title=title or "Untitled Expense",
        amount=amount or 0,
        transaction_date=date,
        category_id=detected_category_id
    )
    db.add(new_expense)

    db.commit()
    db.refresh(new_receipt)

    return {
        "receipt_id": new_receipt.id,
        "filename": safe_filename,
        "title": title,
        "amount": amount,
        "date": date,
        "category_id": detected_category_id,
        "extracted_text": extracted_text
    }


@router.put("/{receipt_id}")
def update_receipt(
    receipt_id: int,
    payload: ReceiptUpdate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    receipt = db.query(Receipt).filter(
        Receipt.id == receipt_id,
        Receipt.user_id == current_user.id
    ).first()

    if not receipt:
        raise HTTPException(status_code=404, detail="Receipt not found")

    receipt.detected_title = payload.detected_title
    receipt.detected_amount = payload.detected_amount
    receipt.detected_date = payload.detected_date

    expense = db.query(Expense).filter(
        Expense.receipt_id == receipt.id,
        Expense.user_id == current_user.id
    ).first()

    if expense:
        expense.title = payload.detected_title
        expense.amount = payload.detected_amount
        expense.transaction_date = payload.detected_date
        expense.category_id = payload.category_id

    if expense and payload.category_id:
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
    db.refresh(receipt)

    return {
        "id": receipt.id,
        "filename": receipt.filename,
        "detected_title": receipt.detected_title,
        "detected_amount": receipt.detected_amount,
        "detected_date": receipt.detected_date
    }


@router.delete("/{receipt_id}")
def delete_receipt(
    receipt_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    receipt = db.query(Receipt).filter(
        Receipt.id == receipt_id,
        Receipt.user_id == current_user.id
    ).first()

    if not receipt:
        raise HTTPException(status_code=404, detail="Receipt not found")

    expense = db.query(Expense).filter(
        Expense.receipt_id == receipt.id,
        Expense.user_id == current_user.id
    ).first()

    if expense:
        db.delete(expense)

    file_path = UPLOAD_DIR / receipt.filename
    db.delete(receipt)
    db.commit()
    file_path.unlink(missing_ok=True)

    return {"message": "Receipt deleted successfully"}
