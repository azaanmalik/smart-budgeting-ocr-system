from sqlalchemy import Column, Integer, String, Float, Text, DateTime, ForeignKey, Boolean
from sqlalchemy.orm import relationship
from datetime import datetime
from .database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    full_name = Column(String, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    password_hash = Column(String, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    receipts = relationship("Receipt", back_populates="user", cascade="all, delete")
    expenses = relationship("Expense", back_populates="user", cascade="all, delete")
    budgets = relationship("Budget", back_populates="user", cascade="all, delete")
    alerts = relationship("Alert", back_populates="user", cascade="all, delete")


class Category(Base):
    __tablename__ = "categories"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, nullable=False)

    expenses = relationship("Expense", back_populates="category")
    budgets = relationship("Budget", back_populates="category")
    alerts = relationship("Alert", back_populates="category")


class Receipt(Base):
    __tablename__ = "receipts"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    filename = Column(String, nullable=False)
    extracted_text = Column(Text, nullable=True)
    detected_title = Column(String, nullable=True)
    detected_amount = Column(Float, nullable=True)
    detected_date = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="receipts")
    expense = relationship("Expense", back_populates="receipt", uselist=False, cascade="all, delete")


class Expense(Base):
    __tablename__ = "expenses"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    receipt_id = Column(Integer, ForeignKey("receipts.id"), nullable=True)
    category_id = Column(Integer, ForeignKey("categories.id"), nullable=True)

    title = Column(String, nullable=False)
    amount = Column(Float, nullable=False)
    transaction_date = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="expenses")
    receipt = relationship("Receipt", back_populates="expense")
    category = relationship("Category", back_populates="expenses")


class Budget(Base):
    __tablename__ = "budgets"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    category_id = Column(Integer, ForeignKey("categories.id"), nullable=False)
    month = Column(String, nullable=False)
    budget_limit = Column(Float, nullable=False)

    user = relationship("User", back_populates="budgets")
    category = relationship("Category", back_populates="budgets")


class Alert(Base):
    __tablename__ = "alerts"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    category_id = Column(Integer, ForeignKey("categories.id"), nullable=True)
    message = Column(String, nullable=False)
    alert_type = Column(String, nullable=False)
    is_read = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="alerts")
    category = relationship("Category", back_populates="alerts")