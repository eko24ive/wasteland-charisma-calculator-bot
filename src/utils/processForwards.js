const _ = require('underscore');
const moment = require('moment');

const {
    regexps
} = require('./../regexp/regexp');

const checkPips = require('../utils/comparePips');

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
                normalizedItems[name] = [1];

            } else {
                normalizedItems[name] = [Number(amount)];

            }
        } else {
            normalizedItems[name] = [Number(amount || 1)];
        }
    });

    return normalizedItems;
};

// TODO: Validate kilometers
// TODO: Handle death
// TODO: Typescript

const processForwards = (inputData, config) => {
    const reportData = {
        capsReceived: 0,
        capsLost: 0,
        materialsLost: 0,
        materialsReceived: 0,
        receivedItems: [],
        isDead: false,
        distance: 0,
        lastBeastSeen: null,
        lastBeastSeenType: null,
        lastPip: null,
        pips: [],
        pipMismatchOccurred: false,
        deathData: {},
        pipRequired: true,
        errors: [],
        recalculationRequired: false,
        criticalError: false,
        healthCapHistory: [],
        distanceHistory: [],
        beastToValidate: [],
        prcoessAllowed: true
    };

    const updatesData = {
        locations: [],
        beasts: []
    };

    if (inputData.length === 0) {
        return {
            reportData,
            updatesData
        }
    }

    const dataPips = inputData.filter(({
        dataType
    }) => dataType === 'pipboy').sort((first, second) => {
        if (first.date < second.date) {
            return -1;
        }
        if (first.date > second.date) {
            return 1;
        }
        return 0;
    });

    if (dataPips.length > 1) {
        if (!checkPips(dataPips)) {
            reportData.criticalError = 'Пипы не соответствуют!';
            return {reportData};
        }

        reportData.lastPip = dataPips.pop().data;
        reportData.pipRequired = false;
    } else if (dataPips.length === 1) {
        reportData.lastPip = dataPips.pop().data;
        reportData.pipRequired = false;
    }

    // 1525607351
    if(inputData.filter(({date}) => date < 1525607078).length > 0) {
        reportData.criticalError = 'Был замечен форвард время которого меньше за время выкатки обновы Wasteland Wars';

        return {reportData};
    }

    inputData.sort((first, second) => {
        if (first.date < second.date) {
            return -1;
        }
        if (first.date > second.date) {
            return 1;
        }
        return 0;
    }).forEach(({
        data,
        dataType,
        date,
        userId
    }) => {
        if(reportData.prcoessAllowed) {
            const lastDistance = _.last(reportData.distanceHistory);

            const mismatch = reportData.distanceHistory.some(distance => {
                return distance > lastDistance;
            });

            if(mismatch) {
                reportData.prcoessAllowed = false;
                const distanceProcessed = reportData.distanceHistory.filter((v,index) => index !== reportData.distanceHistory.length-1);
                const lastpProcessedDistance = _.last(distanceProcessed);

                reportData.errors.push(`Похоже что ты скинул километры с других кругов, я не обрабатывал данные что ты скинул после ${lastpProcessedDistance}км\nЯ обработал данные за: ${distanceProcessed.join('км, ')}км`);
            }
        }
        if (dataType === 'location' && reportData.prcoessAllowed) {
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
                reportData.lastBeastSeen = {
                    name: data.beastFaced.name,
                    distance: data.distance
                };

                reportData.lastBeastSeenType = 'regular';
            }

            reportData.distance = data.distance;
            reportData.distanceHistory.push(data.distance);

            delete locationData.beastFaced;
            updatesData.locations.push(locationData);
            reportData.healthCapHistory.push(data.healthCap)

        }

        if (dataType === 'regularBeast' && reportData.prcoessAllowed) {
            const isDungeon = reportData.lastBeastSeenType !== 'regular';

            const beastData = {
                isDungeon
            };

            beastData.name = data.name;
            beastData.distanceRange = [data.distance];
            reportData.distance = data.distance;
            reportData.distanceHistory.push(data.distance);


            if (data.fightResult === 'win') {
                beastData.battles = [{
                    outcome: 'win'
                }];
                beastData.receivedItems = normalizeItems(data.receivedItems);

                if(Number(data.capsReceived) !== 0) {
                    beastData.capsReceived = Number(data.capsReceived);
                    beastData.isDungeon = false;
                }

                if(Number(data.materialsReceived) !== 0) {
                    beastData.materialsReceived = Number(data.materialsReceived);
                    beastData.isDungeon = false;
                }
            } else if (data.fightResult === 'lose') {
                beastData.battles = [{
                    outcome: 'lost'
                }];

                reportData.isDead = true;
                reportData.errors.push(`Вижу, ты склеил ласты на ${reportData.distance} километре. Сочуствую. Я не обрабатывал форварды после твоей смерти`);
            }

            if (data.amountOfConcussions.length > 0) {
                beastData.concussions = [{
                    amount: data.amountOfConcussions.length
                }];

                if (reportData.lastPip) {
                    beastData.concussions[0].stats = {agility: reportData.lastPip.agility};
                } else {
                    reportData.recalculationRequired = true;
                }
            }

            if (reportData.lastPip) {
                beastData.battles[0].stats = {
                    armor: reportData.lastPip.armor,
                    damage: reportData.lastPip.damage
                }


            } else {
                reportData.recalculationRequired = true;
            }

            if(data.damagesGiven.length === 0) {
                beastData.battles[0].totalDamageGiven = 0;
            } else {
                beastData.battles[0].totalDamageGiven = data.damagesGiven.reduce((a, b) => a + b);
            }

            if(data.damagesReceived.length === 0) {
                beastData.battles[0].totalDamageReceived = 0;
            } else {
                beastData.battles[0].totalDamageReceived = data.damagesReceived.reduce((a, b) => a + b);
            }

            if(data.damagesGiven.length === 0) {
                beastData.battles[0].damagesGiven = [0];
            } else {
                beastData.battles[0].damagesGiven = data.damagesGiven;
            }

            if(data.damagesReceived.length === 0) {
                beastData.battles[0].damagesReceived = [0];
            } else {
                beastData.battles[0].damagesReceived = data.damagesReceived;
            }

            beastData.battles[0].healthOnStart = data.currentHealth + beastData.battles[0].totalDamageReceived;
            beastData.battles[0].stamp = `${date}${userId}`;

            if (data.fightResult === 'lose') {
                if (!reportData.lastBeastSeen) {
                    beastData.battles = [];

                    reportData.beastToValidate.push({name: data.name, distance: data.distance});
                } else {
                    if(data.name !== reportData.lastBeastSeen.name && reportData.lastBeastSeenType !== 'regular' && data.fightResult === 'lose') {
                        beastData.battles = [];

                        reportData.beastToValidate.push({name: data.name, distance: data.distance});
                    }
                }
            }


            updatesData.beasts.push(beastData);
            reportData.healthCapHistory.push(data.meta.healthCap)
        }

        if (dataType === 'dungeonBeast' && reportData.prcoessAllowed) {
            const isDungeon = reportData.lastBeastSeenType !== 'regular';

            const beastData = {
                isDungeon
            };

            beastData.name = data.name;
            beastData.distanceRange = [data.distance];
            reportData.distance = data.distance;
            reportData.distanceHistory.push(data.distance);

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

        if (dataType === 'flee' && reportData.prcoessAllowed) {
            const beastData = {
                isDungeon: false,
                distanceRange: [data.distance]
            };

            reportData.distanceHistory.push(data.distance);

            if (reportData.lastBeastSeen) {
                if(data.distance === reportData.lastBeastSeen.distance) {
                    beastData.name = reportData.lastBeastSeen.name;

                    beastData.flees = [{
                        outcome: data.outcome,
                        stamp: `${date}${userId}`
                    }]

                    if (data.outcome === 'lose') {
                        beastData.flees[0].damageReceived = data.healthInjuries;

                        if(data.currentHealth <= 0) {
                            reportData.isDead = true;
                            reportData.errors.push(`Вижу, ты склеил ласты на ${reportData.distance} километре. Сочуствую. Я не обрабатывал форварды после твоей смерти`);
                        }
                    }

                    if (reportData.lastPip) {
                        beastData.flees[0].stats = {
                            agility: reportData.lastPip.agility
                        }
                    } else {
                        reportData.recalculationRequired = true;
                    }

                    updatesData.beasts.push(beastData);
                } else {
                    reportData.beastToValidate.push({name: '???', distance: data.distance});
                }
            } else {
                reportData.beastToValidate.push({name: '???', distance: data.distance});
            }
        }

        if (dataType === 'deathMessage' && !reportData.isDead && reportData.prcoessAllowed) {
            reportData.isDead = true;
            reportData.prcoessAllowed = false;
            reportData.capsLost -= data.capsLost;
            reportData.materialsLost -= data.materialsLost;

            if (reportData.lastFleeDefeat === reportData.distance) {
                reportData.deathData.reason = 'flee';
            }

            reportData.errors.push(`Вижу, ты склеил ласты на ${reportData.distance} километре. Сочуствую. Я не обрабатывал форварды после твоей смерти`);
        }

        if (dataType === 'pipboy' && reportData.prcoessAllowed) {
            reportData.lastPip = data;
            reportData.pipRequired = false;
            reportData.pips.push(data);
        }

        if (dataType === 'dungeonBeastFaced' && reportData.prcoessAllowed) {
            reportData.lastBeastSeen = {name: data.name};
            reportData.lastBeastSeenType = 'dungeon';
        }
    });

    if(reportData.lastPip) {
        if(reportData.healthCapHistory.some(health => health > reportData.lastPip.health)) {
            reportData.criticalError = 'Была замечена прокачка уровня здоровья. Во время одной вылазки подобное - не возможно.';
            reportData.couldBeUpdated = true;
        } else if (reportData.healthCapHistory.some(health => health < reportData.lastPip.health)) {
            reportData.criticalError = 'Была замечена прокачка уровня здоровья. Во время одной вылазки подобное - не возможно.';
            reportData.couldBeUpdated = false;
        }
    }

    return {
        reportData,
        updatesData
    }
}

module.exports = processForwards;