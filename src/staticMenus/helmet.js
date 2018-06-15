const {
  merchant,
  engineer
} = require('./places.js');

const helmetsComment = '🛡Защита: +';
const helmets = [
  {
      icon: false,
      title: "Вязаная шапка",
      price: { caps: 30, },
      amount: 1,
      place: merchant,
  },
  {
      icon: false,
      title: "Ушанка",
      price: { caps: 30, },
      amount: 1,
      place: merchant,
  },
  {
      icon: false,
      title: "Боевой шлем",
      price: { caps: 30, },
      amount: 5,
      place: merchant,
  },
  {
      icon: false,
      title: "Деловая шляпа",
      price: { caps: 480, },
      amount: 1,
      place: merchant,
  },
  {
      icon: false,
      title: "Берет",
      price: { caps: 40, },
      amount: 1,
      place: merchant,
  },
  {
      icon: false,
      title: "Колпак повара",
      price: { caps: 880, },
      amount: 1,
      place: merchant,
  },
  {
      icon: false,
      title: "Шляпа минитмена",
      price: { caps: 980, },
      amount: 15,
      place: merchant,
  },
  {
      icon: false,
      title: "Противогаз",
      price: { caps: 1620, },
      amount: 15,
      place: merchant,
  },
  {
      icon: false,
      title: "Плотный капюшон",
      price: { caps: 1510, },
      amount: 9,
      place: merchant,
  },
  {
      icon: "⚙️",
      title: "Шлем синта",
      price: {
          materials: 21990,
          quartz: 250,
          generators: 90,
          microchip: 20,
      },
      amount: 25,
      place: engineer,
  },
  {
      icon: "⚙️",
      title: "Шлем Рейдер-пес",
      price: {
          materials: 45990,
          quartz: 330,
          generators: 140,
          microchip: 60,
      },
      amount: 40,
      place: engineer,
  },
  {
      icon: "⚙️",
      title: "Шлем Тесла",
      price: {
          materials: 87990,
          generators: 450,
          microchip: 210,
          iridium: 130,
      },
      amount: 68,
      place: engineer,
  },
  {
      icon: "🛠",
      title: "Костяной шлем",
      price: {
          materials: 157990,
          generators: 590,
          microchip: 345,
          iridium: 320,
      },
      amount: 92,
      place: engineer,
  }
];

module.exports = {
  helmets,
  helmetsComment
};