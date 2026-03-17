from fastapi import APIRouter
from api.v1.endpoints import (
    login,
    users,
    projects,
    choirs,
    works,
    assets,
    invites,
    academy,
    progress,
    choir_management,
    pipeline
)

api_router = APIRouter()
api_router.include_router(login.router, tags=["login"])
api_router.include_router(users.router, prefix="/users", tags=["users"])
api_router.include_router(projects.router, prefix="/projects", tags=["projects"])
api_router.include_router(choirs.router, prefix="/choirs", tags=["choirs"])
api_router.include_router(works.router, prefix="/works", tags=["works"])
api_router.include_router(assets.router, prefix="/assets", tags=["assets"])
api_router.include_router(invites.router, prefix="/invites", tags=["invites"])
api_router.include_router(academy.router, prefix="/academy", tags=["academy"])
api_router.include_router(progress.router, prefix="/progress", tags=["progress"])
api_router.include_router(choir_management.router, prefix="/management/choir", tags=["choir-management"])
api_router.include_router(pipeline.router, prefix="/pipeline", tags=["pipeline"])
