import React, { useState, useEffect, useRef } from "react";
import "./App.css";

/**
 * PUBLIC_INTERFACE
 * The main App component for the To-Do List application.
 * Features:
 * - Add, edit, delete, toggle completion of tasks
 * - Filter (all/completed/incomplete)
 * - Persistent via localStorage
 * - Minimalistic, light, responsive UI
 */
function App() {
  // Task model: { id, text, completed }
  const [tasks, setTasks] = useState([]);
  const [input, setInput] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editingText, setEditingText] = useState("");
  const [filter, setFilter] = useState("all");
  const inputRef = useRef();

  // Load from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem("kavia-tasks");
    if (stored) setTasks(JSON.parse(stored));
  }, []);

  // Persist to localStorage on tasks change
  useEffect(() => {
    localStorage.setItem("kavia-tasks", JSON.stringify(tasks));
  }, [tasks]);

  // PUBLIC_INTERFACE
  function handleAddTask(e) {
    e.preventDefault();
    const text = input.trim();
    if (!text) return;
    setTasks([
      ...tasks,
      { id: Date.now(), text, completed: false }
    ]);
    setInput("");
    inputRef.current.blur();
  }

  // PUBLIC_INTERFACE
  function handleDeleteTask(id) {
    setTasks(tasks.filter((t) => t.id !== id));
    if (editingId === id) setEditingId(null);
  }

  // PUBLIC_INTERFACE
  function handleEditTask(id, text) {
    setEditingId(id);
    setEditingText(text);
  }

  // PUBLIC_INTERFACE
  function handleSaveEdit(id) {
    const trimmed = editingText.trim();
    if (!trimmed) {
      handleDeleteTask(id);
      return;
    }
    setTasks(
      tasks.map((t) =>
        t.id === id ? { ...t, text: trimmed } : t
      )
    );
    setEditingId(null);
  }

  // PUBLIC_INTERFACE
  function handleToggleTask(id) {
    setTasks(
      tasks.map((t) =>
        t.id === id ? { ...t, completed: !t.completed } : t
      )
    );
  }

  // PUBLIC_INTERFACE
  function handleEditInputKey(e, id) {
    if (e.key === "Enter") {
      handleSaveEdit(id);
    } else if (e.key === "Escape") {
      setEditingId(null);
    }
  }

  // PUBLIC_INTERFACE
  function filteredTasks() {
    switch (filter) {
      case "completed":
        return tasks.filter((t) => t.completed);
      case "incomplete":
        return tasks.filter((t) => !t.completed);
      default:
        return tasks;
    }
  }

  // Styling palette (colors requested)
  const COLORS = {
    accent: "#ff9800",
    primary: "#1976d2",
    secondary: "#424242",
    taskBg: "#fafbfc",
    taskBorder: "#e5e7eb",
    complete: "#a5d6a7"
  };

  // Responsive filter section at bottom
  return (
    <div className="container" style={{ background: "#fff", minHeight: "100vh" }}>
      <header className="todo-header" style={{
        borderBottom: `2px solid ${COLORS.primary}`,
        padding: "2rem 0.5rem 1.2rem 0.5rem",
        background: "#fff"
      }}>
        <h1 data-testid="app-title"
          style={{
            color: COLORS.primary,
            fontWeight: 800,
            fontSize: "clamp(1.7rem, 3vw, 2.4rem)",
            letterSpacing: "0.03em",
            margin: "0 0 .3em 0"
          }}
        >
          To-Do List
        </h1>
        <p style={{
          color: COLORS.secondary,
          fontSize: "1em",
          opacity: 0.85,
          margin: 0,
          fontWeight: 500
        }}>
          Organize, manage, and conquer your day.
        </p>
      </header>
      <main style={{
        maxWidth: 480,
        margin: "2rem auto",
        background: "#fff",
        boxShadow: "0 2px 14px 0 rgba(64,64,64,0.08)",
        borderRadius: 18,
        padding: "1.1rem 0.9rem 1rem 0.9rem",
        minHeight: 340
      }}>
        <form onSubmit={handleAddTask} className="task-input-form" style={{ display: "flex", gap: 12, marginBottom: 20 }}>
          <input
            ref={inputRef}
            className="task-input"
            placeholder="Add new task..."
            aria-label="Add new to-do"
            value={input}
            onChange={e => setInput(e.target.value)}
            style={{
              flex: 1,
              padding: "0.8em 1em",
              borderRadius: 9,
              border: `1px solid ${COLORS.primary}`,
              fontSize: 17,
              background: "#f5f8fd"
            }}
            autoFocus
            maxLength={150}
          />
          <button
            className="btn"
            type="submit"
            aria-label="Add task"
            style={{
              background: COLORS.accent,
              color: "#fff",
              border: "none",
              borderRadius: 7,
              fontWeight: 600,
              fontSize: 18,
              padding: "0 1.1em",
              transition: "background 0.2s"
            }}
            disabled={!input.trim()}
          >
            +
          </button>
        </form>
        <ul className="task-list" style={{ listStyle: "none", padding: 0, margin: 0 }}>
          {filteredTasks().length === 0 &&
            <li aria-label="no tasks"
              style={{
                color: "#c9c9c9",
                textAlign: "center",
                padding: "2em 0 1.3em 0",
                fontStyle: "italic"
              }}>
              No tasks {filter === "all" ? "yet" : `in "${filter}"`}
            </li>
          }
          {filteredTasks().map((task) => (
            <li key={task.id}
              className="task-item"
              style={{
                display: "flex",
                alignItems: "center",
                borderBottom: `1px solid ${COLORS.taskBorder}`,
                padding: "0.7em 0"
              }}
            >
              <input
                className="checkbox"
                type="checkbox"
                checked={task.completed}
                aria-label={`Mark as ${task.completed ? "incomplete" : "complete"}`}
                onChange={() => handleToggleTask(task.id)}
                style={{
                  accentColor: COLORS.primary,
                  width: 20,
                  height: 20,
                  marginRight: 12,
                  cursor: "pointer"
                }}
              />
              {editingId === task.id
                ? (
                  <input
                    type="text"
                    className="edit-input"
                    aria-label="Edit task"
                    value={editingText}
                    onChange={e => setEditingText(e.target.value)}
                    onBlur={() => handleSaveEdit(task.id)}
                    onKeyDown={e => handleEditInputKey(e, task.id)}
                    autoFocus
                    style={{
                      flex: 1,
                      border: `1.5px solid ${COLORS.accent}`,
                      borderRadius: 7,
                      fontSize: "1em",
                      padding: "0.5em 0.7em",
                      marginRight: 10
                    }}
                  />
                ) : (
                  <span
                    className="task-text"
                    style={{
                      flex: 1,
                      fontSize: "1.17em",
                      padding: "3px 0",
                      color: task.completed ? "#cdd2d0" : "#202125",
                      textDecoration: task.completed ? "line-through" : "none",
                      marginRight: 10,
                      cursor: "pointer",
                      userSelect: "none"
                    }}
                    tabIndex={0}
                    onClick={() => handleEditTask(task.id, task.text)}
                    onKeyDown={e => {
                      if (e.key === "Enter" || e.key === " ") handleEditTask(task.id, task.text);
                    }}
                    aria-label={`Click to edit: ${task.text}`}
                  >
                    {task.text}
                  </span>
                )
              }
              <button
                className="btn btn-delete"
                aria-label="Delete"
                onClick={() => handleDeleteTask(task.id)}
                style={{
                  background: "transparent",
                  border: "none",
                  color: COLORS.secondary,
                  fontSize: 20,
                  cursor: "pointer",
                  marginLeft: 2,
                  opacity: 0.63
                }}
                title="Delete"
                tabIndex={0}
              >×</button>
            </li>
          ))}
        </ul>
        <section className="filters-section" style={{
          display: "flex",
          justifyContent: "center",
          gap: 9,
          marginTop: 25,
          position: "sticky",
          bottom: 0
        }}>
          {["all", "completed", "incomplete"].map((f) => (
            <button
              key={f}
              className="btn filter-btn"
              aria-pressed={filter === f}
              onClick={() => setFilter(f)}
              style={{
                background: filter === f ? COLORS.primary : "#f1f2f5",
                color: filter === f ? "#fff" : COLORS.secondary,
                border: "none",
                borderRadius: 8,
                padding: "0.6em 1.4em",
                fontSize: "1em",
                fontWeight: filter === f ? 600 : 400,
                outline: filter === f ? `2px solid ${COLORS.accent}` : "none",
                transition: "background 0.15s"
              }}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </section>
      </main>
      <footer className="footer"
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          padding: ".8em 0",
          fontSize: "0.95em",
          color: "#adb5bd",
          background: "#fff"
        }}>
        <span>
          <strong style={{ color: COLORS.primary }}>KAVIA</strong> Simple To-Do
        </span>
        <span>
          Powered by React | Local Storage | Minimal UI
        </span>
      </footer>
    </div>
  );
}

export default App;
