import asyncio
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.router import api_router
from app.db.base import init_db
from app.tgbot.bot import bot, dp
from app.tgbot import handlers  # noqa: F401 — регистрация /start
from logger import get_logger

logger = get_logger(__name__)


@asynccontextmanager
async def lifespan(_app: FastAPI):
    await init_db()

    # Polling бота в фоне — проверяющие могут написать боту /start
    polling_task = asyncio.create_task(
        dp.start_polling(bot),
        name="telegram-polling",
    )
    logger.info("Telegram polling запущен")

    try:
        yield
    finally:
        logger.info("Останавливаем Telegram polling…")
        await dp.stop_polling()
        polling_task.cancel()
        try:
            await polling_task
        except asyncio.CancelledError:
            pass
        await bot.session.close()


app = FastAPI(title="Кварта API", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5500",
        "http://127.0.0.1:5500",
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:8080",
        "http://127.0.0.1:8080",
        "null",
    ],
    allow_origin_regex=r"https?://(localhost|127\.0\.0\.1)(:\d+)?",
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router)
