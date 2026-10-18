from fastapi import APIRouter, status

from app.db.services.db_f import insert_into_leads
from app.schemas.Leads import LeadCreate, LeadResponse

router = APIRouter()


@router.post(
    "/lead",
    response_model=LeadResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Создать заявку",
)
async def create_lead(lead: LeadCreate) -> LeadResponse:
    created = await insert_into_leads(lead)
    return LeadResponse.model_validate(created)
