from fastapi import FastAPI, APIRouter
from app.crew.router import router as crew_router
from fastapi.middleware.cors import CORSMiddleware


app = FastAPI()

origins = [
    "http://localhost:5173",  # твой Vite фронтенд
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,  # Можно поставить ["*"] для разрешения всех, но лучше явно указать
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

router = APIRouter(redirect_slashes=False)

app.include_router(crew_router, tags=["crew"])


@app.get("/")
def root():
    return {"message": "crew food planner"}
