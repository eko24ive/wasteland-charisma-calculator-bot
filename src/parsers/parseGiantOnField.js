
const {
  regexps,
} = require('../regexp/regexp');

const parseGiantOnField = (data) => {
  const [, name] = regexps.giantNameOnField.exec(data);
  const [, healthCurrent, healthCap] = regexps.giantHealthOnField.exec(data);

  return {
    name,
    healthCurrent: Number(healthCurrent),
    healthCap: Number(healthCap),
  };
};

module.exports = parseGiantOnField;
