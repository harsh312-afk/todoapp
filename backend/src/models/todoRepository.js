const crypto = require('crypto');
const mongoose = require('mongoose');
const Todo = require('./Todo');
const { isDbConnected } = require('../config/db');

// In-memory fallback storage
const memoryStore = new Map();

function generateId() {
  return crypto.randomBytes(12).toString('hex');
}

function isValidId(id) {
  if (!id || typeof id !== 'string') return false;
  return /^[0-9a-fA-F]{24}$/.test(id);
}

const todoRepository = {
  isValidId,

  async getAll({ completed, search, sort = 'newest' } = {}) {
    if (isDbConnected()) {
      const query = {};
      if (completed !== undefined) {
        query.completed = completed === 'true' || completed === true;
      }
      if (search && search.trim()) {
        query.title = { $regex: search.trim(), $options: 'i' };
      }

      const sortOption = sort === 'oldest' ? { createdAt: 1 } : { createdAt: -1 };
      const docs = await Todo.find(query).sort(sortOption);
      return docs.map(doc => doc.toJSON());
    }

    // In-Memory Fallback
    let todos = Array.from(memoryStore.values());

    if (completed !== undefined) {
      const isComp = completed === 'true' || completed === true;
      todos = todos.filter(t => t.completed === isComp);
    }

    if (search && search.trim()) {
      const lower = search.trim().toLowerCase();
      todos = todos.filter(t => t.title.toLowerCase().includes(lower));
    }

    if (sort === 'oldest') {
      todos.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    } else {
      todos.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }

    return todos.map(t => ({ ...t }));
  },

  async getById(id) {
    if (!isValidId(id)) return null;

    if (isDbConnected()) {
      const doc = await Todo.findById(id);
      return doc ? doc.toJSON() : null;
    }

    const todo = memoryStore.get(id);
    return todo ? { ...todo } : null;
  },

  async create({ title, completed = false }) {
    const trimmedTitle = typeof title === 'string' ? title.trim() : '';
    if (!trimmedTitle) {
      const error = new Error('Todo title is required and cannot be blank');
      error.status = 400;
      throw error;
    }

    if (isDbConnected()) {
      const doc = new Todo({
        title: trimmedTitle,
        completed: Boolean(completed),
      });
      await doc.save();
      return doc.toJSON();
    }

    const id = generateId();
    const now = new Date().toISOString();
    const todo = {
      _id: id,
      id,
      title: trimmedTitle,
      completed: Boolean(completed),
      createdAt: now,
      updatedAt: now,
    };
    memoryStore.set(id, todo);
    return { ...todo };
  },

  async update(id, updates) {
    if (!isValidId(id)) return null;

    const payload = {};
    if (updates.title !== undefined) {
      const trimmed = typeof updates.title === 'string' ? updates.title.trim() : '';
      if (!trimmed) {
        const error = new Error('Todo title cannot be blank');
        error.status = 400;
        throw error;
      }
      payload.title = trimmed;
    }

    if (updates.completed !== undefined) {
      payload.completed = Boolean(updates.completed);
    }

    if (isDbConnected()) {
      const doc = await Todo.findByIdAndUpdate(id, payload, {
        new: true,
        runValidators: true,
      });
      return doc ? doc.toJSON() : null;
    }

    const existing = memoryStore.get(id);
    if (!existing) return null;

    const updated = {
      ...existing,
      ...payload,
      updatedAt: new Date().toISOString(),
    };
    memoryStore.set(id, updated);
    return { ...updated };
  },

  async delete(id) {
    if (!isValidId(id)) return false;

    if (isDbConnected()) {
      const result = await Todo.findByIdAndDelete(id);
      return Boolean(result);
    }

    return memoryStore.delete(id);
  },

  async clearCompleted() {
    if (isDbConnected()) {
      const result = await Todo.deleteMany({ completed: true });
      return result.deletedCount || 0;
    }

    let deletedCount = 0;
    for (const [id, todo] of memoryStore.entries()) {
      if (todo.completed) {
        memoryStore.delete(id);
        deletedCount++;
      }
    }
    return deletedCount;
  },

  async toggleAll(completed) {
    const isComp = Boolean(completed);

    if (isDbConnected()) {
      await Todo.updateMany({}, { completed: isComp });
      const docs = await Todo.find().sort({ createdAt: -1 });
      return docs.map(doc => doc.toJSON());
    }

    for (const [id, todo] of memoryStore.entries()) {
      todo.completed = isComp;
      todo.updatedAt = new Date().toISOString();
      memoryStore.set(id, todo);
    }
    return Array.from(memoryStore.values()).sort(
      (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
    );
  },

  resetStore() {
    memoryStore.clear();
  },
};

module.exports = todoRepository;
