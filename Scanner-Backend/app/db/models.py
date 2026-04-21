import uuid
from sqlalchemy import Column, String, Text, Integer, Boolean, ForeignKey, TIMESTAMP, Index
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.sql import func
from app.db.base import Base

class Organization(Base):
    __tablename__ = "organizations"

    org_id = Column(String(36), primary_key=True)
    user_id = Column(String(36), ForeignKey("users.user_id"), nullable=False)
    domain = Column(JSONB, nullable=True)
    max_domains = Column(Integer, default=1, nullable=False)

class User(Base):
    __tablename__ = "users"

    user_id = Column(String(36), primary_key=True)
    org_id = Column(String(36), ForeignKey("organizations.org_id"), nullable=True)
    email = Column(String(255), unique=True, nullable=False)
    password = Column(String(255), nullable=False)
    role = Column(String(20), nullable=False, default="owner")
    created_at = Column(TIMESTAMP, server_default=func.now())
    email_verified = Column(Boolean, nullable=False, server_default="true")
    verification_token = Column(String(255), unique=True, nullable=True)
    verification_expires_at = Column(TIMESTAMP, nullable=True)
    pending_registration_domain = Column(Text, nullable=True)

class Invitation(Base):
    __tablename__ = "invitations"

    invite_id = Column(String(36), primary_key=True)
    org_id = Column(String(36), ForeignKey("organizations.org_id"), nullable=False)
    email = Column(String(255), nullable=False)
    token = Column(String(255), unique=True, nullable=False)
    status = Column(String(20), nullable=False, default="pending")
    invited_by = Column(String(36), ForeignKey("users.user_id"), nullable=False)
    expires_at = Column(TIMESTAMP, nullable=False)

class PasswordResetOTP(Base):
    __tablename__ = "password_reset_otps"

    user_id = Column(String(36), ForeignKey("users.user_id"), primary_key=True)
    otp_hash = Column(String(255), nullable=False)
    expires_at = Column(TIMESTAMP, nullable=False)
    created_at = Column(TIMESTAMP, server_default=func.now())

class PromoCode(Base):
    __tablename__ = "promo_codes"

    code_id = Column(String(36), primary_key=True)
    code = Column(String(50), unique=True, nullable=False)
    is_used = Column(Boolean, default=False, nullable=False)
    used_at = Column(TIMESTAMP, nullable=True)
    used_by = Column(String(36), ForeignKey("users.user_id"), nullable=True)

class Blacklist(Base):
    __tablename__ = "blacklist"

    email = Column(String(255), primary_key=True)
    blocked_by = Column(String(36), ForeignKey("users.user_id"), nullable=False)
    created_at = Column(TIMESTAMP, server_default=func.now())

class UserAssessment(Base):
    __tablename__ = "user_assessments"

    user_id = Column(String(36), ForeignKey("users.user_id"), primary_key=True)
    authentication = Column(JSONB, nullable=True)
    web_browsing = Column(JSONB, nullable=True)
    emails = Column(JSONB, nullable=True)
    messaging = Column(JSONB, nullable=True)
    social_media = Column(JSONB, nullable=True)
    networks = Column(JSONB, nullable=True)
    mobile_devices = Column(JSONB, nullable=True)
    personal_computers = Column(JSONB, nullable=True)
    smart_home = Column(JSONB, nullable=True)
    personal_finance = Column(JSONB, nullable=True)
    human_aspect = Column(JSONB, nullable=True)
    physical_security = Column(JSONB, nullable=True)



class ScanSummary(Base):
    __tablename__ = "scan_summary"

    domain = Column(Text, primary_key=True)
    org_id = Column(String(36), ForeignKey("organizations.org_id"), nullable=False)
    domain_score = Column(Integer)
    severity = Column(String)
    mail_security = Column(JSONB, nullable=True)
    app_security = Column(JSONB, nullable=True)
    network_security = Column(JSONB, nullable=True)
    tls_security = Column(JSONB, nullable=True)
    dns_security = Column(JSONB, nullable=True)
    ips = Column(JSONB, nullable=True)

    __table_args__ = (
        Index("idx_scan_summary_score", "domain_score"),
    )


class ScanScoreHistory(Base):
    __tablename__ = "scan_score_history"

    _id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    org_id = Column(String(36), ForeignKey("organizations.org_id"), nullable=False)
    domain = Column(Text, nullable=False)
    domain_score = Column(Integer, nullable=False)
    result = Column(JSONB, nullable=True)
    scan_date = Column(TIMESTAMP, server_default=func.now(), nullable=False)


class MalwareScanResult(Base):

    __tablename__ = "malware_scan_results"

    scan_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    org_id = Column(String(36), ForeignKey("organizations.org_id"), nullable=False)
    domain = Column(Text, nullable=False)
    result = Column(JSONB, nullable=False)
    created_at = Column(TIMESTAMP, server_default=func.now(), nullable=False)

    __table_args__ = (
        Index("idx_malware_scan_org_domain", "org_id", "domain"),
        Index("idx_malware_scan_org_created", "org_id", "created_at"),
    )
