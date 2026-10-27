"""
Tests for tasks API endpoints.
"""
import pytest


@pytest.fixture
def new_task(client):
    """Create a task through the API and return it."""
    response = client.post(
        "/api/tasks",
        json={"title": "Check reorder points", "priority": "high", "dueDate": "2025-12-31"},
    )
    assert response.status_code == 201
    return response.json()


class TestTasksEndpoints:
    """Test suite for task-related endpoints."""

    def test_get_all_tasks(self, client):
        """Test getting all tasks."""
        response = client.get("/api/tasks")
        assert response.status_code == 200
        assert isinstance(response.json(), list)

    def test_create_task(self, client, new_task):
        """Test creating a task."""
        assert new_task["title"] == "Check reorder points"
        assert new_task["priority"] == "high"
        assert new_task["dueDate"] == "2025-12-31"
        assert new_task["status"] == "pending"
        assert "id" in new_task

        ids = [t["id"] for t in client.get("/api/tasks").json()]
        assert new_task["id"] in ids

    def test_create_task_missing_title(self, client):
        """Test that a task without a title is rejected."""
        response = client.post("/api/tasks", json={"dueDate": "2025-12-31"})
        assert response.status_code == 422

    def test_toggle_task(self, client, new_task):
        """Test toggling a task between pending and completed."""
        response = client.patch(f"/api/tasks/{new_task['id']}")
        assert response.status_code == 200
        assert response.json()["status"] == "completed"

        response = client.patch(f"/api/tasks/{new_task['id']}")
        assert response.json()["status"] == "pending"

    def test_delete_task(self, client, new_task):
        """Test deleting a task."""
        response = client.delete(f"/api/tasks/{new_task['id']}")
        assert response.status_code == 200

        ids = [t["id"] for t in client.get("/api/tasks").json()]
        assert new_task["id"] not in ids

    def test_toggle_nonexistent_task(self, client):
        """Test toggling a task that doesn't exist."""
        response = client.patch("/api/tasks/nonexistent-task-999")
        assert response.status_code == 404
        assert "not found" in response.json()["detail"].lower()

    def test_delete_nonexistent_task(self, client):
        """Test deleting a task that doesn't exist."""
        response = client.delete("/api/tasks/nonexistent-task-999")
        assert response.status_code == 404
        assert "not found" in response.json()["detail"].lower()
