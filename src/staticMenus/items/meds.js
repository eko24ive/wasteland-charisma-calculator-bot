const {
  engineer,
  workbench,
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
    place: workbench,
  },
  {
    icon: '💊',
    title: 'Speed-ы',
    price: [getResource(MATERIALS, 30), getResource(EPHEDRINE, 1)],
    effect: '🔋',
    characteristic: 5,
    place: workbench,
    comment: 'временный эффект',
  },
  {
    icon: '💉',
    title: 'Стимулятор',
    price: [getResource(MATERIALS, 80)],
    effect: '❤️',
    characteristic: 30,
    place: workbench,
  },
  {
    icon: '💉',
    title: '++ Суперстим',
    price: [getResource(MATERIALS, '\*'), getResource(EPHEDRINE, 1)],
    effect: '❤️',
    characteristic: 'полное здоровье + 20%',
    place: workbench,
    comment: '\* 📦Материалы считаются по формуле = \`Ваше ❤️Здоровье * 7.2\`',
  },
  {
    icon: '💌',
    title: 'Медпак',
    price: [getResource(MATERIALS, 630), getResource(EPHEDRINE, 1)],
    effect: '❤️',
    characteristic: 60,
    place: engineer,
    comment: 'Можно носить только 1 шт\n'
        + 'При наличии *👝 Сумки под медпаки* можно носить 3 шт',
  },
  {
    icon: '💉',
    title: 'Мед-Х детский',
    price: [getResource(MATERIALS, 410)],
    effect: '❤️',
    characteristic: 30,
    place: engineer,
    comment: 'Можно носить по 2 шт',
  },
  {
    icon: '❣️',
    title: 'Баффаут',
    price: [getResource(MATERIALS, 280)],
    effect: '❤️',
    characteristic: 17,
    place: engineer,
    comment: 'Можно носить по 2 шт',
  },
];

module.exports = meds;
