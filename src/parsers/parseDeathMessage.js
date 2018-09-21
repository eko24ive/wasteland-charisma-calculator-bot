const {
  regexps,
} = require('../regexp/regexp');

const parseDeathMessage = (deathMessage) => {
  const [, capsLost, materialsLost] = regexps.deathMessageRecourcesLostRexExp.exec(deathMessage);

  return {
    capsLost,
    materialsLost,
  };
};

module.exports = parseDeathMessage;
