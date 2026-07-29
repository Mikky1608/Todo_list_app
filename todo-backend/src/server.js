// This is the entry point of our backend server.
// Running "npm run dev" starts this file.

require('dotenv').config(); // loads variables from .env into process.env

const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const taskRoutes = require('./routes/taskRoutes');

// Connect to MongoDB before starting the server
connectDB();

const app = express();

// --- Middleware ---
app.use(cors()); // allows our React Native app to make requests to this server
app.use(express.json()); // lets us read JSON data sent in request bodies (e.g. req.body.email)

// --- Routes ---
app.use('/api/auth', authRoutes); // register & login
app.use('/api/tasks', taskRoutes); // task CRUD

// A simple health-check route, useful for confirming the server is alive
app.get('/', (req, res) => {
  res.json({ message: 'To-Do API is running 🚀' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});
