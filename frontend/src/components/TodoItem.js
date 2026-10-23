import React, { useState, useRef, useEffect } from 'react';

function TodoItem({ todo, onToggle, onUpdateTitle, onDelete }) {
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(todo.title);
  const editInputRef = useRef(null);

  useEffect(() => {
    setEditText(todo.title);
  }, [todo.title]);

  useEffect(() => {
    if (isEditing && editInputRef.current) {
      editInputRef.current.focus();
      editInputRef.current.select();
    }
  }, [isEditing]);

  const handleStartEdit = () => {
    setIsEditing(true);
    setEditText(todo.title);
  };

  const handleSaveEdit = () => {
    const trimmed = editText.trim();
    if (!trimmed) {
      // Cancel edit if blank
      setEditText(todo.title);
      setIsEditing(false);
      return;
    }

    if (trimmed !== todo.title) {
      onUpdateTitle(todo._id || todo.id, trimmed);
    }
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    setEditText(todo.title);
    setIsEditing(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      if (e.isComposing || e.nativeEvent?.isComposing || e.keyCode === 229) {
        return;
      }
      handleSaveEdit();
    } else if (e.key === 'Escape') {
      handleCancelEdit();
    }
  };

  const formattedDate = todo.createdAt
    ? new Date(todo.createdAt).toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
      })
    : null;

  const todoId = todo._id || todo.id;

  return (
    <li
      className={`todo-item ${todo.completed ? 'completed' : ''} ${isEditing ? 'editing' : ''}`}
      data-testid="todo-item"
    >
      <div className="todo-item-main">
        <label className="checkbox-container">
          <input
            type="checkbox"
            className="todo-checkbox"
            checked={Boolean(todo.completed)}
            onChange={() => onToggle(todoId, todo.completed)}
            aria-label={`Mark "${todo.title}" as ${todo.completed ? 'active' : 'completed'}`}
          />
          <span className="custom-checkbox" aria-hidden="true" />
        </label>

        {isEditing ? (
          <input
            ref={editInputRef}
            type="text"
            className="edit-todo-input"
            value={editText}
            onChange={(e) => setEditText(e.target.value)}
            onBlur={handleSaveEdit}
            onKeyDown={handleKeyDown}
            maxLength={500}
            aria-label="Edit task title"
          />
        ) : (
          <div className="todo-content" onDoubleClick={handleStartEdit}>
            <span className="todo-title">{todo.title}</span>
            {formattedDate && <span className="todo-date">{formattedDate}</span>}
          </div>
        )}
      </div>

      <div className="todo-actions">
        {isEditing ? (
          <>
            <button
              type="button"
              className="btn btn-sm btn-outline"
              onClick={handleSaveEdit}
              aria-label="Save changes"
            >
              Save
            </button>
            <button
              type="button"
              className="btn btn-sm btn-ghost"
              onClick={handleCancelEdit}
              aria-label="Cancel editing"
            >
              Cancel
            </button>
          </>
        ) : (
          <>
            <button
              type="button"
              className="btn btn-sm btn-ghost btn-edit"
              onClick={handleStartEdit}
              aria-label={`Edit "${todo.title}"`}
            >
              Edit
            </button>
            <button
              type="button"
              className="btn btn-sm btn-danger btn-delete"
              onClick={() => onDelete(todoId)}
              aria-label={`Delete "${todo.title}"`}
            >
              Delete
            </button>
          </>
        )}
      </div>
    </li>
  );
}

export default TodoItem;
