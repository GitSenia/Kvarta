import re
from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field, field_validator

from app.db.models.Leads import LeadInterest

# Операторы мобильной связи РБ
_BY_OPERATORS = {"25", "29", "33", "44"}


def normalize_by_phone(value: str) -> str:
    """Приводит номер к виду +375XXXXXXXXX и проверяет белорусский мобильный."""
    digits = re.sub(r"\D", "", value)

    if digits.startswith("80") and len(digits) == 11:
        digits = "375" + digits[2:]
    elif digits.startswith("0") and len(digits) == 10:
        digits = "375" + digits[1:]

    if len(digits) == 12 and digits.startswith("375"):
        operator = digits[3:5]
        if operator in _BY_OPERATORS:
            return f"+{digits}"

    raise ValueError(
        "Укажите белорусский мобильный номер в формате +375 XX XXX XX XX "
        "(операторы 25, 29, 33, 44)"
    )


class LeadCreate(BaseModel):
    """Тело запроса на создание заявки."""

    name: str = Field(..., min_length=1, max_length=120)
    phone: str = Field(..., min_length=7, max_length=32)
    interest: LeadInterest
    comment: str | None = Field(default=None, max_length=2000)

    utm_source: str | None = Field(default=None, max_length=255)
    utm_medium: str | None = Field(default=None, max_length=255)
    utm_campaign: str | None = Field(default=None, max_length=255)
    utm_content: str | None = Field(default=None, max_length=255)
    utm_term: str | None = Field(default=None, max_length=255)

    landing_path: str | None = Field(default=None, max_length=512)
    referrer: str | None = Field(default=None, max_length=1024)
    user_agent: str | None = Field(default=None, max_length=512)

    @field_validator("phone")
    @classmethod
    def validate_phone(cls, value: str) -> str:
        return normalize_by_phone(value)

    @field_validator("name")
    @classmethod
    def strip_name(cls, value: str) -> str:
        cleaned = value.strip()
        if not cleaned:
            raise ValueError("Укажите имя")
        return cleaned


class LeadResponse(BaseModel):
    """Ответ после создания / чтения заявки."""

    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    phone: str
    interest: LeadInterest
    comment: str | None = None

    utm_source: str | None = None
    utm_medium: str | None = None
    utm_campaign: str | None = None
    utm_content: str | None = None
    utm_term: str | None = None

    landing_path: str | None = None
    referrer: str | None = None
    user_agent: str | None = None

    created_at: datetime
