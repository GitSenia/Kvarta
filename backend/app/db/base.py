from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine

from app.db.base_class import Base
from config import settings

engine = create_async_engine(url=settings.DATABASE_URL, echo=True)

Session = async_sessionmaker(
    bind=engine,
    class_=AsyncSession,
    autoflush=False,
    expire_on_commit=False,
)


async def init_db() -> None:
    # Регистрируем модели в metadata перед create_all
    from app.db import import_models  # noqa: F401

    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    print("База данных инициализирована, таблицы созданы!")
