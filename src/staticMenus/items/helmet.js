const {
  PLACES: {
    MERCHANT,
    ENGINEER,
    WASTELAND,
    PVPARENA,
    HIGHHROTGAR,
  },
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

const helmetsDescription = '🛡 Защита: +';

const helmets = [
  {
    icon: false,
    title: 'Вязаная шапка',
    price: [getResource(CAPS, 30)],
    characteristic: 1,
    place: MERCHANT,
  },
  {
    icon: false,
    title: 'Ушанка',
    price: false,
    characteristic: 1,
    place: WASTELAND,
  },
  {
    icon: false,
    title: 'Боевой шлем',
    price: [getResource(CAPS, 437)],
    characteristic: 5,
    place: MERCHANT,
  },
  {
    icon: false,
    title: 'Деловая шляпа',
    price: [getResource(CAPS, 1287)],
    characteristic: 1,
    place: MERCHANT,
  },
  {
    icon: false,
    title: 'Берет',
    price: [getResource(CAPS, 847)],
    characteristic: 1,
    place: MERCHANT,
  },
  {
    icon: false,
    title: 'Колпак повара',
    price: [getResource(CAPS, 1687)],
    characteristic: 1,
    place: MERCHANT,
  },
  {
    icon: false,
    title: 'Шляпа минитмена',
    price: [getResource(CAPS, 1787)],
    characteristic: 15,
    place: MERCHANT,
  },
  {
    icon: false,
    title: 'Противогаз',
    price: [getResource(CAPS, 2427)],
    characteristic: 15,
    place: MERCHANT,
  },
  {
    icon: false,
    title: 'Плотный капюшон',
    price: [getResource(CAPS, 2317)],
    characteristic: 9,
    place: MERCHANT,
  },
  {
    icon: '⚙️',
    title: 'Шлем синта',
    price: [getResource(MATERIALS, 21990), getResource(QUARZ, 150),
      getResource(GENERATORS, 90), getResource(MICROCHIPS, 20)],
    characteristic: 25,
    place: ENGINEER,
  },
  {
    icon: '⚙️',
    title: 'Шлем Рейдер-пес',
    price: [getResource(MATERIALS, 45990), getResource(QUARZ, 330),
      getResource(GENERATORS, 140), getResource(MICROCHIPS, 60)],
    characteristic: 40,
    place: ENGINEER,
    requirements: getCharacteristic(AGILITY, 21),
  },
  {
    icon: '⚙️',
    title: 'Шлем Тесла',
    price: [getResource(MATERIALS, 87990), getResource(GENERATORS, 450),
      getResource(MICROCHIPS, 210), getResource(IRIDIUM, 130)],
    characteristic: 68,
    place: ENGINEER,
    requirements: getCharacteristic(AGILITY, 35),
  },
  {
    icon: '🛠',
    title: 'Костяной шлем',
    price: [getResource(MATERIALS, 157990), getResource(GENERATORS, 590),
      getResource(MICROCHIPS, 345), getResource(IRIDIUM, 320)],
    characteristic: 92,
    place: ENGINEER,
    requirements: getCharacteristic(AGILITY, 35),
  },
  {
    icon: false,
    title: 'Рогатый шлем',
    price: false,
    characteristic: 115,
    place: HIGHHROTGAR,
  },
  {
    icon: false,
    title: 'Шлем мастера',
    price: false,
    characteristic: 195,
    place: PVPARENA,
    comment: 'Этот переходящий трофей можно получить на время, став победилем сезона в Куполе. Сезон закрывается каждую неделю.',
  },
];

module.exports = {
  helmets,
  helmetsDescription,
};
