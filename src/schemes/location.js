const { Schema } = require('mongoose');

const locationScheme = new Schema({
  distance: Number,
  name: String,
  type: String,
  isRaid: Boolean,
  effects: [String],
  capsReceived: [Number],
  materialsReceived: [Number],
  capsLost: [Number],
  materialsLost: [Number],
  receivedItems: Object,
  receivedBonusItems: Object,
  healthInjuries: [Number],
  lastUpdated: String,
}, {
  timestamps: {
    createdAt: 'createdAt',
    updatedAt: 'updatedAt',
  },
});

module.exports = locationScheme;
