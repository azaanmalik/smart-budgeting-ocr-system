from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from ..database import get_db
from ..dependencies import get_current_user
from ..models import User
from ..schemas import UserProfileUpdate, UserOut, PasswordChangeRequest
from ..auth import verify_password, hash_password

router = APIRouter(prefix="/profile", tags=["Profile"])


@router.get("/", response_model=UserOut)
def get_profile(current_user=Depends(get_current_user)):
    return current_user


@router.put("/", response_model=UserOut)
def update_profile(
    payload: UserProfileUpdate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    existing_email = db.query(User).filter(
        User.email == payload.email,
        User.id != current_user.id
    ).first()

    if existing_email:
        raise HTTPException(status_code=400, detail="Email already in use")

    current_user.full_name = payload.full_name
    current_user.email = payload.email

    db.commit()
    db.refresh(current_user)
    return current_user


@router.put("/change-password")
def change_password(
    payload: PasswordChangeRequest,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    if not verify_password(payload.current_password, current_user.password_hash):
        raise HTTPException(status_code=400, detail="Current password is incorrect")

    if len(payload.new_password) < 6:
        raise HTTPException(status_code=400, detail="New password must be at least 6 characters")

    current_user.password_hash = hash_password(payload.new_password)
    db.commit()

    return {"message": "Password changed successfully"}