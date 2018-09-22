const upgradeAmountValidation = (pip, skillToUpgrade, upgradeAmount, cap) => {
  const skillMap = {
    '❤ Живучесть': 'health',
    '💪 Сила': 'strength',
    '🔫 Меткость': 'precision',
    '🗣 Харизма': 'charisma',
    '🤸‍♀️ Ловкость': 'agility',
  };

  const currentSkillLevel = pip[skillMap[skillToUpgrade]];
  const upgradedSkillLevel = currentSkillLevel + upgradeAmount;

  return upgradedSkillLevel < cap;
};


module.exports = upgradeAmountValidation;
