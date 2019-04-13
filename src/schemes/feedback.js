const { Schema } = require('mongoose');

const feedbackSchema = new Schema({
  message: String,
  type: String,
  telegram: {
    firstName: String,
    id: Number,
    userName: String,
  },
  timestamp: String,
}, {
  timestamps: {
    createdAt: 'createdAt',
    updatedAt: 'updatedAt',
  },
});

module.exports = feedbackSchema;
