const _ = require('underscore');
const moment = require('moment');

const {
    regexps
} = require('./src/regexp/regexp');

const checkPips = require('./src/utils/comparePips');

const oData = [{
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

const processData = (data, dataPips) => {
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
        pips: [],
        pipMismatchOccurred: false,
        deathData: {},
        pipRequired: true,
        error: [],
        recalculationRequired: false,
        criticalError: false
    };

    const updatesData = {
        locations: [],
        beasts: []
    };

    if (dataPips.length > 1) {
        if (!checkPips(dataPips)) {
            reportData.criticalError = 'Пипы не соответсвуют!';
            return reportData;
        }

        reportData.lastPip = dataPips.pop();
    } else if (dataPips.length === 1) {
        reportData.lastPip = dataPips.pop();
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

        if (dataType === 'location') {
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

        }

        if (dataType === 'regularBeast') {
            const beastData = {
                isDungeon: false
            };

            beastData.name = data.name;
            beastData.distanceRange = [data.distance];


            if (data.fightResult === 'win') {
                beastData.battles = [{
                    outcome: 'win'
                }];
                beastData.receivedItems = normalizeItems(data.receivedItems);
                beastData.capsReceived = Number(data.capsReceived);
                beastData.materialsReceived = Number(data.materialsReceived);
            } else if (data.fightResult === 'lose') {
                beastData.battles = [{
                    outcome: 'lost'
                }];

                beastData.capsReceived = Number(data.capsReceived);
                beastData.materialsReceived = Number(data.materialsReceived);
            }

            if (data.amountOfConcussions.length > 0) {
                beastData.concussions = [{
                    amount: data.amountOfConcussions.length
                }];

                if (reportData.lastPip) {
                    beastData.concussions[0].agility = reportData.lastPip.agility;
                } else {
                    reportData.recalculationRequired = true;
                }
            }

            if (reportData.lastPip) {
                beastData.battles[0].armor = reportData.lastPip.armor
            } else {
                reportData.recalculationRequired = true;
            }

            beastData.battles[0].totalDamageGiven = data.damagesGiven.reduce((a, b) => a + b);
            beastData.battles[0].totalDamageReceived = data.damagesReceived.reduce((a, b) => a + b);
            beastData.battles[0].damagesGiven = data.damagesGiven;
            beastData.battles[0].damagesReceived = data.damagesReceived;
            beastData.battles[0].healthOnStart = data.currentHealth + beastData.battles[0].totalDamageReceived;

            updatesData.beasts.push(beastData);

        }

        if (dataType === 'dungeonBeast') {
            const beastData = {
                isDungeon: false
            };

            beastData.name = data.name;
            beastData.distanceRange = [data.distance];


            if (data.fightResult === 'win') {
                beastData.battles = [{
                    outcome: 'win'
                }];
                beastData.receivedItems = normalizeItems(data.receivedItems);
                beastData.capsReceived = Number(data.capsReceived);
                beastData.materialsReceived = Number(data.materialsReceived);
            } else if (data.fightResult === 'lose') {
                beastData.battles = [{
                    outcome: 'lost'
                }];

                beastData.capsReceived = Number(data.capsReceived);
                beastData.materialsReceived = Number(data.materialsReceived);
            }

            if (data.amountOfConcussions.length > 0) {
                beastData.concussions = [{
                    amount: data.amountOfConcussions.length
                }];

                if (reportData.lastPip) {
                    beastData.concussions[0].agility = reportData.lastPip.agility;
                } else {
                    reportData.recalculationRequired = true;
                }
            }

            if (reportData.lastPip) {
                beastData.battles[0].armor = reportData.lastPip.armor
            } else {
                reportData.recalculationRequired = true;
            }

            beastData.battles[0].totalDamageGiven = data.damagesGiven.reduce((a, b) => a + b);
            beastData.battles[0].totalDamageReceived = data.damagesReceived.reduce((a, b) => a + b);
            beastData.battles[0].damagesGiven = data.damagesGiven;
            beastData.battles[0].damagesReceived = data.damagesReceived;
            beastData.battles[0].healthOnStart = data.currentHealth + beastData.battles[0].totalDamageReceived;

            updatesData.beasts.push(beastData);
        }

        if (dataType === 'flee') {
            const beastData = {
                isDungeon: false,
                distanceRange: [data.distance]
            };

            if (reportData.lastBeastSeen) {
                beastData.name = reportData.lastBeastSeen.name
            } else {
                reportData.error.push("Не могу найти в форвардах монстра от которого ты сбежал");
            }

            beastData.flees = [{
                outcome: data.outcome
            }]

            if (data.outcome === 'lose') {
                beastData.flees[0].damageReceived = [data.healthInjuries];
            }

            if (reportData.lastPip) {
                beastData.flees[0].agility = reportData.lastPip.agility;
            } else {
                reportData.recalculationRequired = true;
            }

            updatesData.beasts.push(beastData);

            // if (reportData.lastPip) {
            //     updatesData.flees = `Unsucsessfull flee from ${reportData.lastBeastSeen.name} on ${reportData.distance} with agility ${reportData.lastPip.agility}`;
            // }
        }

        if (dataType === 'deathMessage') {
            reportData.isDead = true;
            reportData.capsLost -= data.capsLost;
            reportData.materialsLost -= data.materialsLost;

            if (reportData.lastFleeDefeat === reportData.distance) {
                reportData.deathData.reason = 'flee';
            }

        }

        if (dataType === 'pipboy') {
            reportData.lastPip = data;
            reportData.pipRequired = false;
            reportData.pips.push(data);
        }


    });

    // reportData.receivedItems = _.flatten(reportData.receivedItems);
    // console.log(JSON.stringify(updatesData));
    // console.log(updatesData);

    return {
        reportData,
        updatesData
    }
}

module.exports = processData;