const skillCap = require('../constants/skillCap');
const skillMap = require('../constants/skillMap');

const upgradeAmountValidation = (pip, skillToUpgrade, upgradeAmount) => {
  const skill = skillMap[skillToUpgrade];
  const currentSkillLevel = pip[skill];
  const upgradedSkillLevel = currentSkillLevel + upgradeAmount;

  return upgradedSkillLevel < skillCap[skill];
};


module.exports = upgradeAmountValidation;
