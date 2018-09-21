const {
    regexps
} = require('../regexp/regexp');

const parseLocation = location => {
    const splitted = location.split('\n');

    let capsReceived = 0,
        materialsReceived = [],
        capsLost = 0,
        materialsLost = 0,
        healthInjuries = 0,
        effect = 'none',
        isRaid = false;

    let beastFaced = {
        faced: false,
        name: null
    };

    const type = 'unknown';

    const [, distance] = regexps.campDistanceRegExp.exec(location);
    const [, negativePrefix, currentHealth, healthCap] = regexps.healthRegExp.exec(location);

    let [, name] = regexps.locationNameRegExp.exec(location);

    if(regexps.locationRaidPostfixRegExp.test(name)) {
        name = name.replace(regexps.locationRaidPostfixRegExp);
        isRaid = true;
    }

    if (regexps.receivedCapsAndMaterialsRegExp.test(location)) {
        [, capsReceived, materialsReceived] = regexps.receivedCapsAndMaterialsRegExp.exec(location);
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
    if (regexps.beastFacedRegExp.test(location)) {
        const [, name] = regexps.beastFacedRegExp.exec(location);
        let type;

        if (regexps.darkZone.test(location)) {
            type = 'DarkZone';
        } else {
            type = 'Regular';
        }

        beastFaced.faced = true;
        beastFaced.name = name;
        beastFaced.type = type;
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
        distance: Number(distance),
        type,
        capsReceived: Number(capsReceived),
        materialsReceived: Number(materialsReceived),
        capsLost: Number(capsLost),
        materialsLost: Number(materialsLost),
        healthInjuries: Number(healthInjuries),
        receivedItems,
        receivedBonusItems,
        beastFaced,
        healthCap: Number(healthCap),
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