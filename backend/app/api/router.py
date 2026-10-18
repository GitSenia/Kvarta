from fastapi import APIRouter

from app.api.v1.endpoints import leads

api_router = APIRouter()
api_router.include_router(leads.router, prefix="/api", tags=["leads"])
