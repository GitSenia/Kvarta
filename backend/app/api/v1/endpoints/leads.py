from fastapi import APIRouter, BackgroundTasks, status

from app.db.services.db_f import insert_into_leads
from app.schemas.Leads import LeadCreate, LeadResponse
from app.tgbot.notify import send_lead_to_telegram

router = APIRouter()


@router.post(
    "/lead",
    response_model=LeadResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Создать заявку",
)
async def create_lead(
    lead: LeadCreate,
    background_tasks: BackgroundTasks,
) -> LeadResponse:
    created = await insert_into_leads(lead)
    # Дубль в Telegram не блокирует ответ клиенту
    background_tasks.add_task(send_lead_to_telegram, created)
    return LeadResponse.model_validate(created)
