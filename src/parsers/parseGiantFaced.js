
const {
  regexps,
} = require('../regexp/regexp');

const parseGiantFaced = (data) => {
  const [, distance] = regexps.campDistanceRegExp.exec(data);
  const [, name, healthCurrent, healthCap] = regexps.giantHealthRegExp.exec(data);

  return {
    name,
    distance: Number(distance),
    healthCurrent: Number(healthCurrent),
    healthCap: Number(healthCap),
  };
};

module.exports = parseGiantFaced;
