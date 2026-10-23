const express = require('express');
const router = express.Router();
const todoController = require('../controllers/todoController');

// Batch routes (must come before :id to prevent matching issues)
router.delete('/completed', todoController.clearCompleted);
router.patch('/toggle-all', todoController.toggleAll);

// Collection routes
router.get('/', todoController.getTodos);
router.post('/', todoController.createTodo);

// Item routes
router.get('/:id', todoController.getTodoById);
router.patch('/:id', todoController.updateTodo);
router.delete('/:id', todoController.deleteTodo);

module.exports = router;
