const mongoose = require('mongoose');
const Schema = mongoose.Schema;

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
    receivedItems: [Schema.Types.Mixed],
    healthInjuries: [Number],
    lastUpdated: String
});

module.exports = locationScheme;