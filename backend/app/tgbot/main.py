"""Aiogram handlers + polling. Импортируется из app.main lifespan."""

from app.tgbot import handlers  # noqa: F401 — регистрация хендлеров
from app.tgbot.bot import bot, dp
from app.tgbot.notify import send_lead_to_telegram

__all__ = ["bot", "dp", "send_lead_to_telegram"]
