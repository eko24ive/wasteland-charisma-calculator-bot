const { Schema } = require('mongoose');

// TODO: Add identificator of forward using id of user and timestamp of forward
// TODO: Add detailed battle output (just like from the forward) (field: battlelog)

const beastScheme = new Schema({
  distanceRange: [Number],
  name: String,
  isDungeon: Boolean,
  capsReceived: [Number],
  materialsReceived: [Number],
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
  }],
  flees: [{
    stats: {
      agility: Number,
    },
    damageReceived: Number,
    outcome: String,
    stamp: String,
  }],
  concussions: [{
    stats: {
      agility: Number,
    },
    amount: Number,
  }],
  lastUpdated: String,
}, {
  timestamps: {
    createdAt: 'createdAt',
    updatedAt: 'updatedAt',
  },
});

module.exports = beastScheme;
