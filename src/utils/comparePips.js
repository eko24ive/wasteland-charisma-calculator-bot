const _ = require('underscore');

const blacklistKeys = [
  'timeStamp',
  'faction',
  'name',
  'version',
  'damage',
  'armor',
  'hunger',
  'precision',
  'charisma',
  'endurance',
  'squad',
  'strength',
  'agility',
];

const comparePips = (newPip, lastPip) => Object.keys(lastPip).map((key) => {
  if (!_.contains(blacklistKeys, key)) {
    const newPipValue = newPip[key];
    const lastPipValue = lastPip[key];

    if (_.isNumber(newPipValue) && _.isNumber(lastPipValue)) {
      return (newPipValue - lastPipValue) >= 0;
    }
  }


  return true;
}).every(validation => validation === true);

const checkPips = (pips) => {
  const size = pips.length - 1;
  const checks = [];
  pips.forEach((current, i) => {
    if (i < size) {
      const next = pips[i + 1].data;
      checks.push(comparePips(next, current.data));
    }
  });

  return checks.every(check => check === true);
};

module.exports = checkPips;
