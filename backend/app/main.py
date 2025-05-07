from fastapi import FastAPI, APIRouter
from app.crew.router import router as crew_router
from fastapi.middleware.cors import CORSMiddleware

router = APIRouter(redirect_slashes=False)

app = FastAPI()


app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(crew_router, tags=["crew"])


@app.get("/")
def root():
    return {"message": "crew food planner"}
