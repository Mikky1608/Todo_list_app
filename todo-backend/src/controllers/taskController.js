// This file contains the logic for creating, reading, updating, and deleting tasks.
// Every function here assumes `req.userId` was already set by our auth middleware.

const Task = require('../models/Task');

// GET /api/tasks — get all tasks belonging to the logged-in user
const getTasks = async (req, res) => {
  try {
    // Only fetch tasks that belong to this user — never leak other users' tasks
    const tasks = await Task.find({ user: req.userId }).sort({ createdAt: -1 });
    res.status(200).json(tasks);
  } catch (error) {
    console.error('Get tasks error:', error.message);
    res.status(500).json({ message: 'Server error while fetching tasks' });
  }
};

// POST /api/tasks — create a new task
const createTask = async (req, res) => {
  try {
    const { title, description, dateTime, deadline, priority } = req.body;

    if (!title || !dateTime || !deadline) {
      return res.status(400).json({ message: 'Title, dateTime, and deadline are required' });
    }

    const task = await Task.create({
      user: req.userId,
      title,
      description,
      dateTime,
      deadline,
      priority,
    });

    res.status(201).json(task);
  } catch (error) {
    console.error('Create task error:', error.message);
    res.status(500).json({ message: 'Server error while creating task' });
  }
};

// PUT /api/tasks/:id — update an existing task (edit fields, or mark complete/incomplete)
const updateTask = async (req, res) => {
  try {
    const task = await Task.findOne({ _id: req.params.id, user: req.userId });

    if (!task) {
      // Either the task doesn't exist, or it belongs to someone else — treat both the same
      return res.status(404).json({ message: 'Task not found' });
    }

    // Only update fields that were actually sent in the request
    const { title, description, dateTime, deadline, priority, completed } = req.body;
    if (title !== undefined) task.title = title;
    if (description !== undefined) task.description = description;
    if (dateTime !== undefined) task.dateTime = dateTime;
    if (deadline !== undefined) task.deadline = deadline;
    if (priority !== undefined) task.priority = priority;
    if (completed !== undefined) task.completed = completed;

    const updatedTask = await task.save();
    res.status(200).json(updatedTask);
  } catch (error) {
    console.error('Update task error:', error.message);
    res.status(500).json({ message: 'Server error while updating task' });
  }
};

// DELETE /api/tasks/:id — delete a task
const deleteTask = async (req, res) => {
  try {
    const task = await Task.findOneAndDelete({ _id: req.params.id, user: req.userId });

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    res.status(200).json({ message: 'Task deleted successfully' });
  } catch (error) {
    console.error('Delete task error:', error.message);
    res.status(500).json({ message: 'Server error while deleting task' });
  }
};

module.exports = { getTasks, createTask, updateTask, deleteTask };
