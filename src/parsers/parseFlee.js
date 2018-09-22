const {
  regexps,
} = require('../regexp/regexp');

const parseFleeDefeat = (flee) => {
  let outcome;
  let capsLost;
  let materialsLost;
  let healthInjuries;
  let type;

  const [, distance] = regexps.campDistanceRegExp.exec(flee);

  if (regexps.beastDefeatCapsLostRegExp.test(flee)) {
    [, capsLost] = regexps.beastDefeatCapsLostRegExp.exec(flee);
  }

  if (regexps.beastDefeatMaterialsLostRegExp.test(flee)) {
    [, materialsLost] = regexps.beastDefeatMaterialsLostRegExp.exec(flee);
  }

  if (regexps.injuryRegExp.test(flee)) {
    [, healthInjuries] = regexps.injuryRegExp.exec(flee);
  }

  if (regexps.beastSuccessFleeRegExp.test(flee)) {
    outcome = 'win';
  }

  if (regexps.beastDefeatFleeRegExp.test(flee)) {
    outcome = 'lose';
  }

  if (regexps.darkZone.test(flee)) {
    type = 'DarkZone';
  } else {
    type = 'Regular';
  }

  const [, negativePrefix, currentHealth] = regexps.healthRegExp.exec(flee);

  return {
    outcome,
    distance: Number(distance),
    capsLost,
    materialsLost,
    healthInjuries: Number(healthInjuries),
    currentHealth: Number(`${negativePrefix}${currentHealth}`),
    type,
  };
};

module.exports = parseFleeDefeat;
