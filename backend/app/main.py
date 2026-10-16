
from fastapi import FastAPI, HTTPException, Depends
from pydantic import BaseModel, Field
from typing import Literal
from sqlalchemy.orm import Session
from prometheus_fastapi_instrumentator import Instrumentator

from app.database import get_db
from app.models import Task

app = FastAPI(title="TaskBoard API", version="1.0.0")
Instrumentator().instrument(app).expose(app)


class TaskCreate(BaseModel):
    title: str = Field(min_length=1, max_length=200)
    description: str = ""
    priority: Literal["Low", "Medium", "High"] = "Medium"


class TaskUpdate(BaseModel):
    title: str | None = Field(default=None, min_length=1, max_length=200)
    description: str | None = None
    priority: Literal["Low", "Medium", "High"] | None = None
    status: Literal["Todo", "In Progress", "Done"] | None = None


def serialize_task(task: Task):
    return {
        "id": task.id,
        "title": task.title,
        "description": task.description,
        "priority": task.priority,
        "status": task.status,
        "created_at": task.created_at.isoformat() if task.created_at else None,
    }


@app.get("/")
def root():
    return {"message": "Welcome to TaskBoard API"}


@app.get("/health")
def health():
    return {"status": "healthy"}


@app.get("/ready")
def ready(db: Session = Depends(get_db)):
    try:
        db.execute(__import__("sqlalchemy").text("SELECT 1"))
        return {"status": "ready"}
    except Exception:
        raise HTTPException(status_code=503, detail="Database unavailable")


@app.get("/api/tasks")
def list_tasks(db: Session = Depends(get_db)):
    return [serialize_task(task) for task in db.query(Task).order_by(Task.id).all()]


@app.get("/api/tasks/stats")
def task_stats(db: Session = Depends(get_db)):
    tasks = db.query(Task).all()
    return {
        "total": len(tasks),
        "todo": sum(t.status == "Todo" for t in tasks),
        "in_progress": sum(t.status == "In Progress" for t in tasks),
        "done": sum(t.status == "Done" for t in tasks),
    }


@app.get("/api/tasks/{task_id}")
def get_task(task_id: int, db: Session = Depends(get_db)):
    task = db.get(Task, task_id)
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    return serialize_task(task)


@app.post("/api/tasks", status_code=201)
def create_task(task_data: TaskCreate, db: Session = Depends(get_db)):
    task = Task(**task_data.model_dump(), status="Todo")
    db.add(task)
    db.commit()
    db.refresh(task)
    return serialize_task(task)


@app.put("/api/tasks/{task_id}")
def update_task(task_id: int, update: TaskUpdate, db: Session = Depends(get_db)):
    task = db.get(Task, task_id)
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    for key, value in update.model_dump(exclude_unset=True).items():
        setattr(task, key, value)

    db.commit()
    db.refresh(task)
    return serialize_task(task)


@app.delete("/api/tasks/{task_id}")
def delete_task(task_id: int, db: Session = Depends(get_db)):
    task = db.get(Task, task_id)
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    db.delete(task)
    db.commit()
    return {"message": "Task deleted"}
