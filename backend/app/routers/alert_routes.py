from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from ..database import get_db
from ..dependencies import get_current_user
from ..models import Alert
from ..schemas import AlertOut

router = APIRouter(prefix="/alerts", tags=["Alerts"])


@router.get("/", response_model=List[AlertOut])
def get_alerts(db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    return (
        db.query(Alert)
        .filter(Alert.user_id == current_user.id)
        .order_by(Alert.created_at.desc())
        .all()
    )


@router.put("/{alert_id}/read", response_model=AlertOut)
def mark_alert_read(
    alert_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    alert = db.query(Alert).filter(
        Alert.id == alert_id,
        Alert.user_id == current_user.id
    ).first()

    if not alert:
        raise HTTPException(status_code=404, detail="Alert not found")

    alert.is_read = True
    db.commit()
    db.refresh(alert)
    return alert


@router.put("/read-all")
def mark_all_alerts_read(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    alerts = db.query(Alert).filter(
        Alert.user_id == current_user.id,
        Alert.is_read == False
    ).all()

    for alert in alerts:
        alert.is_read = True

    db.commit()
    return {"message": "All alerts marked as read"}