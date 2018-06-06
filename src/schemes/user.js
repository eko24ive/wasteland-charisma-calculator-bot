const mongoose = require("mongoose");

// TODO: Refactor points structure

const userSchema = mongoose.Schema({
    restricted: {
        type: Boolean,
        default: false
    },
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
        timeStamp: Number
    },
    points: {
        score: {
            type: Number,
            default: 0
        },
        forwards: {
            beast: {
                wins: {
                    type: Number,
                    default: 0
                },
                loss: {
                    type: Number,
                    default: 0
                },
                flee: {
                    type: Number,
                    default: 0
                }
            },
            locations: {
                type: Number,
                default: 0
            },
            giants: {
                type: Number,
                default: 0
            }
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