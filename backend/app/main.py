from fastapi import FastAPI, APIRouter
from app.routers import crew
from fastapi.middleware.cors import CORSMiddleware

router = APIRouter(redirect_slashes=False)

app = FastAPI(router=router)
app.include_router(crew.router, tags=["crew"])

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def root():
    return {"message": "crew food planner"}
