from fastapi import APIRouter
from api.v1.endpoints import login, users, invites, seasons, projects, works, editions, assets, progress, pipeline

api_router = APIRouter()
api_router.include_router(login.router, tags=["login"])
api_router.include_router(users.router, prefix="/users", tags=["users"])
api_router.include_router(invites.router, prefix="/invites", tags=["invites"])
api_router.include_router(seasons.router, prefix="/seasons", tags=["seasons"])
api_router.include_router(projects.router, prefix="/projects", tags=["projects"])
api_router.include_router(works.router, prefix="/works", tags=["works"])
api_router.include_router(editions.router, prefix="/editions", tags=["editions"])
api_router.include_router(assets.router, prefix="/assets", tags=["assets"])
api_router.include_router(progress.router, prefix="/progress", tags=["progress"])
api_router.include_router(pipeline.router, prefix="/pipeline", tags=["pipeline"])
