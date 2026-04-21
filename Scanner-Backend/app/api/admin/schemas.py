from pydantic import BaseModel, EmailStr


class BlacklistEmailRequest(BaseModel):
    email: EmailStr


class CreateAdminRequest(BaseModel):
    email: EmailStr
