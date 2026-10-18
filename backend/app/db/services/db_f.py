from datetime import datetime, timedelta, timezone

from fastapi import HTTPException
from sqlalchemy import select

from app.db.base import Session
from app.db.models.Leads import Lead
from app.schemas.Leads import LeadCreate

DEDUP_MINUTES = 10


async def insert_into_leads(payload: LeadCreate) -> Lead:
    async with Session() as session:
        since = datetime.now(timezone.utc) - timedelta(minutes=DEDUP_MINUTES)
        existing = await session.scalar(
            select(Lead)
            .where(Lead.phone == payload.phone, Lead.created_at >= since)
            .order_by(Lead.created_at.desc())
            .limit(1)
        )
        if existing is not None:
            raise HTTPException(
                status_code=409,
                detail="Заявка с этим номером уже принята. Подождите 10 минут или дождитесь звонка менеджера.",
            )

        lead = Lead(
            name=payload.name,
            phone=payload.phone,
            interest=payload.interest.value,
            comment=payload.comment,
            utm_source=payload.utm_source,
            utm_medium=payload.utm_medium,
            utm_campaign=payload.utm_campaign,
            utm_content=payload.utm_content,
            utm_term=payload.utm_term,
            landing_path=payload.landing_path,
            referrer=payload.referrer,
            user_agent=payload.user_agent,
        )
        session.add(lead)
        await session.commit()
        await session.refresh(lead)
        return lead

