from sqlalchemy import Integer, String, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base_class import Base


class TelegramManager(Base):
    """Chat id менеджера, подписавшегося на бота через /start."""

    __tablename__ = "telegram_manager"
    __table_args__ = (UniqueConstraint("telegram_id", name="uq_telegram_manager_id"),)

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    telegram_id: Mapped[str] = mapped_column(String(64), nullable=False)
