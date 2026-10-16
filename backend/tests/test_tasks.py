def test_health(client):
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json() == {"status": "healthy"}


def test_list_tasks_empty(client):
    response = client.get("/api/tasks")
    assert response.status_code == 200
    assert response.json() == []


def test_create_task(client):
    response = client.post(
        "/api/tasks",
        json={
            "title": "Learn Docker",
            "description": "Understand containers",
            "priority": "High",
        },
    )
    assert response.status_code == 201
    assert response.json()["title"] == "Learn Docker"
    assert response.json()["priority"] == "High"
    assert response.json()["status"] == "Todo"


def test_get_task(client):
    created = client.post(
        "/api/tasks",
        json={"title": "Test retrieval"},
    )
    task_id = created.json()["id"]

    response = client.get(f"/api/tasks/{task_id}")
    assert response.status_code == 200
    assert response.json()["title"] == "Test retrieval"


def test_update_task(client):
    created = client.post(
        "/api/tasks",
        json={"title": "Original task"},
    )
    task_id = created.json()["id"]

    response = client.put(
        f"/api/tasks/{task_id}",
        json={"status": "Done"},
    )
    assert response.status_code == 200
    assert response.json()["status"] == "Done"


def test_delete_task(client):
    created = client.post(
        "/api/tasks",
        json={"title": "Delete me"},
    )
    task_id = created.json()["id"]

    response = client.delete(f"/api/tasks/{task_id}")
    assert response.status_code == 200

    missing = client.get(f"/api/tasks/{task_id}")
    assert missing.status_code == 404


def test_task_not_found(client):
    response = client.get("/api/tasks/99999")
    assert response.status_code == 404
