import json
from collections import defaultdict
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.redis_queue import RedisClient
from app.core.middleware import protect
from app.api.fix.schemas import FixRequest, FixResponse, FixResultRequest
from app.db.base import get_db
from app.db.models import ScanSummary, ScanResult
from app.api.analyzer.controller import get_cvss_severity

router = APIRouter(prefix="/api/fix", tags=["Fix"])

redis_client = RedisClient()

QUEUE_NAME = "fix_queue"

FIX_TYPE_TO_ISSUE_KEY = {
    # Network Security
    "unexpected_port": "Unexpected open port",
    "risky_port": "Risky port exposed",

    # App Security
    "missing_csp": "Missing CSP header",
    "missing_hsts": "Missing HSTS header",
    "missing_x_frame": "Missing X-Frame-Options",
    "missing_x_content": "Missing X-Content-Type-Options",
    "http_without_https": "HTTP without HTTPS",

    # TLS Security
    "expired_tls": "Expired TLS",
    "weak_tls": "Weak TLS version",
    "tls_missing_443": "443 open without TLS",

    # DNS Security
    "missing_ns": "Missing NS record",
    "missing_mx": "Missing MX record",
    "missing_txt": "Missing TXT record",
    "duplicate_spf": "Duplicate SPF record",
    "weak_spf": "Weak SPF policy",
    "missing_spf": "Missing SPF record",
    "missing_dmarc": "Missing DMARC",
    "weak_dmarc": "Weak DMARC policy",
    "missing_dkim": "Missing DKIM",
}

FIX_TYPE_TO_CATEGORY = {
    # Network Security
    "unexpected_port": "network_security",
    "risky_port": "network_security",
    # App Security
    "missing_csp": "app_security",
    "missing_hsts": "app_security",
    "missing_x_frame": "app_security",
    "missing_x_content": "app_security",
    "http_without_https": "app_security",
    # TLS Security
    "expired_tls": "tls_security",
    "weak_tls": "tls_security",
    "tls_missing_443": "tls_security",
    # DNS Security
    "missing_ns": "dns_security",
    "missing_mx": "dns_security",
    "missing_txt": "dns_security",
    "duplicate_spf": "dns_security",
    "weak_spf": "dns_security",
    "missing_spf": "dns_security",
    "missing_dmarc": "dns_security",
    "weak_dmarc": "dns_security",
    "missing_dkim": "dns_security",
}

ISSUE_KEY_TO_PENALTY = {
    # DNS scoring rules
    "Missing NS record": 2,
    "Missing MX record": 2,
    "Missing TXT record": 1,
    # Application scoring rules
    "HTTP without HTTPS": 20,
    "Missing CSP header": 3,
    "Missing HSTS header": 4,
    "Missing X-Frame-Options": 2,
    "Missing X-Content-Type-Options": 2,
    # Network scoring rules
    "Risky port exposed": 10,
    "Unexpected open port": 8,
    # TLS scoring rules
    "443 open without TLS": 20,
    "Expired TLS": 20,
    "Weak TLS version": 15,
    "Duplicate SPF record": 3,
    "Weak SPF policy": 1,
    "Missing SPF record": 5,
    "Missing DMARC": 5,
    "Weak DMARC policy": 3,
    "Missing DKIM": 3,
}

def is_fix_successful(result) -> bool:
    if isinstance(result, bool):
        return result
    if isinstance(result, str):
        return result.strip().lower() in {"success", "succeeded", "ok", "true"}
    if isinstance(result, dict):
        for key in ("success", "is_success", "fixed"):
            if key in result:
                return bool(result[key])
        status = str(result.get("status", "")).strip().lower()
        if status:
            return status in {"success", "succeeded", "ok"}
    return False


def remove_fixed_issue(summary_row: ScanSummary, issue_key: str, domain: str, category: str) -> bool:
    allowed_categories = {"app_security", "network_security", "tls_security", "dns_security"}
    if category not in allowed_categories:
        return False

    category_data = getattr(summary_row, category, None) or {}
    findings = list(category_data.get(issue_key, []))
    if not findings:
        return False

    updated_findings = [f for f in findings if f.get("subdomain") != domain]
    if len(updated_findings) == len(findings):
        return False

    if updated_findings:
        category_data[issue_key] = updated_findings
    else:
        category_data.pop(issue_key, None)

    setattr(summary_row, category, category_data or None)
    return True


