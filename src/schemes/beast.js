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
        hits: Number,
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
        hits: Number
    }],
    lastUpdated: String
});