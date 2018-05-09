const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const locationScheme = new Schema({
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
        armor: Number,
        healthOnStart: Number
    }],
    flees: [{
        agility: Number,
        damageReceived: Number,
        outcome: String
    }],
    concussions: [{
        agility: Number,
        amount: Number,
    }],
    lastUpdated: String
});