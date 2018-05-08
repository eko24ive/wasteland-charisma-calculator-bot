const {
    regexps
} = require('../regexp/regexp');

const parseLocation = location => {
    const splitted = location.split('\n');

    let capsReceived, materialsReceived, capsLost, materialsLost, healthInjuries, effect, isRaid;

    const type = 'unknown';

    const [, distance] = regexps.campDistanceRegExp.exec(location);
    let [, name] = regexps.locationNameRegExp.exec(location);

    if(regexps.locationRaidPostfixRegExp.test(name)) {
        name = name.replace(regexps.locationRaidPostfixRegExp);
        isRaid = true;
    }

    if (regexps.receivedCapsRegExp.test(location)) {
        [, capsReceived] = regexps.receivedCapsRegExp.exec(location);
    }
    if (regexps.receivedMaterialsRegExp.test(location)) {
        [, materialsReceived] = regexps.receivedMaterialsRegExp.exec(location);
    }
    if (regexps.capsLostRegExp.test(location)) {
        [, capsLost] = regexps.capsLostRegExp.exec(location);
    }
    if (regexps.materialsLostRegExp.test(location)) {
        [, materialsLost] = regexps.materialsLostRegExp.exec(location);
    }
    if (regexps.injuryRegExp.test(location)) {
        [, healthInjuries] = regexps.injuryRegExp.exec(location);
    }

    const receivedItems = splitted.map(row => {
        if (regexps.receivedItemRegExp.test(row)) {
            var [, item] = regexps.receivedItemRegExp.exec(row);

            return item;
        }

        return false;
    }).filter(item => item !== false);

    const receivedBonusItems = splitted.map(row => {
        if (regexps.receivedBonusItemRegExp.test(row)) {
            var [, item] = regexps.receivedBonusItemRegExp.exec(row);

            return item;
        }

        return false;
    }).filter(item => item !== false);

    const locationData = {
        name,
        isRaid,
        distance,
        type,
        capsReceived: Number(capsReceived),
        materialsReceived: Number(materialsReceived),
        capsLost: Number(capsLost),
        materialsLost: Number(materialsLost),
        healthInjuries: Number(healthInjuries),
        receivedItems,
        receivedBonusItems
    }

    if(locationData.capsReceived > 0 || locationData.materialsReceived > 0) {
        effect = 'good';
    } else if((locationData.capsLost > 0 && locationData.materialsLost > 0) || locationData.healthInjuries) {
        effect = 'bad';
    }

    return {
        ...locationData,
        effect
    }
};

module.exports = parseLocation;