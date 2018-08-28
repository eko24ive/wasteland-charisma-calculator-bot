const buttons = require('../ui/buttons');

module.exports = (keyboard, buttonsSet) => {
  return keyboard([
    [buttons.cancelAction.label],
    ...buttonsSet
  ], {
    resize: false
  });
}