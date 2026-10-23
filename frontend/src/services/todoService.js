import axios from 'axios';

// Defaults to relative '/api' (leveraging dev proxy) or process.env.REACT_APP_API_URL or localhost fallback
const API_BASE_URL =
  process.env.REACT_APP_API_URL ||
  (process.env.NODE_ENV === 'production' ? '/api' : 'http://localhost:5000/api');

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

export const todoService = {
  async getTodos(params = {}) {
    const response = await apiClient.get('/todos', { params });
    return response.data;
  },

  async createTodo(title) {
    const response = await apiClient.post('/todos', { title });
    return response.data;
  },

  async updateTodo(id, updates) {
    const response = await apiClient.patch(`/todos/${id}`, updates);
    return response.data;
  },

  async deleteTodo(id) {
    const response = await apiClient.delete(`/todos/${id}`);
    return response.data;
  },

  async clearCompleted() {
    const response = await apiClient.delete('/todos/completed');
    return response.data;
  },

  async toggleAll(completed) {
    const response = await apiClient.patch('/todos/toggle-all', { completed });
    return response.data;
  },

  async checkHealth() {
    const response = await apiClient.get('/health');
    return response.data;
  },
};

export default todoService;
