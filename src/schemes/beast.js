const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const locationScheme = new Schema({
    distance: Number,
    name: String,
    isDungeon: Boolean,
    capsReceived: [Number],
    materialsReceived: [Number],
    receivedItems: [Schema.Types.Mixed],
    battles: [{
        totalDamageGiven: Number,
        totalDamageReceived: Number,
        damagesGiven: [Number],
        damagesReceived: [Number]
    }],
    flees: [{
        agility: Number,
        damageReceived: Number
    }],
    concussions: [{
        agility: Number,
        amountOfConcussions: Number,
    }],
    lastUpdated: String
});