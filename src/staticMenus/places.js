const MERCHANT = 'MERCHANT';
const WORKBENCH = 'WORKBENCH';
const ENGINEER = 'ENGINEER';
const CORE = 'CORE';
const BASEMENT = 'BASEMENT';
const MADMAN = 'MADMAN';
const MINE = 'MINE';
const OPEN_SHELTER = 'OPEN_SHELTER';
const HIGH_HROTGAR = 'HIGH_HROTGAR';
const MOLTEN_CORE = 'MOLTEN_CORE';
const HEXAGON = 'HEXAGON';
const SIENCE_LAB = 'SIENCE_LAB';
const WASTELAND = 'WASTELAND';
const PVPARENA = 'PVPARENA';

// const placesStrings = [MERCHANT, WORKBENCH, ENGINEER, CORE, BASEMENT, MADMAN, MINE, OPEN_SHELTER,
//   HIGH_HROTGAR, MOLTEN_CORE, HEXAGON, SIENCE_LAB, WASTELAND, PVPARENA];

const places = {
  MERCHANT: {
    name: 'merchant',
    title: 'Торгаш',
    icon: '🏚',
  },
  WORKBENCH: {
    name: 'workbench',
    title: 'Верстак',
    icon: '🛠',
  },
  ENGINEER: {
    name: 'engineer',
    title: 'Инженер',
    icon: '👓',
  },
  CORE: {
    name: 'core',
    title: 'Ядро',
    icon: '🕎',
  },
  BASEMENT: {
    name: 'basement',
    title: 'Уютный подвальчик',
    icon: '🚪',
  },
  MADMAN: {
    name: 'madman',
    title: 'Безумный старик',
  },
  MINE: {
    name: 'mine',
    title: 'Старая шахта',
  },
  OPEN_SHELTER: {
    name: 'openShelter',
    title: 'Открытое убежище',
    icon: '⚙️',
  },
  HIGH_HROTGAR: {
    name: 'highHrotgar',
    title: 'Высокий Хротгар',
    icon: '🌁',
  },
  MOLTEN_CORE: {
    name: 'moltenCore',
    title: 'Огненные Недра',
    icon: '🔥',
  },
  HEXAGON: {
    name: 'hexagon',
    title: 'Руины Гексагона',
    icon: '🛑',
  },
  SIENCE_LAB: {
    name: 'siencelab',
    title: 'Научная лаборатория',
    icon: '🔬',
  },
  WASTELAND: {
    name: 'wasteland',
    title: 'Пустошь',
    icon: '👣',
  },
  PVPARENA: {
    name: 'pvpArena',
    title: 'Купол Грома',
    icon: '⚡️',
  },
};

const showPlace = (getPlace) => {
  const place = places[getPlace];
  return `${place.icon}${place.title}`;
};

module.exports = {
  showPlace,
  PLACES: {
    MERCHANT,
    WORKBENCH,
    ENGINEER,
    CORE,
    BASEMENT,
    MADMAN,
    MINE,
    OPEN_SHELTER,
    HIGH_HROTGAR,
    MOLTEN_CORE,
    HEXAGON,
    SIENCE_LAB,
    WASTELAND,
    PVPARENA,
  },
};
