from aiogram import types
from aiogram.filters import CommandStart

from app.db.services.db_f import add_to_telegram
from app.tgbot.bot import dp
from logger import get_logger

logger = get_logger(__name__)


@dp.message(CommandStart())
async def on_start(message: types.Message) -> None:
    user = message.from_user
    if user is None:
        return

    try:
        created = await add_to_telegram(str(user.id))
        if created:
            await message.answer(
                "Вы подписаны на заявки «Кварта».\n"
                "Новые заявки с сайта будут приходить сюда."
            )
        else:
            await message.answer("Вы уже в списке менеджеров. Заявки будут приходить сюда.")
    except Exception as exc:
        logger.error("Ошибка /start для %s: %s", user.id, exc)
        await message.answer("Не удалось сохранить подписку. Попробуйте ещё раз позже.")
