const { Schema } = require('mongoose');

const giantScheme = new Schema({
  distance: Number,
  name: String,
  health: {
    current: Number,
    cap: Number,
  },
  forwardStamp: Number,
}, {
  timestamps: {
    createdAt: 'createdAt',
    updatedAt: 'updatedAt',
  },
});

module.exports = giantScheme;
