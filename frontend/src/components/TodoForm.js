import React, { useState } from 'react';

function TodoForm({ onAddTodo, disabled }) {
  const [inputValue, setInputValue] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    const trimmed = inputValue.trim();
    if (!trimmed) return;

    onAddTodo(trimmed);
    setInputValue('');
  };

  const handleKeyDown = (e) => {
    // Check IME composition according to modern web guidance (ime-safe-enter-submit)
    // To protect against IME conversion submission in CJK and Safari bug 165004
    if (e.key === 'Enter') {
      if (e.isComposing || e.nativeEvent?.isComposing || e.keyCode === 229) {
        return;
      }
    }
  };

  return (
    <form className="todo-form" onSubmit={handleSubmit} noValidate>
      <label htmlFor="new-todo-input" className="visually-hidden">
        New Task
      </label>
      <input
        id="new-todo-input"
        name="title"
        type="text"
        className="todo-input"
        placeholder="What needs to be done?"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onKeyDown={handleKeyDown}
        disabled={disabled}
        maxLength={500}
        autoComplete="off"
        autoCorrect="off"
        enterKeyHint="done"
      />
      <button
        type="submit"
        className="btn btn-primary"
        disabled={disabled || !inputValue.trim()}
        aria-label="Add task to list"
      >
        <span className="btn-icon" aria-hidden="true">+</span>
        <span>Add Task</span>
      </button>
    </form>
  );
}

export default TodoForm;
