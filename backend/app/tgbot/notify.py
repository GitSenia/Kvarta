import asyncio

from app.db.models.Leads import Lead
from app.db.services.db_f import get_from_telegram
from app.schemas.TelegramManager import LeadTelegramNotify
from app.tgbot.bot import bot
from logger import get_logger

logger = get_logger(__name__)


def _format_lead(data: LeadTelegramNotify) -> str:
    comment = data.comment or "—"
    utm_parts = [
        f"source={data.utm_source}" if data.utm_source else None,
        f"medium={data.utm_medium}" if data.utm_medium else None,
        f"campaign={data.utm_campaign}" if data.utm_campaign else None,
        f"content={data.utm_content}" if data.utm_content else None,
    ]
    utm = ", ".join(p for p in utm_parts if p) or "нет"
    path = data.landing_path or "—"

    return (
        "<b>Новая заявка — Кварта</b>\n"
        f"Имя: {data.name}\n"
        f"Телефон: {data.phone}\n"
        f"Интерес: {data.interest}\n"
        f"Комментарий: {comment}\n"

    )


async def send_lead_to_telegram(lead: Lead) -> None:
    """Дублирует заявку всем менеджерам, подписанным через /start."""
    payload = LeadTelegramNotify.model_validate(lead)
    text = _format_lead(payload)

    try:
        managers = await get_from_telegram()
    except Exception as exc:
        logger.error("Не удалось получить менеджеров: %s", exc)
        return

    if not managers:
        logger.warning("Нет подписанных менеджеров — заявка #%s только в БД", lead.id)
        return

    async def _send(chat_id: str) -> None:
        try:
            await bot.send_message(chat_id=int(chat_id), text=text)
        except Exception as exc:
            logger.error("Не отправилось в chat_id=%s: %s", chat_id, exc)

    await asyncio.gather(*[_send(chat_id) for chat_id in managers])
    logger.info("Заявка #%s отправлена %s менеджерам", lead.id, len(managers))
