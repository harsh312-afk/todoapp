const todoRepository = require('../models/todoRepository');

const todoController = {
  // GET /api/todos
  async getTodos(req, res, next) {
    try {
      const { completed, search, sort } = req.query;
      const todos = await todoRepository.getAll({ completed, search, sort });
      res.json(todos);
    } catch (err) {
      next(err);
    }
  },

  // GET /api/todos/:id
  async getTodoById(req, res, next) {
    try {
      const { id } = req.params;
      if (!todoRepository.isValidId(id)) {
        return res.status(400).json({ error: 'Invalid todo ID format' });
      }

      const todo = await todoRepository.getById(id);
      if (!todo) {
        return res.status(404).json({ error: 'Todo not found' });
      }

      res.json(todo);
    } catch (err) {
      next(err);
    }
  },

  // POST /api/todos
  async createTodo(req, res, next) {
    try {
      const { title, completed } = req.body || {};

      if (!title || typeof title !== 'string' || title.trim() === '') {
        return res.status(400).json({ error: 'Title is required and cannot be blank' });
      }

      const newTodo = await todoRepository.create({
        title: title.trim(),
        completed: Boolean(completed),
      });

      res.status(201).json(newTodo);
    } catch (err) {
      next(err);
    }
  },

  // PATCH /api/todos/:id
  async updateTodo(req, res, next) {
    try {
      const { id } = req.params;
      if (!todoRepository.isValidId(id)) {
        return res.status(400).json({ error: 'Invalid todo ID format' });
      }

      const updates = {};
      if (req.body.title !== undefined) {
        if (typeof req.body.title !== 'string' || req.body.title.trim() === '') {
          return res.status(400).json({ error: 'Title cannot be empty' });
        }
        updates.title = req.body.title.trim();
      }

      if (req.body.completed !== undefined) {
        updates.completed = Boolean(req.body.completed);
      }

      const updatedTodo = await todoRepository.update(id, updates);
      if (!updatedTodo) {
        return res.status(404).json({ error: 'Todo not found' });
      }

      res.json(updatedTodo);
    } catch (err) {
      next(err);
    }
  },

  // DELETE /api/todos/:id
  async deleteTodo(req, res, next) {
    try {
      const { id } = req.params;
      if (!todoRepository.isValidId(id)) {
        return res.status(400).json({ error: 'Invalid todo ID format' });
      }

      const deleted = await todoRepository.delete(id);
      if (!deleted) {
        return res.status(404).json({ error: 'Todo not found' });
      }

      res.json({ message: 'Todo deleted successfully', id });
    } catch (err) {
      next(err);
    }
  },

  // DELETE /api/todos/completed
  async clearCompleted(req, res, next) {
    try {
      const count = await todoRepository.clearCompleted();
      res.json({ message: 'Completed todos cleared successfully', deletedCount: count });
    } catch (err) {
      next(err);
    }
  },

  // PATCH /api/todos/toggle-all
  async toggleAll(req, res, next) {
    try {
      const { completed = true } = req.body || {};
      const updatedTodos = await todoRepository.toggleAll(completed);
      res.json({ message: 'All todos updated successfully', todos: updatedTodos });
    } catch (err) {
      next(err);
    }
  },
};

module.exports = todoController;
