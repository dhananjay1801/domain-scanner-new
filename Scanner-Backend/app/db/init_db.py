from .base import engine
from .models import Base
from sqlalchemy import text


def init_tables():
    Base.metadata.create_all(bind=engine)
    
    tables_cols = [
        ("users", "name", "VARCHAR(255)"),
        ("assessment_results", "user_id", "VARCHAR(36)"),
        ("scan_request", "user_id", "VARCHAR(36)"),
        ("scan_result", "user_id", "VARCHAR(36)"),
        ("scan_summary", "user_id", "VARCHAR(36)"),
        ("scan_summary", "ips", "JSONB"),
        ("scan_summary", "domain", "VARCHAR"),
        ("scan_summary", "mail_security", "JSONB"),
        ("scan_summary", "app_security", "JSONB"),
        ("scan_summary", "network_security", "JSONB"),
        ("scan_summary", "tls_security", "JSONB"),
        ("scan_summary", "dns_security", "JSONB")
    ]
    
    with engine.connect() as conn:
        for table, col_name, col_type in tables_cols:
            result = conn.execute(text(
                f"SELECT column_name FROM information_schema.columns "
                f"WHERE table_name='{table}' AND column_name='{col_name}'"
            ))
            if not result.fetchone():
                try:
                    conn.execute(text(f"ALTER TABLE {table} ADD COLUMN {col_name} {col_type}"))
                    conn.commit()
                    print(f"Added '{col_name}' column to {table} table")
                except Exception as e:
                    print(f"Failed to add column {col_name} to {table}: {e}")
                    conn.rollback()