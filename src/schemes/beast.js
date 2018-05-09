const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const beastScheme = new Schema({
    distanceRange: [Number],
    name: String,
    isDungeon: Boolean,
    capsReceived: [Number],
    materialsReceived: [Number],
    receivedItems: [Schema.Types.Mixed],
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
});

module.exports = beastScheme;