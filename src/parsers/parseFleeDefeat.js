const {
    regexps
} = require('../regexp/regexp');

const parseFleeDefeat = deathMessage => {
    const splitted = deathMessage.split('\n');

    const [, distance] = regexps.campDistanceRegExp.exec(deathMessage);
    const [, capsLost] = regexps.beastDefeatCapsLostRegExp.exec(deathMessage);
    const [, materialsLost] = regexps.beastDefeatMaterialsLostRegExp.exec(deathMessage);
    const [, healthInjuries] = regexps.injuryRegExp.exec(deathMessage);

    return {
        distance,
        capsLost,
        materialsLost,
        healthInjuries
    }
};

module.exports = parseFleeDefeat;