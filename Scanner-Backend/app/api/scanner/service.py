import uuid
from fastapi import HTTPException
from sqlalchemy.orm import Session
import json
from collections import defaultdict
from app.api.scanner.schemas import RequestScanTask
from app.core.redis_queue import RedisClient
from app.db.models import ScanResult, ScanRequest

redis_client = RedisClient()


def create_scan_task_to_queue(db: Session, data: RequestScanTask, user_id: str = None, registered_domain: str = None):
    target = data.target.strip().lower()
    if "://" in target:
        target = target.split("://")[1]
    target = target.split("/")[0]

    if registered_domain and target != registered_domain:
        raise HTTPException(status_code=403, detail=f"You can only scan your registered domain: {registered_domain}")

    import socket
    try:
        socket.gethostbyname(target)
    except socket.gaierror:
        raise HTTPException(status_code=400, detail="No such domain found. Please enter a valid, existing domain.")


    try:
        scan_id = str(uuid.uuid4())

        new_request = ScanRequest(
            scan_id=scan_id,
            user_id=user_id,
            domain=target
        )

        new_result = ScanResult(
            scan_id=scan_id,
            user_id=user_id,
            domain=target,
            results={
                "status": "pending",
                "progress": 0
            }
        )

        db.add_all([new_request, new_result])
        db.commit()

        scan_job = {
            "scan_id": scan_id,
            "target": target,
        }

        redis_client.PushToQueue(data=scan_job)

        return {
            "message": "Scan task registered successfully",
            "scan_id": scan_id
        }

    except Exception as e:
        db.rollback()
        raise e