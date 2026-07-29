// Defines the URL endpoints for tasks: /api/tasks
// Every route here is protected — you must be logged in (send a valid token) to use them.

const express = require('express');
const protect = require('../middleware/auth');
const { getTasks, createTask, updateTask, deleteTask } = require('../controllers/taskController');

const router = express.Router();

// `protect` runs first on every route below — it checks the JWT token
// before the actual controller function (getTasks, createTask, etc.) runs.
router.use(protect);

router.get('/', getTasks);
router.post('/', createTask);
router.put('/:id', updateTask);
router.delete('/:id', deleteTask);

module.exports = router;
