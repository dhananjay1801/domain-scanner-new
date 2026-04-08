from fastapi import APIRouter, Depends, HTTPException
from app.api.scanner.service import create_scan_task_to_queue
from app.api.scanner.schemas import RequestScanTask
from app.core.redis_queue import RedisClient
from app.core.middleware import protect
from sqlalchemy.orm import Session
from app.db.base import get_db
import json
from app.db.models import ScanResult, ScanRequest, ScanSummary

redis_client = RedisClient()

router = APIRouter(prefix='/api/scanner', tags=["scanner"])

@router.post("/register-scan-task")
async def register_scan_task(
    payload: RequestScanTask,
    db: Session = Depends(get_db),
    current_user: dict = Depends(protect)
):
    domain = (payload.target or "").strip().lower()[:255]
    if not domain:
        raise HTTPException(status_code=400, detail="target domain is required")
    # Minimal validation (frontend also validates); keep backend resilient.
    if "://" in domain or "/" in domain or " " in domain:
        raise HTTPException(status_code=400, detail="target must be a bare domain like example.com")
    return create_scan_task_to_queue(db, domain, current_user["user_id"])


# for testing purpose only, to check the scan queue in redis
@router.get("/scanlist")
async def get_scan_list():
    data = redis_client.redis.lrange("scan_queue", 0, -1)
    return  [json.loads(item) for item in data]

@router.get("/clear")
async def clear_scan_queue(): 
    redis_client.redis.delete("scan_queue")
    return {"message": "Scan queue cleared"}

@router.get("/scan-result")
def get_scan_result(
    scan_id: str,
    db: Session = Depends(get_db),
    current_user: dict = Depends(protect)
):
    scan = db.query(ScanResult).filter(
        ScanResult.scan_id == scan_id,
        ScanResult.user_id == current_user["user_id"]
    ).first()

    if not scan:
        raise HTTPException(status_code=404, detail="Scan not found")

    return scan.results


@router.get("/scan-history")
def get_scan_history(
    db: Session = Depends(get_db),
    current_user: dict = Depends(protect)
):
    """Return all regular scans (non-malware) belonging to the logged-in user."""
    scans = db.query(ScanRequest).filter(
        ScanRequest.user_id == current_user["user_id"],
        (ScanRequest.data.op("->>")("type") == "regular") |
        (ScanRequest.data.is_(None))
    ).order_by(ScanRequest.time.desc()).all()

    history = []
    for s in scans:
        scan_result = db.query(ScanResult).filter(
            ScanResult.scan_id == s.scan_id
        ).first()

        results = scan_result.results if scan_result else {}
        status = results.get("status", "Pending")
        
        summary = db.query(ScanSummary).filter(
            ScanSummary.scan_id == s.scan_id
        ).first()
        domain_score = summary.domain_score if summary and summary.domain_score is not None else 0

        if status == "pending":
            display_status = "Pending"
        elif status == "failed":
            display_status = "Failed"
        elif status == "completed":
            display_status = "Completed"
        else:
            display_status = status.capitalize() if isinstance(status, str) else "Pending"

        history.append({
            "scan_id": s.scan_id,
            "domain": s.domain,
            "time": s.time.isoformat() if s.time else None,
            "status": display_status,
            "score": domain_score,
        })

    return history