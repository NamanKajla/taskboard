from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field
from typing import Literal
from prometheus_fastapi_instrumentator import Instrumentator

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

tasks = {}
next_id = 1

@app.get("/")
def root():
    return {"message": "Welcome to TaskBoard API"}

@app.get("/health")
def health():
    return {"status": "healthy"}

@app.get("/ready")
def ready():
    return {"status": "ready"}

@app.get("/api/tasks")
def list_tasks():
    return list(tasks.values())

@app.get("/api/tasks/stats")
def task_stats():
    all_tasks = list(tasks.values())
    return {
        "total": len(all_tasks),
        "todo": sum(t["status"] == "Todo" for t in all_tasks),
        "in_progress": sum(t["status"] == "In Progress" for t in all_tasks),
        "done": sum(t["status"] == "Done" for t in all_tasks),
    }

@app.get("/api/tasks/{task_id}")
def get_task(task_id: int):
    if task_id not in tasks:
        raise HTTPException(status_code=404, detail="Task not found")
    return tasks[task_id]

@app.post("/api/tasks", status_code=201)
def create_task(task: TaskCreate):
    global next_id
    new_task = {
        "id": next_id,
        **task.model_dump(),
        "status": "Todo",
    }
    tasks[next_id] = new_task
    next_id += 1
    return new_task

@app.put("/api/tasks/{task_id}")
def update_task(task_id: int, update: TaskUpdate):
    if task_id not in tasks:
        raise HTTPException(status_code=404, detail="Task not found")
    tasks[task_id].update(update.model_dump(exclude_unset=True))
    return tasks[task_id]

@app.delete("/api/tasks/{task_id}")
def delete_task(task_id: int):
    if task_id not in tasks:
        raise HTTPException(status_code=404, detail="Task not found")
    del tasks[task_id]
    return {"message": "Task deleted"}
