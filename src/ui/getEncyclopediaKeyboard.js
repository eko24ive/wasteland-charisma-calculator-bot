const _ = require('underscore');

const buttons = require('./buttons');
const regexps = require('../regexp/regexp');

const getEncyclopediaKeyboard = (data) => {
  const filteredButtons = data.buttons.filter(({ label, state }) => label !== buttons.showSettings.label && label !== buttons.showEncyclopedia.label && state === 'false');
  const sortedButons = _.sortBy(filteredButtons, ({ order }) => order);
  let labeledButtons = sortedButons.map(({ label }) => label);

  if (data.buttonsIconsMode) {
    labeledButtons = labeledButtons.map((label) => {
      const [emoji] = regexps.regexps.emojiRegExp.exec(label);

      return emoji || label;
    });
  }

  const keyboard = [
    ..._.chunk(labeledButtons, data.buttonsAmount),
  ];

  return keyboard;
};

module.exports = getEncyclopediaKeyboard;
