const { Schema } = require('mongoose');

// TODO: Add detailed battle output (just like from the forward) (field: battlelog)
const beastScheme = new Schema({
  distanceRange: [{
    value: Number,
    version: String,
  }],
  name: String,
  isDungeon: Boolean,
  capsReceived: [{
    value: Number,
    version: String,
  }],
  materialsReceived: [{
    value: Number,
    version: String,
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
    version: String,
  }],
  flees: [{
    stats: {
      agility: Number,
    },
    damageReceived: Number,
    outcome: String,
    stamp: String,
    version: String,
  }],
  concussions: [{
    stats: {
      agility: Number,
    },
    amount: Number,
    version: String,
  }],
  lastUpdated: String,
  version: String,
}, {
  timestamps: {
    createdAt: 'createdAt',
    updatedAt: 'updatedAt',
  },
});

const oldBeastScheme = new Schema({
  distanceRange: Schema.Types.Mixed,
  name: String,
  isDungeon: Boolean,
  capsReceived: Schema.Types.Mixed,
  materialsReceived: Schema.Types.Mixed,
  receivedItems: Object,
  type: String,
  subType: String,
  battles: Schema.Types.Mixed,
  flees: Schema.Types.Mixed,
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
