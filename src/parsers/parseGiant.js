
const {
  regexps,
} = require('../regexp/regexp');

const parseGiant = (data) => {
  const [, name, healthCurrent, healthCap] = regexps.giantHealthRegExp.exec(data);

  return {
    name,
    healthCurrent: Number(healthCurrent),
    healthCap: Number(healthCap),
  };
};

module.exports = parseGiant;
