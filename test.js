const _ = require('underscore');
const moment = require('moment');

const {
    regexps
} = require('./src/regexp/regexp');

const data = [{
    "data": {
        "version": 2,
        "faction": "⚙️Убежище 4",
        "health": 204,
        "name": "Anatoliy",
        "damage": 386,
        "armor": 101,
        "hunger": 40,
        "strength": 170,
        "precision": 15,
        "charisma": 85,
        "agility": 58,
        "endurance": 9
    },
    "dataType": "pipboy",
    "date": 1525700743
}, {
    "data": {
        "name": "Мост",
        "isRaid": false,
        "distance": "45",
        "type": "unknown",
        "capsReceived": 0,
        "materialsReceived": 0,
        "capsLost": 0,
        "materialsLost": 0,
        "healthInjuries": 0,
        "receivedItems": [],
        "receivedBonusItems": [],
        "beastFaced": {
            "faced": true,
            "name": "🐉Туннельщик (🏵🏵🏵Мифический)"
        },
        "effect": "none"
    },
    "dataType": "location",
    "date": 1525701951
}, {
    "data": {
        "distance": "45",
        "name": "🐉Туннельщик (🏵🏵🏵Мифический)",
        "isDungeon": false,
        "capsReceived": "2516",
        "materialsReceived": "3490",
        "receivedItems": ["🔗Кубонит х155"],
        "damageReceived": ["61"],
        "damagesGiven": ["459", "341"],
        "fightResult": "win",
        "amountOfConcussions": []
    },
    "dataType": "regularBeast",
    "date": 1525701981
}, {
    "data": {
        "name": "Палаточный лагерь",
        "isRaid": false,
        "distance": "47",
        "type": "unknown",
        "capsReceived": 290,
        "materialsReceived": 296,
        "capsLost": 0,
        "materialsLost": 0,
        "healthInjuries": 0,
        "receivedItems": ["🔗Кубонит 192", "Сухари"],
        "receivedBonusItems": ["Провода x1"],
        "beastFaced": {
            "faced": false,
            "name": null
        },
        "effect": "good"
    },
    "dataType": "location",
    "date": 1525702251
}, {
    "data": {
        "name": "Заброшенный супермаркет",
        "isRaid": false,
        "distance": "49",
        "type": "unknown",
        "capsReceived": 0,
        "materialsReceived": 0,
        "capsLost": 0,
        "materialsLost": 0,
        "healthInjuries": 0,
        "receivedItems": [],
        "receivedBonusItems": [],
        "beastFaced": {
            "faced": true,
            "name": "🦅Касадор (🔱Особь 60)"
        },
        "effect": "none"
    },
    "dataType": "location",
    "date": 1525702576
}, {
    "data": {
        "distance": "49",
        "capsLost": "18",
        "materialsLost": "21",
        "healthInjuries": "129"
    },
    "dataType": "fleeDefeat",
    "date": 1525702607
}, {
    "data": {
        "capsLost": "10524",
        "materialsLost": "41258"
    },
    "dataType": "deathMessage",
    "date": 1525702607
}];


const normalizeItems = items => {
    const normalizedItems = {};

    items.forEach(item => {
        let name = item,
            amount;
        if (regexps.metalAmountRegExp.test(item)) {
            [, name, amount] = regexps.metalAmountRegExp.exec(item);
        }

        if (regexps.emojiRecourceAmount.test(item)) {
            [, name, amount] = regexps.emojiRecourceAmount.exec(item);
        }

        if (regexps.bonusEmojiResourceAmount.test(item)) {
            [, name, amount] = regexps.bonusEmojiResourceAmount.exec(item);
        }

        if (regexps.multipleItemsReceived.test(item)) {
            [, name, amount] = regexps.multipleItemsReceived.exec(item);
        }

        if (normalizedItems[name]) {
            const existingAmount = normalizedItems[name];

            if (amount === undefined) {
                normalizedItems[name] += 1;

            } else {
                normalizedItems[name] += Number(amount);

            }
        } else {
            normalizedItems[name] = Number(amount) || 1;
        }
    });

    return normalizedItems;
};

const reportData = {
    capsReceived: 0,
    capsLost: 0,
    materialsLost: 0,
    materialsReceived: 0,
    receivedItems: [],
    isDead: false,
    distance: 0,
    lastBeastSeen: null,
    lastPip: null,
    pipMismatchOccurred: false,
    deathData: {},
    pipRequired: true
};

const updatesData = {
    locations: [],
    beasts: []
}

data.sort((first, second) => {
    if (first.date < second.date) {
        return -1;
    }
    if (first.date > second.date) {
        return 1;
    }
    return 0;
}).forEach(({
    data,
    dataType
}) => {
    switch (dataType) {
        case 'location':
            const locationData = _.clone(data);

            if (data.effect) {
                if (data.effect === 'bad') {
                    reportData.capsLost -= data.capsLost;
                    reportData.materialsLost -= data.materialsLost;
                } else if (data.effect === 'good') {
                    reportData.receivedItems.push(_.flatten([data.receivedItems, data.receivedBonusItems]));
                    reportData.capsReceived += data.capsReceived;
                    reportData.materialsReceived += data.materialsReceived;

                    locationData.receivedItems = normalizeItems(data.receivedItems);
                    locationData.receivedBonusItems = normalizeItems(data.receivedBonusItems);
                }
            }

            if (data.beastFaced.faced) {
                reportData.lastBeastSeen = data.beastFaced;
            }

            reportData.distance = data.distance;

            delete locationData.beastFaced;
            updatesData.locations.push(locationData);

            break;
        case 'regularBeast':
            if (data.fightResult === 'win') {
                reportData.receivedItems.push(_.flatten([data.receivedItems]));
                reportData.capsReceived += Number(data.capsReceived);
                reportData.materialsReceived += Number(data.materialsReceived);
            } else if (data.fightResult === 'lose') {

            }

            break;
        case 'dungeonBeast':
            break;
        case 'fleeDefeat':
            reportData.lastFleeDefeat = data.distance;

            // if (reportData.lastPip) {
            //     updatesData.flees = `Unsucsessfull flee from ${reportData.lastBeastSeen.name} on ${reportData.distance} with agility ${reportData.lastPip.agility}`;
            // }
            break;
        case 'deathMessage':
            reportData.isDead = true;
            reportData.capsLost -= data.capsLost;
            reportData.materialsLost -= data.materialsLost;

            if (reportData.lastFleeDefeat === reportData.distance) {
                reportData.deathData.reason = 'flee';
            }

            break;
        case 'pipboy':
            reportData.lastPip = data;
            reportData.pipRequired = false;
            break;
    }
});

reportData.receivedItems = _.flatten(reportData.receivedItems);
console.log(JSON.stringify(updatesData));
// console.log(updatesData);