from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List

from ..database import get_db
from ..dependencies import get_current_user
from ..models import Category
from ..schemas import CategoryOut

router = APIRouter(prefix="/categories", tags=["Categories"])


@router.get("/", response_model=List[CategoryOut])
def get_categories(db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    return db.query(Category).order_by(Category.name.asc()).all()