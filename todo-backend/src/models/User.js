// The User model defines what a "user" looks like in our database.
// Mongoose uses this schema to validate and structure the data.

const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true, // no two users can share the same email
      lowercase: true, // always store emails in lowercase to avoid duplicates like "A@x.com" vs "a@x.com"
      trim: true,
    },
    password: {
      type: String,
      required: true, // this will store the HASHED password, never the plain text one
    },
  },
  {
    timestamps: true, // automatically adds createdAt and updatedAt fields
  }
);

module.exports = mongoose.model('User', userSchema);
