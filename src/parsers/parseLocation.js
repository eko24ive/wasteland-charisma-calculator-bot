const {
  regexps,
} = require('../regexp/regexp');

const parseLocation = (location) => {
  const splitted = location.split('\n');
  let capsReceived = 0;
  let materialsReceived = [];
  let capsLost = 0;
  let materialsLost = 0;
  let healthInjuries = 0;
  let effect = 'none';
  let isRaid = false;

  const beastFaced = {
    faced: false,
    name: null,
  };

  const type = 'unknown';

  const [, distance] = regexps.campDistanceRegExp.exec(location);
  const [, , , healthCap] = regexps.healthRegExp.exec(location);

  let [, name] = regexps.locationNameRegExp.exec(location);

  if (regexps.locationRaidPostfixRegExp.test(name)) {
    name = name.replace(regexps.locationRaidPostfixRegExp);
    isRaid = true;
  }

  if (regexps.receivedCapsAndMaterialsRegExp.test(location)) {
    [, capsReceived, materialsReceived] = regexps.receivedCapsAndMaterialsRegExp.exec(location);
  }
  if (regexps.capsLostRegExp.test(location)) {
    [, capsLost] = regexps.capsLostRegExp.exec(location);
  }
  if (regexps.materialsLostRegExp.test(location)) {
    [, materialsLost] = regexps.materialsLostRegExp.exec(location);
  }
  if (regexps.injuryRegExp.test(location)) {
    [, healthInjuries] = regexps.injuryRegExp.exec(location);
  }
  if (regexps.beastFacedRegExp.test(location)) {
    const [, beastName] = regexps.beastFacedRegExp.exec(location);
    let beastType;

    if (regexps.darkZone.test(location)) {
      beastType = 'DarkZone';
    } else {
      beastType = 'Regular';
    }

    beastFaced.faced = true;
    beastFaced.name = beastName;
    beastFaced.type = beastType;
  }

  const receivedItems = splitted.map((row) => {
    if (regexps.receivedItemRegExp.test(row)) {
      const [, item] = regexps.receivedItemRegExp.exec(row);

      return item;
    }

    return false;
  }).filter(item => item !== false);

  const receivedBonusItems = splitted.map((row) => {
    if (regexps.receivedBonusItemRegExp.test(row)) {
      const [, item] = regexps.receivedBonusItemRegExp.exec(row);

      return item;
    }

    return false;
  }).filter(item => item !== false);

  const locationData = {
    name,
    isRaid,
    distance: Number(distance),
    type,
    capsReceived: Number(capsReceived),
    materialsReceived: Number(materialsReceived),
    capsLost: Number(capsLost),
    materialsLost: Number(materialsLost),
    healthInjuries: Number(healthInjuries),
    receivedItems,
    receivedBonusItems,
    beastFaced,
    healthCap: Number(healthCap),
  };

  if (locationData.capsReceived > 0 || locationData.materialsReceived > 0) {
    effect = 'good';
  } else if ((locationData.capsLost > 0 && locationData.materialsLost > 0) || locationData.healthInjuries) {
    effect = 'bad';
  }

  return {
    ...locationData,
    effect,
  };
};

module.exports = parseLocation;
