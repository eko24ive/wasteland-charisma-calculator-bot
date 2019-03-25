const { Schema } = require('mongoose');

// TODO: Refactor points structure

const journeySchema = Schema({
  epoch: String,
  user: {
    id: Number,
    username: String,
  },
  updatesData: Object,
  reportData: Object,
  session: Object,
}, {
  timestamps: {
    createdAt: 'createdAt',
    updatedAt: 'updatedAt',
  },
});

module.exports = journeySchema;
