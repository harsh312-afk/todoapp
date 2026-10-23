import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import App from './App';
import todoService from './services/todoService';

// Mock todoService to test UI logic in isolation
jest.mock('./services/todoService');

const mockTodos = [
  {
    _id: '1',
    id: '1',
    title: 'First Test Task',
    completed: false,
    createdAt: new Date().toISOString(),
  },
  {
    _id: '2',
    id: '2',
    title: 'Second Test Task (Done)',
    completed: true,
    createdAt: new Date().toISOString(),
  },
];

describe('TaskFlow App Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    todoService.getTodos.mockResolvedValue(mockTodos);
  });

  test('renders TaskFlow header, input form, and filter controls', async () => {
    render(<App />);

    expect(screen.getByRole('heading', { name: /TaskFlow/i })).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/What needs to be done\?/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Add task to list/i })).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText('First Test Task')).toBeInTheDocument();
      expect(screen.getByText('Second Test Task (Done)')).toBeInTheDocument();
    });
  });

  test('adds a new todo on form submit', async () => {
    const createdTodo = {
      _id: '3',
      id: '3',
      title: 'Newly Created Task',
      completed: false,
      createdAt: new Date().toISOString(),
    };
    todoService.createTodo.mockResolvedValue(createdTodo);

    render(<App />);

    await waitFor(() => {
      expect(screen.getByText('First Test Task')).toBeInTheDocument();
    });

    const input = screen.getByPlaceholderText(/What needs to be done\?/i);
    const submitBtn = screen.getByRole('button', { name: /Add task to list/i });

    fireEvent.change(input, { target: { value: 'Newly Created Task' } });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(todoService.createTodo).toHaveBeenCalledWith('Newly Created Task');
      expect(screen.getByText('Newly Created Task')).toBeInTheDocument();
    });
  });

  test('toggles a todo between active and completed', async () => {
    todoService.updateTodo.mockResolvedValue({
      ...mockTodos[0],
      completed: true,
    });

    render(<App />);

    await waitFor(() => {
      expect(screen.getByText('First Test Task')).toBeInTheDocument();
    });

    const checkboxes = screen.getAllByRole('checkbox');
    fireEvent.click(checkboxes[0]);

    await waitFor(() => {
      expect(todoService.updateTodo).toHaveBeenCalledWith('1', { completed: true });
    });
  });

  test('deletes a todo when delete button is clicked', async () => {
    todoService.deleteTodo.mockResolvedValue({ message: 'Todo deleted successfully' });

    render(<App />);

    await waitFor(() => {
      expect(screen.getByText('First Test Task')).toBeInTheDocument();
    });

    const deleteButtons = screen.getAllByRole('button', { name: /Delete/i });
    fireEvent.click(deleteButtons[0]);

    await waitFor(() => {
      expect(todoService.deleteTodo).toHaveBeenCalledWith('1');
      expect(screen.queryByText('First Test Task')).not.toBeInTheDocument();
    });
  });

  test('filters active and completed todos', async () => {
    render(<App />);

    await waitFor(() => {
      expect(screen.getByText('First Test Task')).toBeInTheDocument();
      expect(screen.getByText('Second Test Task (Done)')).toBeInTheDocument();
    });

    // Click Active filter
    const activeFilterBtn = screen.getByRole('tab', { name: /Active/i });
    fireEvent.click(activeFilterBtn);

    expect(screen.getByText('First Test Task')).toBeInTheDocument();
    expect(screen.queryByText('Second Test Task (Done)')).not.toBeInTheDocument();

    // Click Completed filter
    const completedFilterBtn = screen.getByRole('tab', { name: /Completed/i });
    fireEvent.click(completedFilterBtn);

    expect(screen.queryByText('First Test Task')).not.toBeInTheDocument();
    expect(screen.getByText('Second Test Task (Done)')).toBeInTheDocument();
  });

  test('searches and filters todos dynamically by query', async () => {
    render(<App />);

    await waitFor(() => {
      expect(screen.getByText('First Test Task')).toBeInTheDocument();
    });

    const searchInput = screen.getByPlaceholderText(/Search tasks\.\.\./i);
    fireEvent.change(searchInput, { target: { value: 'Second' } });

    expect(screen.queryByText('First Test Task')).not.toBeInTheDocument();
    expect(screen.getByText('Second Test Task (Done)')).toBeInTheDocument();
  });
});
