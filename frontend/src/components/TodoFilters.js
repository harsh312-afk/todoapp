import React from 'react';

function TodoFilters({
  activeFilter,
  onFilterChange,
  searchQuery,
  onSearchChange,
  counts,
  onClearCompleted,
  onToggleAll,
}) {
  const { total, active, completed } = counts;
  const allCompleted = total > 0 && active === 0;

  return (
    <div className="todo-toolbar">
      {/* Search Bar */}
      <div className="search-box">
        <label htmlFor="search-todos" className="visually-hidden">
          Search Tasks
        </label>
        <input
          id="search-todos"
          type="search"
          className="search-input"
          placeholder="Search tasks..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          aria-label="Filter tasks by search term"
        />
        {searchQuery && (
          <button
            type="button"
            className="clear-search-btn"
            onClick={() => onSearchChange('')}
            aria-label="Clear search"
          >
            ×
          </button>
        )}
      </div>

      {/* Filter Tabs & Batch Buttons */}
      <div className="filters-row">
        <div className="filter-tabs" role="tablist" aria-label="Task status filters">
          <button
            type="button"
            role="tab"
            aria-selected={activeFilter === 'all'}
            className={`filter-btn ${activeFilter === 'all' ? 'active' : ''}`}
            onClick={() => onFilterChange('all')}
          >
            All <span className="badge">{total}</span>
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeFilter === 'active'}
            className={`filter-btn ${activeFilter === 'active' ? 'active' : ''}`}
            onClick={() => onFilterChange('active')}
          >
            Active <span className="badge">{active}</span>
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeFilter === 'completed'}
            className={`filter-btn ${activeFilter === 'completed' ? 'active' : ''}`}
            onClick={() => onFilterChange('completed')}
          >
            Completed <span className="badge">{completed}</span>
          </button>
        </div>

        <div className="batch-actions">
          {total > 0 && (
            <button
              type="button"
              className="btn btn-sm btn-outline"
              onClick={() => onToggleAll(!allCompleted)}
              title={allCompleted ? 'Mark all as active' : 'Mark all as completed'}
            >
              {allCompleted ? 'Uncheck All' : 'Check All'}
            </button>
          )}

          {completed > 0 && (
            <button
              type="button"
              className="btn btn-sm btn-ghost text-danger"
              onClick={onClearCompleted}
              aria-label="Clear all completed tasks"
            >
              Clear Completed ({completed})
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default TodoFilters;
