const {
    regexps
} = require('../regexp/regexp');


const parseRegularBeast = beast => {
    const splitted = beast.split('\n');
    const meta = {};

    let capsReceived = 0,
        materialsReceived = 0,
        fightResult = null;

    const isDungeon = false;
    const [, distance] = regexps.campDistanceRegExp.exec(beast);
    const [, name] = regexps.beastNameRegExp.exec(beast);

    if (regexps.actionReceivedCapsRegExp.test(beast)) {
        [, capsReceived] = regexps.actionReceivedCapsRegExp.exec(beast);
    }
    if (regexps.actionReceivedMaterialsRegExp.test(beast)) {
        [, materialsReceived] = regexps.actionReceivedMaterialsRegExp.exec(beast);
    }

    if (regexps.beastVictoryRegExp.test(beast)) {
        fightResult = 'win';
    } else if (regexps.beastDefeatMaterialsLostRegExp.test(beast)) {
        fightResult = 'lose';
    }

    const damagesReceived = splitted.map(row => {
        if (regexps.beastAttackRegExp.test(row)) {
            var [, dmg] = regexps.beastAttackRegExp.exec(row);

            return Number(dmg);
        }

        return false
    }).filter(dmg => dmg !== false);

    const damagesGiven = splitted.map(row => {
        if (regexps.playerBeastAttackRegExp.test(row)) {
            var [, dmg] = regexps.playerBeastAttackRegExp.exec(row);

            return Number(dmg);
        }

        return false
    }).filter(dmg => dmg !== false);

    const amountOfConcussions = splitted.map(row => {
        if (regexps.beastStunRegExp.test(row)) {
            return true;
        }

        return false
    }).filter(dmg => dmg !== false);

    const receivedItems = splitted.map(row => {
        if (regexps.receivedItemRegExp.test(row)) {
            var [, item] = regexps.receivedItemRegExp.exec(row);

            return item;
        }

        return false;
    }).filter(item => item !== false);

    const [, negativePrefix, currentHealth, healthCap] = regexps.healthRegExp.exec(beast);

    return {
        distance: Number(distance),
        name,
        isDungeon,
        capsReceived: Number(capsReceived),
        materialsReceived: Number(materialsReceived),
        receivedItems,
        damagesReceived,
        damagesGiven,
        fightResult,
        currentHealth: Number(`${negativePrefix}${currentHealth}`),
        amountOfConcussions,
        meta: {
            healthCap: Number(healthCap)
        }
    }
};

const parseDungeonBeast = beast => {
    const splitted = beast.split('\n');

    const isDungeon = true;
    const [, distance] = regexps.campDistanceRegExp.exec(beast);
    const [, name] = regexps.beastNameRegExp.exec(beast);

    const damageReceived = splitted.map(row => {
        if (regexps.beastAttackRegExp.test(row)) {
            var [, dmg] = regexps.beastAttackRegExp.exec(row);

            return dmg;
        }

        return false;
    }).filter(dmg => dmg !== false);

    const damagesGiven = splitted.map(row => {
        if (regexps.playerBeastAttackRegExp.test(row)) {
            var [, dmg] = regexps.playerBeastAttackRegExp.exec(row);

            return dmg;
        }

        return false;
    }).filter(dmg => dmg !== false);

    const amountOfConcussions = splitted.map(row => {
        if (regexps.beastStunRegExp.test(row)) {
            return true;
        }

        return false;
    }).filter(dmg => dmg !== false);

    const [, currentHealth] = regexps.currentHealthRegExp.exec(beast);

    return {
        distance,
        name,
        isDungeon,
        damageReceived,
        damagesGiven,
        currentHealth,
        amountOfConcussions
    }
};

module.exports = {
    parseRegularBeast,
    parseDungeonBeast
}