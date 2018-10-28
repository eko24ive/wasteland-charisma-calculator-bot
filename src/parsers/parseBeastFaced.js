const {
  regexps,
} = require('../regexp/regexp');

const parseRegularBeastFaced = (data) => {
  let type;

  const [, distance] = regexps.campDistanceRegExp.exec(data);
  const [, name] = regexps.beastFacedRegExp.exec(data);

  if (regexps.darkZone.test(data)) {
    type = 'DarkZone';
  } else {
    type = 'Regular';
  }

  return {
    distance: Number(distance),
    name,
    type,
  };
};

const parseDungeonBeastFaced = (data) => {
  const [, name] = regexps.dungeonBeastFacedRegExp.exec(data);

  return {
    name,
  };
};

const parseWalkingBeastFaced = (data) => {
  const [, name] = regexps.walkingBeastFacedRegExp.exec(data);

  return {
    name,
  };
};

const parseHaloDungeonBeastFaced = (data) => {
  const [, name] = regexps.haloDungeonBeastFacedRegExp.exec(data);

  return {
    name,
  };
};

module.exports = {
  parseRegularBeastFaced,
  parseDungeonBeastFaced,
  parseWalkingBeastFaced,
  parseHaloDungeonBeastFaced,
};
