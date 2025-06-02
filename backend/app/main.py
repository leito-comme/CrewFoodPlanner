from fastapi import FastAPI, APIRouter
from app.users.router import router as users_router
from app.crew.router import router as crew_router
from app.shipping.router import router as shipping_router
from app.recipes.router import router as recipes_router
from fastapi.middleware.cors import CORSMiddleware


app = FastAPI()

origins = [
    "http://localhost:5173",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

router = APIRouter(redirect_slashes=False)

app.include_router(users_router)
app.include_router(crew_router, tags=["crew"])
app.include_router(shipping_router, tags=["shipping"])
app.include_router(recipes_router, tags=["recipes"])


@app.get("/")
def root():
    return {"message": "crew food planner"}
