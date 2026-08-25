# Full Stack Todo Application

This is a simple full-stack todo application built with:

- **Backend**: Node.js, Express, MongoDB
- **Frontend**: React

## Features

- View list of todos
- Add new todos
- Update todos (mark as completed/incomplete)
- Delete todos

## Prerequisites

- Node.js (v14 or higher)
- MongoDB (running locally or provide a connection string)

## Setup

### Backend

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file (if not already created) with the following:
   ```
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/fullstackdb
   ```

4. Start the server:
   ```bash
   npm start
   ```
   The backend will run on `http://localhost:5000`

### Frontend

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the React development server:
   ```bash
   npm start
   ```
   The frontend will run on `http://localhost:3000`

## API Endpoints

- `GET /api/todos` - Get all todos
- `POST /api/todos` - Create a new todo
- `PATCH /api/todos/:id` - Update a todo
- `DELETE /api/todos/:id` - Delete a todo

## Project Structure

```
fullstack-app/
├── backend/
│   ├── server.js
│   ├── .env
│   ├── package.json
│   └── node_modules/
└── frontend/
    ├── public/
    ├── src/
    │   ├── App.js
    │   ├── index.js
    │   └── ...
    ├── package.json
    └── node_modules/
```

## How It Works

The frontend communicates with the backend via RESTful API calls using Axios.
The backend connects to a MongoDB database to store and retrieve todo items.

## Customization

- Change the port in the backend `.env` file if needed.
- Modify the MongoDB connection string in the backend `.env` file.
- Adjust the frontend to point to a different backend URL by changing the base URL in API calls (currently set to `http://localhost:5000`).

## Troubleshooting

- If the backend cannot connect to MongoDB, ensure MongoDB is running and the connection string is correct.
- If the frontend cannot connect to the backend, check that the backend is running and that there are no CORS issues (the backend uses cors middleware).

## License

This project is open source and available under the MIT License.