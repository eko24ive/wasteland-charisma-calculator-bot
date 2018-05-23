const {
    regexps
} = require('../regexp/regexp');

const parseFleeDefeat = flee => {
    const splitted = flee.split('\n');
    let outcome, capsLost, materialsLost, healthInjuries;

    const [, distance] = regexps.campDistanceRegExp.exec(flee);

    if(regexps.beastDefeatCapsLostRegExp.test(flee)) {
        [, capsLost] = regexps.beastDefeatCapsLostRegExp.exec(flee);
    }
    
    if(regexps.beastDefeatMaterialsLostRegExp.test(flee)) {
        [, materialsLost] = regexps.beastDefeatMaterialsLostRegExp.exec(flee);
    }
    
    if(regexps.injuryRegExp.test(flee)) {
        [, healthInjuries] = regexps.injuryRegExp.exec(flee);
    }
    
    if(regexps.beastSuccessFleeRegExp.test(flee)) {
        outcome = 'win'
    }
    
    if(regexps.beastDefeatFleeRegExp.test(flee)) {
        outcome = 'lose'
    }

    const [, negativePrefix, currentHealth, healthCap] = regexps.healthRegExp.exec(flee);
    
negativePrefix
    return {
        outcome,
        distance: Number(distance),
        capsLost,
        materialsLost,
        healthInjuries: Number(healthInjuries),
        currentHealth: Number(`${negativePrefix}${currentHealth}`)
    }
};

module.exports = parseFleeDefeat;