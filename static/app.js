let currentFilter = "all";

const activeTaskList = document.getElementById("activeTaskList");
const completedTaskList = document.getElementById("completedTaskList");
const emptyMessage = document.getElementById("emptyMessage");
const taskForm = document.getElementById("taskForm");
const openFormButton = document.getElementById("openFormButton");
const cancelFormButton = document.getElementById("cancelFormButton");
const completedToggle = document.getElementById("completedToggle");
const completedArrow = document.getElementById("completedArrow");

function formatDate(dateText) {
  return new Date(`${dateText}T00:00:00`).toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric"
  });
}

function taskCard(task) {
  const card = document.createElement("article");
  card.className = `task-card ${task.completed ? "completed" : ""}`;

  card.innerHTML = `
    <input
      class="task-checkbox"
      type="checkbox"
      ${task.completed ? "checked" : ""}
      aria-label="Mark task as complete"
    >

    <div>
      <p class="task-title">${escapeHtml(task.title)}</p>
      <div class="task-tags">
        <span class="badge">${escapeHtml(task.category)}</span>
        <span class="badge">${escapeHtml(task.energy)}</span>
      </div>
    </div>

    <span class="task-date">◷ ${formatDate(task.due_date)}</span>
    <span class="priority-dot ${task.priority}" title="${task.priority} priority"></span>
    <button class="delete-button" aria-label="Delete task">×</button>
  `;

  const checkbox = card.querySelector(".task-checkbox");
  checkbox.addEventListener("change", async () => {
    await updateTask(task.id, { completed: checkbox.checked });
  });

  const deleteButton = card.querySelector(".delete-button");
  deleteButton.addEventListener("click", async () => {
    const confirmed = window.confirm(`Delete "${task.title}"?`);

    if (confirmed) {
      await deleteTask(task.id);
    }
  });

  return card;
}

async function loadTasks() {
  try {
    const response = await fetch(`/api/tasks?status=${currentFilter}`);

    if (!response.ok) {
      throw new Error("Could not load tasks.");
    }

    const tasks = await response.json();

    activeTaskList.innerHTML = "";
    completedTaskList.innerHTML = "";

    const activeTasks = tasks.filter(task => !task.completed);
    const completedTasks = tasks.filter(task => task.completed);

    activeTasks.forEach(task => {
      activeTaskList.appendChild(taskCard(task));
    });

    completedTasks.forEach(task => {
      completedTaskList.appendChild(taskCard(task));
    });

    emptyMessage.classList.toggle("hidden", activeTasks.length !== 0);

    await loadSummary();
  } catch (error) {
    console.error(error);
    emptyMessage.textContent = "Unable to load tasks. Please refresh the page.";
    emptyMessage.classList.remove("hidden");
  }
}

async function loadSummary() {
  const response = await fetch("/api/summary");

  if (!response.ok) {
    return;
  }

  const summary = await response.json();

  document.getElementById("totalCount").textContent = summary.total;
  document.getElementById("pendingCount").textContent = summary.pending;
  document.getElementById("completedCount").textContent = summary.completed;
  document.getElementById("overdueCount").textContent = summary.overdue;
}

async function createTask(event) {
  event.preventDefault();

  const newTask = {
    title: document.getElementById("title").value.trim(),
    due_date: document.getElementById("dueDate").value,
    priority: document.getElementById("priority").value,
    category: document.getElementById("category").value,
    energy: document.getElementById("energy").value
  };

  const response = await fetch("/api/tasks", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(newTask)
  });

  if (!response.ok) {
    const error = await response.json();
    alert(error.error || "Could not create task.");
    return;
  }

  taskForm.reset();
  taskForm.classList.add("hidden");
  await loadTasks();
}

async function updateTask(taskId, updates) {
  const response = await fetch(`/api/tasks/${taskId}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(updates)
  });

  if (!response.ok) {
    alert("Could not update task.");
    return;
  }

  await loadTasks();
}

async function deleteTask(taskId) {
  const response = await fetch(`/api/tasks/${taskId}`, {
    method: "DELETE"
  });

  if (!response.ok) {
    alert("Could not delete task.");
    return;
  }

  await loadTasks();
}

function escapeHtml(text) {
  const temporaryElement = document.createElement("div");
  temporaryElement.textContent = text;
  return temporaryElement.innerHTML;
}

openFormButton.addEventListener("click", () => {
  taskForm.classList.toggle("hidden");
});

cancelFormButton.addEventListener("click", () => {
  taskForm.reset();
  taskForm.classList.add("hidden");
});

taskForm.addEventListener("submit", createTask);

document.querySelectorAll(".tab").forEach(tab => {
  tab.addEventListener("click", () => {
    document.querySelector(".tab.active").classList.remove("active");
    tab.classList.add("active");

    currentFilter = tab.dataset.filter;
    loadTasks();
  });
});

completedToggle.addEventListener("click", () => {
  completedTaskList.classList.toggle("hidden");

  completedArrow.textContent =
    completedTaskList.classList.contains("hidden") ? "▾" : "▴";
});

loadTasks();