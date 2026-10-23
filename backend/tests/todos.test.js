const request = require('supertest');
const app = require('../src/app');
const todoRepository = require('../src/models/todoRepository');

beforeEach(() => {
  todoRepository.resetStore();
});

describe('Todo API Endpoints', () => {
  describe('GET / and Health Check', () => {
    it('should return welcome payload at root', async () => {
      const res = await request(app).get('/');
      expect(res.status).toBe(200);
      expect(res.body.name).toBe('Full-Stack Todo API');
      expect(res.body.endpoints).toBeDefined();
    });

    it('should return health status', async () => {
      const res = await request(app).get('/api/health');
      expect(res.status).toBe(200);
      expect(res.body.status).toBe('ok');
      expect(res.body.database).toBeDefined();
    });
  });

  describe('POST /api/todos', () => {
    it('should create a new todo when valid title is provided', async () => {
      const res = await request(app)
        .post('/api/todos')
        .send({ title: 'Complete project scan' });

      expect(res.status).toBe(201);
      expect(res.body.id).toBeDefined();
      expect(res.body.title).toBe('Complete project scan');
      expect(res.body.completed).toBe(false);
      expect(res.body.createdAt).toBeDefined();
    });

    it('should reject creation when title is empty or only whitespace', async () => {
      const res = await request(app)
        .post('/api/todos')
        .send({ title: '   ' });

      expect(res.status).toBe(400);
      expect(res.body.error).toMatch(/Title is required/i);
    });

    it('should reject creation when title is missing', async () => {
      const res = await request(app)
        .post('/api/todos')
        .send({});

      expect(res.status).toBe(400);
      expect(res.body.error).toMatch(/Title is required/i);
    });
  });

  describe('GET /api/todos and GET /api/todos/:id', () => {
    it('should return an empty list when no todos exist', async () => {
      const res = await request(app).get('/api/todos');
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBe(0);
    });

    it('should retrieve a single todo by ID', async () => {
      const created = await todoRepository.create({ title: 'Read documentation' });
      const res = await request(app).get(`/api/todos/${created.id}`);

      expect(res.status).toBe(200);
      expect(res.body.title).toBe('Read documentation');
    });

    it('should return 400 when invalid ID format is passed', async () => {
      const res = await request(app).get('/api/todos/invalid-id');
      expect(res.status).toBe(400);
      expect(res.body.error).toMatch(/invalid.*format/i);
    });

    it('should return 404 when todo does not exist', async () => {
      const nonExistentId = '123456789012345678901234';
      const res = await request(app).get(`/api/todos/${nonExistentId}`);
      expect(res.status).toBe(404);
      expect(res.body.error).toBe('Todo not found');
    });
  });

  describe('PATCH /api/todos/:id', () => {
    it('should toggle completed status', async () => {
      const created = await todoRepository.create({ title: 'Toggle test', completed: false });
      const res = await request(app)
        .patch(`/api/todos/${created.id}`)
        .send({ completed: true });

      expect(res.status).toBe(200);
      expect(res.body.completed).toBe(true);
    });

    it('should update the title', async () => {
      const created = await todoRepository.create({ title: 'Original title' });
      const res = await request(app)
        .patch(`/api/todos/${created.id}`)
        .send({ title: 'Updated title' });

      expect(res.status).toBe(200);
      expect(res.body.title).toBe('Updated title');
    });

    it('should reject updating to an empty title', async () => {
      const created = await todoRepository.create({ title: 'Original title' });
      const res = await request(app)
        .patch(`/api/todos/${created.id}`)
        .send({ title: '   ' });

      expect(res.status).toBe(400);
      expect(res.body.error).toMatch(/Title cannot be empty/i);
    });
  });

  describe('DELETE /api/todos/:id (Verifies fix for todo.remove() bug)', () => {
    it('should delete an existing todo and not crash', async () => {
      const created = await todoRepository.create({ title: 'To be deleted' });
      const res = await request(app).delete(`/api/todos/${created.id}`);

      expect(res.status).toBe(200);
      expect(res.body.message).toMatch(/deleted successfully/i);

      // Verify it is gone
      const checkRes = await request(app).get(`/api/todos/${created.id}`);
      expect(checkRes.status).toBe(404);
    });

    it('should return 404 when attempting to delete non-existent ID', async () => {
      const nonExistentId = '000000000000000000000000';
      const res = await request(app).delete(`/api/todos/${nonExistentId}`);
      expect(res.status).toBe(404);
    });
  });

  describe('Filtering and Search', () => {
    beforeEach(async () => {
      await todoRepository.create({ title: 'Buy groceries', completed: false });
      await todoRepository.create({ title: 'Buy milk', completed: true });
      await todoRepository.create({ title: 'Write tests', completed: false });
    });

    it('should filter completed todos', async () => {
      const res = await request(app).get('/api/todos?completed=true');
      expect(res.status).toBe(200);
      expect(res.body.length).toBe(1);
      expect(res.body[0].title).toBe('Buy milk');
    });

    it('should filter active todos', async () => {
      const res = await request(app).get('/api/todos?completed=false');
      expect(res.status).toBe(200);
      expect(res.body.length).toBe(2);
    });

    it('should search todos by keyword', async () => {
      const res = await request(app).get('/api/todos?search=buy');
      expect(res.status).toBe(200);
      expect(res.body.length).toBe(2);
    });
  });

  describe('Batch Operations', () => {
    it('should clear all completed todos', async () => {
      await todoRepository.create({ title: 'Task 1', completed: true });
      await todoRepository.create({ title: 'Task 2', completed: false });
      await todoRepository.create({ title: 'Task 3', completed: true });

      const res = await request(app).delete('/api/todos/completed');
      expect(res.status).toBe(200);
      expect(res.body.deletedCount).toBe(2);

      const remaining = await todoRepository.getAll();
      expect(remaining.length).toBe(1);
      expect(remaining[0].title).toBe('Task 2');
    });

    it('should toggle all todos completed state', async () => {
      await todoRepository.create({ title: 'Task A', completed: false });
      await todoRepository.create({ title: 'Task B', completed: false });

      const res = await request(app)
        .patch('/api/todos/toggle-all')
        .send({ completed: true });

      expect(res.status).toBe(200);
      expect(res.body.todos.every(t => t.completed === true)).toBe(true);
    });
  });

  describe('404 Handler', () => {
    it('should return 404 for unknown route', async () => {
      const res = await request(app).get('/api/does-not-exist');
      expect(res.status).toBe(404);
      expect(res.body.error).toMatch(/Route not found/i);
    });
  });
});
