from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .database import Base, engine, SessionLocal
from .models import Category
from .routers import auth_routes, receipt_routes, expense_routes, budget_routes, alert_routes, category_routes, dashboard_routes, profile_routes
Base.metadata.create_all(bind=engine)

app = FastAPI(title="Budgeting System API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


def seed_categories():
    db = SessionLocal()
    default_categories = [
        "Groceries",
        "Transport",
        "Food",
        "Bills",
        "Health",
        "Shopping",
        "Other"
    ]

    for category_name in default_categories:
        existing = db.query(Category).filter(Category.name == category_name).first()
        if not existing:
            db.add(Category(name=category_name))

    db.commit()
    db.close()


seed_categories()


@app.get("/")
def root():
    return {"message": "Budgeting System API Running"}


@app.get("/test-db")
def test_db():
    return {"message": "Database connected successfully"}


app.include_router(auth_routes.router)
app.include_router(receipt_routes.router)
app.include_router(expense_routes.router)
app.include_router(budget_routes.router)
app.include_router(alert_routes.router)
app.include_router(category_routes.router)
app.include_router(dashboard_routes.router)
app.include_router(profile_routes.router)