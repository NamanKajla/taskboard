
import { useCallback, useEffect, useState } from "react";
import "./App.css";

const API = "/api/tasks";

function App() {
  const [tasks, setTasks] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    todo: 0,
    in_progress: 0,
    done: 0,
  });
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState("Medium");
  const [filter, setFilter] = useState("All");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadTasks = useCallback(async () => {
    try {
      const [taskResponse, statsResponse] = await Promise.all([
        fetch(API),
        fetch(`${API}/stats`),
      ]);

      if (!taskResponse.ok || !statsResponse.ok) {
        throw new Error("Could not load tasks from the API.");
      }

      setTasks(await taskResponse.json());
      setStats(await statsResponse.json());
      setError("");
    } catch {
      setError("Unable to connect to TaskBoard. Check that the backend is running.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    Promise.resolve().then(() => {
      if (!cancelled) return loadTasks();
    });

    return () => {
      cancelled = true;
    };
  }, [loadTasks]);

  async function createTask(event) {
    event.preventDefault();
    if (!title.trim()) return;

    try {
      const response = await fetch(API, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: title.trim(), description, priority }),
      });

      if (!response.ok) throw new Error("Task creation failed.");

      setTitle("");
      setDescription("");
      setPriority("Medium");
      await loadTasks();
    } catch (err) {
      setError(err.message);
    }
  }

  async function updateTask(task, changes) {
    try {
      const response = await fetch(`${API}/${task.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(changes),
      });

      if (!response.ok) throw new Error("Task update failed.");
      await loadTasks();
    } catch (err) {
      setError(err.message);
    }
  }

  async function deleteTask(task) {
    if (!window.confirm(`Delete "${task.title}"?`)) return;

    try {
      const response = await fetch(`${API}/${task.id}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Task deletion failed.");
      await loadTasks();
    } catch (err) {
      setError(err.message);
    }
  }

  const visibleTasks =
    filter === "All" ? tasks : tasks.filter((task) => task.status === filter);

  return (
    <main className="app-shell">
      <aside className="sidebar">
        <a className="brand" href="/">
          <span className="brand-icon">T</span>
          <span>TaskBoard</span>
        </a>

        <p className="nav-heading">WORKSPACE</p>
        <div className="nav-item active">▦ &nbsp; My Tasks</div>
        <div className="nav-item">◷ &nbsp; Overview</div>

        <div className="sidebar-bottom">
          <span className="avatar">TB</span>
          <div>
            <strong>TaskBoard User</strong>
            <small>Personal workspace</small>
          </div>
        </div>
      </aside>

      <section className="main-content">
        <header className="topbar">
          <span>Workspace / My Tasks</span>
          <span className="online"><i /> System online</span>
        </header>

        <div className="page-content">
          <div className="page-heading">
            <div>
              <p className="eyebrow">YOUR WORKSPACE</p>
              <h1>My Tasks<span>.</span></h1>
              <p className="subtitle">Plan your work. Make progress. Get things done.</p>
            </div>
            <span className="date-chip">
              {new Date().toLocaleDateString("en-IN", {
                day: "numeric",
                month: "short",
                year: "numeric",
              })}
            </span>
          </div>

          <div className="stats-grid">
            <StatCard label="Total tasks" value={stats.total} symbol="▤" />
            <StatCard label="To do" value={stats.todo} symbol="○" />
            <StatCard label="In progress" value={stats.in_progress} symbol="◷" />
            <StatCard label="Completed" value={stats.done} symbol="✓" />
          </div>

          <section className="panel create-panel">
            <div className="panel-heading">
              <div>
                <h2>Create a task</h2>
                <p>Add something you want to accomplish.</p>
              </div>
              <span className="heading-symbol">＋</span>
            </div>

            <form onSubmit={createTask} className="task-form">
              <label>
                Task title
                <input
                  value={title}
                  onChange={(event) => setTitle(event.target.value)}
                  placeholder="e.g. Finish Docker configuration"
                  maxLength={200}
                  required
                />
              </label>

              <label>
                Description
                <input
                  value={description}
                  onChange={(event) => setDescription(event.target.value)}
                  placeholder="Add a few details (optional)"
                />
              </label>

              <div className="form-bottom">
                <label>
                  Priority
                  <select
                    value={priority}
                    onChange={(event) => setPriority(event.target.value)}
                  >
                    <option>Low</option>
                    <option>Medium</option>
                    <option>High</option>
                  </select>
                </label>
                <button className="primary-button" type="submit">
                  + Add task
                </button>
              </div>
            </form>
          </section>

          <section className="panel tasks-panel">
            <div className="panel-heading task-list-heading">
              <div>
                <h2>Task list</h2>
                <p>Keep track of everything on your plate.</p>
              </div>

              <select
                className="filter-select"
                value={filter}
                onChange={(event) => setFilter(event.target.value)}
                aria-label="Filter tasks by status"
              >
                <option>All</option>
                <option>Todo</option>
                <option>In Progress</option>
                <option>Done</option>
              </select>
            </div>

            {error && <p className="error-message">{error}</p>}

            {loading ? (
              <p className="empty-state">Loading your tasks...</p>
            ) : visibleTasks.length === 0 ? (
              <div className="empty-state">
                <span>✳</span>
                <strong>No tasks here yet</strong>
                <p>Create a task above to get started.</p>
              </div>
            ) : (
              <div className="task-list">
                {visibleTasks.map((task) => (
                  <article className="task-row" key={task.id}>
                    <div className="task-details">
                      <strong>{task.title}</strong>
                      {task.description && <p>{task.description}</p>}
                      <div className="task-meta">
                        <span className={`priority ${task.priority.toLowerCase()}`}>
                          {task.priority} priority
                        </span>
                        <span>#{task.id}</span>
                      </div>
                    </div>

                    <div className="task-actions">
                      <select
                        aria-label={`Status for ${task.title}`}
                        value={task.status}
                        onChange={(event) =>
                          updateTask(task, { status: event.target.value })
                        }
                      >
                        <option>Todo</option>
                        <option>In Progress</option>
                        <option>Done</option>
                      </select>
                      <button
                        className="delete-button"
                        onClick={() => deleteTask(task)}
                        aria-label={`Delete ${task.title}`}
                      >
                        Delete
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>

          <footer>TaskBoard · Built for better workdays.</footer>
        </div>
      </section>
    </main>
  );
}

function StatCard({ label, value, symbol }) {
  return (
    <article className="stat-card">
      <div className="stat-top">
        <span>{label}</span>
        <span className="stat-symbol">{symbol}</span>
      </div>
      <strong>{value}</strong>
    </article>
  );
}

export default App;
