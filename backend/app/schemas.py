from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime


class UserCreate(BaseModel):
    full_name: str
    email: EmailStr
    password: str


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserOut(BaseModel):
    id: int
    full_name: str
    email: EmailStr
    created_at: datetime

    class Config:
        from_attributes = True


class TokenResponse(BaseModel):
    access_token: str
    token_type: str
    user: UserOut


class CategoryOut(BaseModel):
    id: int
    name: str

    class Config:
        from_attributes = True


class ReceiptUpdate(BaseModel):
    detected_title: str
    detected_amount: float
    detected_date: Optional[str] = None
    category_id: Optional[int] = None


class ReceiptResponse(BaseModel):
    id: int
    filename: str
    extracted_text: Optional[str] = None
    detected_title: Optional[str] = None
    detected_amount: float
    detected_date: Optional[str] = None
    created_at: datetime
    file_url: Optional[str] = None

    class Config:
        from_attributes = True


class ExpenseOut(BaseModel):
    id: int
    title: str
    amount: float
    transaction_date: Optional[str] = None
    category_id: Optional[int] = None

    class Config:
        from_attributes = True


class ExpenseUpdate(BaseModel):
    title: str
    amount: float
    transaction_date: Optional[str] = None
    category_id: Optional[int] = None


class BudgetCreate(BaseModel):
    category_id: int
    month: str
    budget_limit: float


class BudgetOut(BaseModel):
    id: int
    category_id: int
    month: str
    budget_limit: float

    class Config:
        from_attributes = True


class AlertOut(BaseModel):
    id: int
    message: str
    alert_type: str
    is_read: bool
    created_at: datetime

    class Config:
        from_attributes = True


class UserProfileUpdate(BaseModel):
    full_name: str
    email: EmailStr


class PasswordChangeRequest(BaseModel):
    current_password: str
    new_password: str