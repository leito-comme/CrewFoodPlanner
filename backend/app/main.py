from fastapi import FastAPI
from app.routers import crew
from app.database import engine, Base

app = FastAPI()
app.include_router(crew.router, tags=["crew"])


@app.get("/")
def root():
    return {"message": "crew food planner"}
