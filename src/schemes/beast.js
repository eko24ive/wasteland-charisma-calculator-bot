const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// TODO: Add identificator of forward using id of user and timestamp of forward
// TODO: Add detailed battle output (just like from the forward) (field: battlelog)

const beastScheme = new Schema({
    distanceRange: [Number],
    name: String,
    isDungeon: Boolean,
    capsReceived: [Number],
    materialsReceived: [Number],
    receivedItems: Object,
    battles: [{
        totalDamageGiven: Number,
        totalDamageReceived: Number,
        damagesGiven: [Number],
        damagesReceived: [Number],
        outcome: String,
        stats: {
            armor: Number,
            damage: Number
        },
        healthOnStart: Number
    }],
    flees: [{
        stats: {
            agility: Number
        },
        damageReceived: Number,
        outcome: String
    }],
    concussions: [{
        stats: {
            agility: Number
        },
        amount: Number,
    }],
    lastUpdated: String
}, {
    timestamps: {
        createdAt: 'createdAt',
        updatedAt: 'updatedAt'
    }
});

module.exports = beastScheme;