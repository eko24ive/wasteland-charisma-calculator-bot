const { Schema } = require('mongoose');

// TODO: Add detailed battle output (just like from the forward) (field: battlelog)
const beastScheme = new Schema({
  distanceRange: [{
    value: Number,
    version: String,
    epoch: String,
  }],
  name: String,
  isDungeon: Boolean,
  capsReceived: [{
    value: Number,
    version: String,
    epoch: String,
  }],
  materialsReceived: [{
    value: Number,
    version: String,
    epoch: String,
  }],
  receivedItems: Object,
  type: String,
  subType: String,
  battles: [{
    totalDamageGiven: Number,
    totalDamageReceived: Number,
    damagesGiven: [Number],
    damagesReceived: [Number],
    outcome: String,
    stats: {
      armor: Number,
      damage: Number,
    },
    healthOnStart: Number,
    stamp: String,
    distance: Number,
    version: String,
    epoch: String,
  }],
  flees: [{
    stats: {
      agility: Number,
    },
    damageReceived: Number,
    outcome: String,
    stamp: String,
    version: String,
    epoch: String,
  }],
  concussions: [{
    stats: {
      agility: Number,
    },
    amount: Number,
    version: String,
    epoch: String,
  }],
  lastUpdated: String,
}, {
  timestamps: {
    createdAt: 'createdAt',
    updatedAt: 'updatedAt',
  },
});

module.exports = beastScheme;
