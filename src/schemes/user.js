const mongoose = require("mongoose");

const userSchema = mongoose.Schema({
    restricted: Boolean,
    telegram: {
        firstName: String,
        id: Number,
        userName: String,
        userNamesHistory: [String]
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
    points: {
        score: Number,
        forwards: {
            beast: {
                wins: Number,
                loss: Number,
                flee: Number
            },
            locations: Number,
            giants: Number

        }
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
}, {
    timestamps: {
        createdAt: 'createdAt',
        updatedAt: 'updatedAt'
    }
});

module.exports = userSchema;