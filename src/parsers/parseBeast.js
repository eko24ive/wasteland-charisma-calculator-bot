const {
    regexps
} = require('../regexp/regexp');


const parseRegularBeast = beast => {
    const splitted = beast.split('\n');

    let capsReceived = 0,
        materialsReceived = 0,
        fightResult = null;

    const isDungeon = false;
    const [, distance] = regexps.campDistanceRegExp.exec(beast);
    const [, name] = regexps.beastNameRegExp.exec(beast);

    if(regexps.actionReceivedCapsRegExp.test(beast)) {
        [, capsReceived] = regexps.actionReceivedCapsRegExp.exec(beast);
    }
    if(regexps.actionReceivedMaterialsRegExp.test(beast)) {
        [, materialsReceived] = regexps.actionReceivedMaterialsRegExp.exec(beast);
    }

    if(regexps.beastVictoryRegExp.test(beast)) {
        fightResult = 'win';
    } else if(regexps.beastDefeatMaterialsLostRegExp.test(beast)) {
        fightResult = 'lose';
    }

    const damageReceived = splitted.map(row => {
        if(regexps.beastAttackRegExp.test(row)) {
            var [, dmg] = regexps.beastAttackRegExp.exec(row);

            return dmg;
        }

        return false
    }).filter(dmg => dmg !== false);

    const damagesGiven = splitted.map(row => {
        if(regexps.playerBeastAttackRegExp.test(row)) {
            var [, dmg] = regexps.playerBeastAttackRegExp.exec(row);

            return dmg;
        }

        return false
    }).filter(dmg => dmg !== false);

    const amountOfConcussions = splitted.map(row => {
        if(regexps.beastStunRegExp.test(row)) {
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

    return {
        distance,
        name,
        isDungeon,
        capsReceived,
        materialsReceived,
        receivedItems,
        damageReceived,
        damagesGiven,
        fightResult,
        amountOfConcussions
    }
};

const parseDungeonBeast = beast => {
    const splitted = beast.split('\n');

    const isDungeon = true;
    const [, distance] = regexps.campDistanceRegExp.exec(beast);
    const [, name] = regexps.beastNameRegExp.exec(beast);

    const damageReceived = splitted.map(row => {
        if(regexps.beastAttackRegExp.test(row)) {
            var [, dmg] = regexps.beastAttackRegExp.exec(row);

            return dmg;
        }

        return false;
    }).filter(dmg => dmg !== false);

    const damagesGiven = splitted.map(row => {
        if(regexps.playerBeastAttackRegExp.test(row)) {
            var [, dmg] = regexps.playerBeastAttackRegExp.exec(row);

            return dmg;
        }

        return false;
    }).filter(dmg => dmg !== false);

    const amountOfConcussions = splitted.map(row => {
        if(regexps.beastStunRegExp.test(row)) {
            return true;
        }

        return false;
    }).filter(dmg => dmg !== false);

    return {
        distance,
        name,
        isDungeon,
        damageReceived,
        damagesGiven,
        amountOfConcussions
    }
};

module.exports = {
    parseRegularBeast,
    parseDungeonBeast
}