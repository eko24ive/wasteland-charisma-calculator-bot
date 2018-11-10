const {
  PLACES: {
    ENGINEER,
    WORKBENCH,
  },
} = require('./../places.js');

const {
  RESOURCES: {
    MATERIALS,
    EPHEDRINE,
  },
  getResource,
} = require('./resources.js');

const meds = [
  {
    icon: '💧',
    title: 'Чистая вода',
    price: [getResource(MATERIALS, 30)],
    effect: '❤️',
    characteristic: 3,
    place: WORKBENCH,
  },
  {
    icon: '💊',
    title: 'Speed-ы',
    price: [getResource(MATERIALS, 30), getResource(EPHEDRINE, 1)],
    effect: '🔋',
    characteristic: 5,
    place: WORKBENCH,
    comment: 'временный эффект',
  },
  {
    icon: '💉',
    title: 'Стимулятор',
    price: [getResource(MATERIALS, 80)],
    effect: '❤️',
    characteristic: 30,
    place: WORKBENCH,
  },
  {
    icon: '💉',
    title: '++ Суперстим',
    price: [getResource(MATERIALS, '\*'), getResource(EPHEDRINE, 1)],
    effect: '❤️',
    characteristic: 'полное здоровье + 20%',
    place: WORKBENCH,
    comment: '\* 📦Материалы считаются по формуле = \`Ваше ❤️Здоровье * 7.2\`',
  },
  {
    icon: '💌',
    title: 'Медпак',
    price: [getResource(MATERIALS, 630), getResource(EPHEDRINE, 1)],
    effect: '❤️',
    characteristic: 60,
    place: ENGINEER,
    comment: 'Можно носить только 1 шт\n'
        + 'При наличии *👝 Сумки под медпаки* можно носить 3 шт',
  },
  {
    icon: '💉',
    title: 'Мед-Х детский',
    price: [getResource(MATERIALS, 410)],
    effect: '❤️',
    characteristic: 30,
    place: ENGINEER,
    comment: 'Можно носить по 2 шт',
  },
  {
    icon: '❣️',
    title: 'Баффаут',
    price: [getResource(MATERIALS, 280)],
    effect: '❤️',
    characteristic: 17,
    place: ENGINEER,
    comment: 'Можно носить по 2 шт',
  },
];

module.exports = meds;
