const skillMap = require('../constants/skillMap');
const { AVAILABLE_CAP } = require('../constants/constants');

const upgradeAmountValidation = ({
  pip, skillToUpgrade, upgradeAmount,
}) => {
  const skill = skillMap[skillToUpgrade];
  const currentSkillLevel = pip[skill];
  const upgradedSkillLevel = currentSkillLevel + upgradeAmount;

  return upgradedSkillLevel < AVAILABLE_CAP;
};

module.exports = upgradeAmountValidation;
