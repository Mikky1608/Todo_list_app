// The Task model defines what a single to-do item looks like in the database.

const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema(
  {
    // Every task belongs to exactly one user.
    // This lets us make sure users only ever see their own tasks.
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      default: '',
      trim: true,
    },
    // The date/time the task is scheduled for (e.g. "do this at 5 PM today")
    dateTime: {
      type: Date,
      required: true,
    },
    // The deadline by which the task must be completed
    deadline: {
      type: Date,
      required: true,
    },
    // Priority helps us sort/highlight urgent tasks
    priority: {
      type: String,
      enum: ['low', 'medium', 'high'], // only these 3 values are allowed
      default: 'medium',
    },
    completed: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Task', taskSchema);
