const _ = require('underscore');

const blacklistKeys = [
  'faction',
  'name',
  'version'
]

const comparePips = (newPip, lastPip) => {
  return Object.keys(lastPip).map(key => {
    if(!_.contains(blacklistKeys, key)) {
      const newPipValue = newPip[key];
      const lastPipValue = lastPip[key];

      if(_.isNumber(newPipValue) && _.isNumber(lastPipValue)) {
        return (newPipValue - lastPipValue) > 0;
      }
    }


    return true;
  }).every(validation => validation === true);
}

module.exports = comparePips;