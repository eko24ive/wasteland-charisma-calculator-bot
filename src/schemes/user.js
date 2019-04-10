const { Schema } = require('mongoose');

// TODO: Refactor points structure

const userSchema = Schema({
  restricted: {
    type: Boolean,
    default: false,
  },
  telegram: {
    firstName: String,
    id: Number,
    userName: String,
    userNamesHistory: [String],
  },
  pip: {
    version: String,
    faction: String,
    squad: String,
    name: String,
    health: Number,
    strength: Number,
    precision: Number,
    charisma: Number,
    agility: Number,
    endurance: Number,
    damage: Number,
    armor: Number,
    timeStamp: Number,
    dzen: Number,
  },
  points: {
    score: {
      type: Number,
      default: 0,
    },
    forwards: {
      beast: {
        wins: {
          type: Number,
          default: 0,
        },
        loss: {
          type: Number,
          default: 0,
        },
        flee: {
          wins: {
            type: Number,
            default: 0,
          },
          loss: {
            type: Number,
            default: 0,
          },
        },
        regular: {
          type: Number,
          default: 0,
        },
        darkZone: {
          type: Number,
          default: 0,
        },
        walking: {
          type: Number,
          default: 0,
        },
        dungeon: {
          type: Number,
          default: 0,
        },
      },
      locations: {
        type: Number,
        default: 0,
      },
      giants: {
        type: Number,
        default: 0,
      },
    },
  },
  history: {
    pip: [{
      version: String,
      faction: String,
      squad: String,
      name: String,
      health: Number,
      strength: Number,
      precision: Number,
      charisma: Number,
      agility: Number,
      endurance: Number,
      damage: Number,
      armor: Number,
      timeStamp: Number,
      dzen: Number,
    }],
  },
  settings: {
    buttonsAmount: Number,
    buttonsIconsMode: Boolean,
    buttons: [{
      index: Number,
      name: String,
      state: String,
      label: String,
      order: Number,
    }],
  },
}, {
  timestamps: {
    createdAt: 'createdAt',
    updatedAt: 'updatedAt',
  },
});

module.exports = userSchema;
