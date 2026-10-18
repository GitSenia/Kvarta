from pydantic import BaseModel, ConfigDict, Field


class LeadTelegramNotify(BaseModel):
    """Данные заявки для дубля в Telegram."""

    name: str
    phone: str
    interest: str
    comment: str | None = None
    utm_source: str | None = None
    utm_medium: str | None = None
    utm_campaign: str | None = None
    utm_content: str | None = None
    landing_path: str | None = None

    model_config = ConfigDict(from_attributes=True)


class TelegramManagerCreate(BaseModel):
    telegram_id: str = Field(..., min_length=1, max_length=64)
