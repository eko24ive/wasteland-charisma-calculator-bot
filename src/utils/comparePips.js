const _ = require('underscore');

const blacklistKeys = [
  'faction',
  'name',
  'version',
  'damage',
  'armor',
  'hunger',
  'precision',
  'charisma',
  'endurance'
];

const comparePips = (newPip, lastPip) => {
  return Object.keys(lastPip).map(key => {
    if(!_.contains(blacklistKeys, key)) {
      const newPipValue = newPip[key];
      const lastPipValue = lastPip[key];

      if(_.isNumber(newPipValue) && _.isNumber(lastPipValue)) {
        return (newPipValue - lastPipValue) >= 0;
      }
    }


    return true;
  }).every(validation => validation === true);
}

const check = pips => {
  var size = pips.length -1;
  var checks = [];
  pips.forEach((current,i) => {
      if(i<size) {
        const next = pips[i+1];
          checks.push(comparePips(next, current));
      }
  });

  return checks.every(check => check === true);
}

module.exports = check;