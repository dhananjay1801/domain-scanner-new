from sqlalchemy import inspect, text

from .base import engine
from .models import Base


def _migrate_malware_scan_results():
    """Drop and recreate malware_scan_results if its schema is outdated."""
    inspector = inspect(engine)
    if "malware_scan_results" not in inspector.get_table_names():
        return

    columns = {col["name"] for col in inspector.get_columns("malware_scan_results")}
    # New schema uses composite PK (org_id, domain) and has no id/scan_id columns.
    if "id" not in columns and "scan_id" not in columns:
        return

    with engine.begin() as conn:
        conn.execute(text("DROP TABLE malware_scan_results CASCADE"))


def _migrate_users_email_verification():
    """Add email verification columns for existing DBs; drop legacy pending_registrations."""
    inspector = inspect(engine)
    if "users" not in inspector.get_table_names():
        return

    columns = {col["name"] for col in inspector.get_columns("users")}
    stmts = []
    if "email_verified" not in columns:
        stmts.append(
            "ALTER TABLE users ADD COLUMN email_verified BOOLEAN NOT NULL DEFAULT true"
        )
    if "verification_token" not in columns:
        stmts.append("ALTER TABLE users ADD COLUMN verification_token VARCHAR(255)")
    if "verification_expires_at" not in columns:
        stmts.append("ALTER TABLE users ADD COLUMN verification_expires_at TIMESTAMP")
    if "pending_registration_domain" not in columns:
        stmts.append(
            "ALTER TABLE users ADD COLUMN pending_registration_domain TEXT"
        )

    with engine.begin() as conn:
        for stmt in stmts:
            conn.execute(text(stmt))
        conn.execute(
            text(
                "CREATE UNIQUE INDEX IF NOT EXISTS ix_users_verification_token "
                "ON users (verification_token) WHERE verification_token IS NOT NULL"
            )
        )
        conn.execute(text("DROP TABLE IF EXISTS pending_registrations CASCADE"))


def _migrate_assessment_results_to_user_answers():
    """Drop legacy assessment_results (JSON snapshot table) if present."""
    inspector = inspect(engine)
    if "assessment_results" not in inspector.get_table_names():
        return
    with engine.begin() as conn:
        conn.execute(text("DROP TABLE IF EXISTS assessment_results CASCADE"))


def _migrate_user_assessment_answers_to_single_row():
    """Drop normalized per-question table; replaced by user_assessment (one row per user)."""
    inspector = inspect(engine)
    if "user_assessment_answers" not in inspector.get_table_names():
        return
    with engine.begin() as conn:
        conn.execute(text("DROP TABLE IF EXISTS user_assessment_answers CASCADE"))


def init_tables():
    _migrate_malware_scan_results()
    _migrate_assessment_results_to_user_answers()
    _migrate_user_assessment_answers_to_single_row()
    Base.metadata.create_all(bind=engine)
    _migrate_users_email_verification()
