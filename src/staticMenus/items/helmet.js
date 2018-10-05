const {
  merchant,
  engineer,
} = require('./../places.js');

const {
  RESOURCES: {
    CAPS,
    MATERIALS,
    QUARZ,
    GENERATORS,
    MICROCHIPS,
    IRIDIUM,
  },
  CHARACTERISTICS: {
    AGILITY,
  },
  getResource,
  getCharacteristic,
} = require('./resources.js');

const helmetsComment = '🛡 Защита: +';

const helmets = [
  {
    icon: false,
    title: 'Вязаная шапка',
    price: [getResource(CAPS, 30)],
    characteristic: 1,
    place: merchant,
  },
  {
    icon: false,
    title: 'Ушанка',
    price: [getResource(CAPS, 30)],
    characteristic: 1,
    place: merchant,
  },
  {
    icon: false,
    title: 'Боевой шлем',
    price: [getResource(CAPS, 30)],
    characteristic: 5,
    place: merchant,
  },
  {
    icon: false,
    title: 'Деловая шляпа',
    price: [getResource(CAPS, 480)],
    characteristic: 1,
    place: merchant,
  },
  {
    icon: false,
    title: 'Берет',
    price: [getResource(CAPS, 40)],
    characteristic: 1,
    place: merchant,
  },
  {
    icon: false,
    title: 'Колпак повара',
    price: [getResource(CAPS, 880)],
    characteristic: 1,
    place: merchant,
  },
  {
    icon: false,
    title: 'Шляпа минитмена',
    price: [getResource(CAPS, 980)],
    characteristic: 15,
    place: merchant,
  },
  {
    icon: false,
    title: 'Противогаз',
    price: [getResource(CAPS, 1620)],
    characteristic: 15,
    place: merchant,
  },
  {
    icon: false,
    title: 'Плотный капюшон',
    price: [getResource(CAPS, 1510)],
    characteristic: 9,
    place: merchant,
  },
  {
    icon: '⚙️',
    title: 'Шлем синта',
    price: [getResource(MATERIALS, 21990), getResource(QUARZ, 250),
      getResource(GENERATORS, 90), getResource(MICROCHIPS, 20)],
    characteristic: 25,
    place: engineer,
  },
  {
    icon: '⚙️',
    title: 'Шлем Рейдер-пес',
    price: [getResource(MATERIALS, 45990), getResource(QUARZ, 330),
      getResource(GENERATORS, 140), getResource(MICROCHIPS, 60)],
    characteristic: 40,
    place: engineer,
    demand: getCharacteristic(AGILITY, 21),
  },
  {
    icon: '⚙️',
    title: 'Шлем Тесла',
    price: [getResource(MATERIALS, 87990), getResource(GENERATORS, 450),
      getResource(MICROCHIPS, 210), getResource(IRIDIUM, 130)],
    characteristic: 68,
    place: engineer,
    demand: getCharacteristic(AGILITY, 35),
  },
  {
    icon: '🛠',
    title: 'Костяной шлем',
    price: [getResource(MATERIALS, 157990), getResource(GENERATORS, 590),
      getResource(MICROCHIPS, 345), getResource(IRIDIUM, 320)],
    characteristic: 92,
    place: engineer,
    demand: getCharacteristic(AGILITY, 35),
  },
];

module.exports = {
  helmets,
  helmetsComment,
};
