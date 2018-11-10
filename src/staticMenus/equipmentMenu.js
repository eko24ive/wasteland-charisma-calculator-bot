const {
//  getArmorsByPlace,
//  getHelmetsByPlace,
//  getMedsByPlace,
//  getWeaponsByPlace,
//  getWeaponInventionsByPlace,
//  getArmorInventionsByPlace,
  getWeapons,
  getArmors,
  getHelmets,
} = require('./items/itemsFunctions.js');

//  const {
//    merchant,
//    engineer,
//    workbench,
//    core,
//    basement,
//    madman,
//  } = require('./places.js');

//  const uniqueAccessoriesText = require('./items/accessories.js');

const equipmentText = `
Привет
`;

const weaponText = `
${getWeapons}
`;

const armorText = `
${getArmors}
`;

const helmetText = `
${getHelmets}
`;

const firstAidText = `
Я аптечка
`;

const inventionsText = `
Я улучшения
`;

const inventionsWeapon = `
Оружия
`;

const inventionsArmor = `
Брони
`;

const equipmentMenu = {
  config: {
    parseMode: 'markdown',
  },
  name: 'equipment',
  title: 'Экипировка',
  text: equipmentText,
  content: [{
    name: 'weapon',
    title: 'Оружие',
    text: weaponText,
    content: [{
      title: 'Назад',
      name: 'equipment',
    }],
  }, {
    name: 'armor',
    title: 'Броня',
    text: armorText,
    content: [{
      title: 'Назад',
      name: 'equipment',
    }],
  }, {
    name: 'helmet',
    title: 'Шлемы',
    text: helmetText,
    content: [{
      title: 'Назад',
      name: 'equipment',
    }],
  }, {
    name: 'firstAid',
    title: 'Аптечка',
    text: firstAidText,
    content: [{
      title: 'Назад',
      name: 'equipment',
    }],
  }, {
    name: 'inventions',
    title: '🔆Изобретения',
    text: inventionsText,
    content: [{
      name: 'inventions_weapon',
      title: '🔫Оружие',
      text: inventionsWeapon,
    },
    {
      name: 'inventions_armor',
      title: '🛡️Броня',
      text: inventionsArmor,
    },
    {
      title: 'Назад',
      name: 'equipment',
    }],
  }],
};

module.exports = equipmentMenu;
