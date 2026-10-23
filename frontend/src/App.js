import React, { useState, useEffect, useMemo, useCallback } from 'react';
import todoService from './services/todoService';
import TodoForm from './components/TodoForm';
import TodoItem from './components/TodoItem';
import TodoFilters from './components/TodoFilters';
import ProgressBar from './components/ProgressBar';
import './App.css';

function App() {
  const [todos, setTodos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statusMessage, setStatusMessage] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const announce = (msg) => {
    setStatusMessage(msg);
  };

  const fetchTodos = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await todoService.getTodos();
      setTodos(data);
    } catch (err) {
      console.error('Error fetching todos:', err);
      setError('Could not connect to the backend server. Please verify the server is running.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTodos();
  }, [fetchTodos]);

  const handleAddTodo = async (title) => {
    setError(null);
    try {
      const newTodo = await todoService.createTodo(title);
      setTodos((prev) => [newTodo, ...prev]);
      announce(`Task "${title}" added.`);
    } catch (err) {
      console.error('Error adding todo:', err);
      setError(err.response?.data?.error || 'Failed to add task.');
    }
  };

  const handleToggleTodo = async (id, currentCompleted) => {
    // Optimistic UI update
    const previousTodos = [...todos];
    const target = todos.find((t) => (t._id || t.id) === id);
    const newStatus = !currentCompleted;

    setTodos((prev) =>
      prev.map((t) => ((t._id || t.id) === id ? { ...t, completed: newStatus } : t))
    );

    try {
      const updated = await todoService.updateTodo(id, { completed: newStatus });
      setTodos((prev) =>
        prev.map((t) => ((t._id || t.id) === id ? { ...t, ...updated } : t))
      );
      announce(`Task "${target?.title}" marked as ${newStatus ? 'completed' : 'active'}.`);
    } catch (err) {
      console.error('Error toggling todo:', err);
      setTodos(previousTodos);
      setError('Failed to update task status.');
    }
  };

  const handleUpdateTitle = async (id, newTitle) => {
    const previousTodos = [...todos];
    setTodos((prev) =>
      prev.map((t) => ((t._id || t.id) === id ? { ...t, title: newTitle } : t))
    );

    try {
      const updated = await todoService.updateTodo(id, { title: newTitle });
      setTodos((prev) =>
        prev.map((t) => ((t._id || t.id) === id ? { ...t, ...updated } : t))
      );
      announce(`Task updated to "${newTitle}".`);
    } catch (err) {
      console.error('Error updating todo title:', err);
      setTodos(previousTodos);
      setError('Failed to update task title.');
    }
  };

  const handleDeleteTodo = async (id) => {
    const previousTodos = [...todos];
    const target = todos.find((t) => (t._id || t.id) === id);

    setTodos((prev) => prev.filter((t) => (t._id || t.id) !== id));

    try {
      await todoService.deleteTodo(id);
      announce(`Task "${target?.title}" deleted.`);
    } catch (err) {
      console.error('Error deleting todo:', err);
      setTodos(previousTodos);
      setError('Failed to delete task.');
    }
  };

  const handleClearCompleted = async () => {
    const previousTodos = [...todos];
    const completedCount = todos.filter((t) => t.completed).length;

    setTodos((prev) => prev.filter((t) => !t.completed));

    try {
      await todoService.clearCompleted();
      announce(`${completedCount} completed tasks cleared.`);
    } catch (err) {
      console.error('Error clearing completed todos:', err);
      setTodos(previousTodos);
      setError('Failed to clear completed tasks.');
    }
  };

  const handleToggleAll = async (newCompletedState) => {
    const previousTodos = [...todos];
    setTodos((prev) => prev.map((t) => ({ ...t, completed: newCompletedState })));

    try {
      await todoService.toggleAll(newCompletedState);
      announce(`All tasks marked as ${newCompletedState ? 'completed' : 'active'}.`);
    } catch (err) {
      console.error('Error toggling all todos:', err);
      setTodos(previousTodos);
      setError('Failed to update all tasks.');
    }
  };

  // Filter and Search computation
  const filteredTodos = useMemo(() => {
    return todos.filter((todo) => {
      // Status filter
      if (activeFilter === 'active' && todo.completed) return false;
      if (activeFilter === 'completed' && !todo.completed) return false;

      // Search filter
      if (searchQuery.trim()) {
        const query = searchQuery.trim().toLowerCase();
        return todo.title.toLowerCase().includes(query);
      }
      return true;
    });
  }, [todos, activeFilter, searchQuery]);

  const counts = useMemo(() => {
    const total = todos.length;
    const completed = todos.filter((t) => t.completed).length;
    const active = total - completed;
    return { total, active, completed };
  }, [todos]);

  return (
    <div className="app-container">
      {/* Screen Reader Live Announcements */}
      <div className="visually-hidden" aria-live="polite" aria-atomic="true">
        {statusMessage}
      </div>

      <header className="app-header">
        <div className="brand">
          <div className="brand-icon" aria-hidden="true">✓</div>
          <div>
            <h1>TaskFlow</h1>
            <p className="subtitle">Modern Full-Stack Task Management</p>
          </div>
        </div>
      </header>

      <main className="app-main">
        {/* Error Notification */}
        {error && (
          <div className="alert alert-error" role="alert">
            <span className="alert-icon" aria-hidden="true">⚠️</span>
            <div className="alert-content">
              <span>{error}</span>
            </div>
            <button
              type="button"
              className="btn btn-sm btn-outline alert-retry"
              onClick={fetchTodos}
            >
              Retry
            </button>
            <button
              type="button"
              className="alert-close"
              onClick={() => setError(null)}
              aria-label="Dismiss error notification"
            >
              ×
            </button>
          </div>
        )}

        {/* Task Creation Input */}
        <section aria-label="Add new task">
          <TodoForm onAddTodo={handleAddTodo} disabled={loading && todos.length === 0} />
        </section>

        {/* Progress Overview */}
        <ProgressBar total={counts.total} completed={counts.completed} />

        {/* Filtering and Search Controls */}
        <section aria-label="Task controls and filters">
          <TodoFilters
            activeFilter={activeFilter}
            onFilterChange={setActiveFilter}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            counts={counts}
            onClearCompleted={handleClearCompleted}
            onToggleAll={handleToggleAll}
          />
        </section>

        {/* Tasks List */}
        <section aria-label="Task list">
          {loading && todos.length === 0 ? (
            <div className="loading-state" role="status">
              <div className="spinner" aria-hidden="true" />
              <p>Loading your tasks...</p>
            </div>
          ) : filteredTodos.length === 0 ? (
            <div className="empty-state">
              <span className="empty-icon" aria-hidden="true">
                {searchQuery ? '🔍' : activeFilter === 'completed' ? '📝' : '✨'}
              </span>
              <h3>
                {searchQuery
                  ? 'No matching tasks found'
                  : activeFilter === 'completed'
                  ? 'No completed tasks yet'
                  : activeFilter === 'active'
                  ? 'All tasks are completed!'
                  : 'No tasks yet'}
              </h3>
              <p>
                {searchQuery
                  ? `No tasks match "${searchQuery}". Try a different keyword.`
                  : activeFilter === 'completed'
                  ? 'Complete some tasks to see them archived here.'
                  : activeFilter === 'active'
                  ? 'Great job! Add new tasks above when you have more to do.'
                  : 'Add your first task above to start organizing your day.'}
              </p>
            </div>
          ) : (
            <ul className="todo-list" aria-label="Tasks">
              {filteredTodos.map((todo) => (
                <TodoItem
                  key={todo._id || todo.id}
                  todo={todo}
                  onToggle={handleToggleTodo}
                  onUpdateTitle={handleUpdateTitle}
                  onDelete={handleDeleteTodo}
                />
              ))}
            </ul>
          )}
        </section>
      </main>

      <footer className="app-footer">
        <p>Double-click task or click <strong>Edit</strong> to rename • Enter to save • Esc to cancel</p>
      </footer>
    </div>
  );
}

export default App;
