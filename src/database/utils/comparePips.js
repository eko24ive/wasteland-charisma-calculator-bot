const _ = require('underscore');

const blacklistKeys = [
  'timeStamp',
];

const comparePips = (newPip, lastPip) => Object.keys(lastPip).map((key) => {
  if (!_.contains(blacklistKeys, key)) {
    const newPipValue = newPip[key];
    const lastPipValue = lastPip[key];

    if (_.isNumber(newPipValue) && _.isNumber(lastPipValue)) {
      return (newPipValue - lastPipValue) > 0;
    }
  }


  return null;
})
  .filter(validation => validation !== null)
  .some(validation => validation === true);

module.exports = comparePips;