def recalculate_summary_score(summary: ScanSummary, scan_result: ScanResult):
    subdomain_penalty = defaultdict(int)

    category_blocks = [
        summary.app_security or {},
        summary.network_security or {},
        summary.tls_security or {},
        summary.dns_security or {},
    ]

    for block in category_blocks:
        for issue_key, findings in block.items():
            penalty = ISSUE_KEY_TO_PENALTY.get(issue_key, 0)
            if penalty <= 0:
                continue
            for finding in findings or []:
                subdomain = finding.get("subdomain")
                if subdomain:
                    subdomain_penalty[subdomain] += penalty

    raw_subdomains = ((scan_result.results or {}).get("data", {}) or {}).get("subdomains", [])
    subdomain_names = [s.get("subdomain") for s in raw_subdomains if s.get("subdomain")]
    if not subdomain_names:
        subdomain_names = list(subdomain_penalty.keys())

    if not subdomain_names:
        return

    scores = [max(100 - subdomain_penalty.get(name, 0), 0) for name in subdomain_names]
    domain_score = int(sum(scores) / len(scores))
    summary.domain_score = domain_score
    summary.severity = get_cvss_severity(domain_score)["severity"]


CATEGORY_COL_TO_VULN_KEY = {
    "app_security": "Application Security",
    "network_security": "Network Security",
    "tls_security": "TLS Security",
    "dns_security": "DNS Security",
}


def sync_categorized_vulnerabilities(summary: ScanSummary):
    """Rebuild categorized_vulnerabilities from the individual category columns."""
    cat_vulns = dict(summary.categorized_vulnerabilities or {})

    for col_name, vuln_key in CATEGORY_COL_TO_VULN_KEY.items():
        col_data = getattr(summary, col_name, None) or {}
        if col_data:
            cat_vulns[vuln_key] = dict(col_data)
        else:
            cat_vulns.pop(vuln_key, None)

    summary.categorized_vulnerabilities = cat_vulns or None


def rebuild_category_scores(summary: ScanSummary):
    """Rebuild category_scores from remaining penalties."""
    scores = dict(summary.category_scores or {})
    
    penalty_map = {
        "app_security": ("Application Security", {
            "HTTP without HTTPS": 20, "Missing CSP header": 3,
            "Missing HSTS header": 4, "Missing X-Frame-Options": 2,
            "Missing X-Content-Type-Options": 2,
        }),
        "network_security": ("Network Security", {
            "Risky port exposed": 10, "Unexpected open port": 8,
        }),
        "tls_security": ("TLS Security", {
            "443 open without TLS": 20, "Expired TLS": 20,
            "Weak TLS version": 15,
        }),
        "dns_security": ("DNS Health", {
            "Missing NS record": 5, "Missing MX record": 2,
            "Missing TXT record": 1, "Duplicate SPF record": 3,
            "Weak SPF policy": 1, "Missing SPF record": 5,
            "Missing DMARC": 5, "Weak DMARC policy": 3,
            "Missing DKIM": 3,
        }),
    }
    
    for col_name, (score_key, penalties) in penalty_map.items():
        col_data = getattr(summary, col_name, None) or {}
        total_penalty = 0
        for issue_key, findings in col_data.items():
            p = penalties.get(issue_key, 0)
            total_penalty += p * len(findings or [])
        scores[score_key] = max(0, 100 - total_penalty)
    
    summary.category_scores = scores


@router.post("/submit", response_model=FixResponse)
def submit_fix(
    request: FixRequest,
    current_user: dict = Depends(protect)
):
    fix_job = {
        "scan_id": request.scan_id,
        "domain": request.domain,
        "fix_type": request.fix_type,
        "data": {
            "category": request.data.get("category", "") if isinstance(request.data, dict) else "",
            "subdomain": request.data.get("subdomain", request.domain) if isinstance(request.data, dict) else request.domain,
            "port": request.data.get("port") if isinstance(request.data, dict) else None,
        }
    }
    try:
        redis_client.redis.rpush(QUEUE_NAME, json.dumps(fix_job))
    except Exception:
        raise HTTPException(
            status_code=503,
            detail="Redis connection failed. Please try again later."
        )

    return FixResponse(
        message="Fix request queued successfully",
        scan_id=request.scan_id,
        reload=False,
    )


@router.post("/result", response_model=FixResponse)
async def submit_fix_result(
    request: FixResultRequest,
    db: Session = Depends(get_db),
):
    should_reload = False
    try:
        if request.result:
            issue_key = FIX_TYPE_TO_ISSUE_KEY.get(request.fix_type)
            category = FIX_TYPE_TO_CATEGORY.get(request.fix_type)
            if issue_key and category:
                summary = db.query(ScanSummary).filter(
                    ScanSummary.scan_id == request.scan_id,
                ).first()
                if summary:
                    issue_removed = remove_fixed_issue(summary, issue_key, request.domain, category)
                    if issue_removed:
                        sync_categorized_vulnerabilities(summary)
                        
                        scan_result = db.query(ScanResult).filter(
                            ScanResult.scan_id == request.scan_id,
                        ).first()
                        if scan_result:
                            recalculate_summary_score(summary, scan_result)
                        
                        rebuild_category_scores(summary)
                        
                        db.add(summary)
                        db.commit()
                        should_reload = True
    except Exception:
        db.rollback()
        raise HTTPException(
            status_code=500,
            detail="Failed to update scan summary after fix result"
        )

    return FixResponse(
        message="Fix result stored successfully",
        scan_id=request.scan_id,
        reload=should_reload,
    )
