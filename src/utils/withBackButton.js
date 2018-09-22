const buttons = require('../ui/buttons');

module.exports = (keyboard, buttonsSet, config = {
  resize: false,
  position: 'top',
}) => keyboard(config.position === 'top' ? [
  [buttons.cancelAction.label],
  ...buttonsSet,
] : [
  ...buttonsSet,
  [buttons.cancelAction.label],
], {
  resize: config.resize,
});
