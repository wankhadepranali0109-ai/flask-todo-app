from datetime import date
from flask import Flask, jsonify, render_template, request

app = Flask(__name__)

tasks = [
    {
        "id": 1,
        "title": "Draft project proposal",
        "due_date": "2026-09-10",
        "priority": "high",
        "category": "Work",
        "energy": "deep-focus",
        "completed": False,
    },
    {
        "id": 2,
        "title": "Revise Docker notes",
        "due_date": "2026-09-11",
        "priority": "medium",
        "category": "Learning",
        "energy": "focused",
        "completed": False,
    },
    {
        "id": 3,
        "title": "Buy groceries",
        "due_date": "2026-09-12",
        "priority": "low",
        "category": "Personal",
        "energy": "quick",
        "completed": False,
    },
]


def find_task(task_id):
    return next((task for task in tasks if task["id"] == task_id), None)


@app.get("/")
def home():
    return render_template("index.html")


@app.get("/api/tasks")
def get_tasks():
    status = request.args.get("status", "all")
    today = date.today().isoformat()

    filtered_tasks = tasks

    if status == "today":
        filtered_tasks = [
            task for task in tasks
            if not task["completed"] and task["due_date"] == today
        ]
    elif status == "pending":
        filtered_tasks = [
            task for task in tasks
            if not task["completed"] and task["due_date"] >= today
        ]
    elif status == "overdue":
        filtered_tasks = [
            task for task in tasks
            if not task["completed"] and task["due_date"] < today
        ]
    elif status == "completed":
        filtered_tasks = [task for task in tasks if task["completed"]]

    return jsonify(filtered_tasks)


@app.post("/api/tasks")
def create_task():
    data = request.get_json() or {}

    title = data.get("title", "").strip()
    due_date = data.get("due_date", "")

    if not title or not due_date:
        return jsonify({
            "error": "Task title and due date are required."
        }), 400

    new_task = {
        "id": max((task["id"] for task in tasks), default=0) + 1,
        "title": title,
        "due_date": due_date,
        "priority": data.get("priority", "medium"),
        "category": data.get("category", "Personal"),
        "energy": data.get("energy", "focused"),
        "completed": False,
    }

    tasks.append(new_task)
    return jsonify(new_task), 201


@app.patch("/api/tasks/<int:task_id>")
def update_task(task_id):
    task = find_task(task_id)

    if not task:
        return jsonify({"error": "Task not found."}), 404

    data = request.get_json() or {}

    allowed_fields = [
        "title",
        "due_date",
        "priority",
        "category",
        "energy",
        "completed",
    ]

    for field in allowed_fields:
        if field in data:
            task[field] = data[field]

    return jsonify(task)


@app.delete("/api/tasks/<int:task_id>")
def delete_task(task_id):
    task = find_task(task_id)

    if not task:
        return jsonify({"error": "Task not found."}), 404

    tasks.remove(task)
    return "", 204


@app.get("/api/summary")
def get_summary():
    today = date.today().isoformat()

    return jsonify({
        "total": len(tasks),
        "completed": sum(task["completed"] for task in tasks),
        "pending": sum(not task["completed"] for task in tasks),
        "overdue": sum(
            not task["completed"] and task["due_date"] < today
            for task in tasks
        ),
    })


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8000, debug=True)