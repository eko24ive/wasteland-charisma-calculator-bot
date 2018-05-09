const mongoose = require("mongoose");

const userSchema = mongoose.Schema({
    telegram: {
        firstName: String,
        id: Number,
        userName: String
    },
    pip: {
        version: Number,
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
        timeStamp: Date
    },
    history: {
        pip: [{
            version: Number,
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
            timeStamp: Number
        }]
    }
});

module.exports = userSchema;