const merchant = require('./places&bills.js');
const engineer = require('./places&bills.js');
const craftingTable = require('./places&bills.js');

const meds = [
    {
        icon: '💧',
        title: "Чистая вода",
        cost: { materials: 30, },
        effect: '❤️',
        amount: 3,
        place: craftingTable,
    },
    {
        icon: false,
        title: "Ушанка",
        cost: { materials: 30, },
        amount: 1,
        place: merchant,
    },
    {
        icon: false,
        title: "Боевой шлем",
        cost: { caps: 30, },
        amount: 5,
        place: merchant,
    },
    {
        icon: false,
        title: "Деловая шляпа",
        cost: { caps: 480, },
        amount: 1,
        place: merchant,
    },
    {
        icon: false,
        title: "Берет",
        cost: { caps: 40, },
        amount: 1,
        place: merchant,
    },
    {
        icon: false,
        title: "Колпак повара",
        cost: { caps: 880, },
        amount: 1,
        place: merchant,
    },
    {
        icon: false,
        title: "Шляпа минитмена",
        cost: { caps: 980, },
        amount: 15,
        place: merchant,
    },
    {
        icon: false,
        title: "Противогаз",
        cost: { caps: 1620, },
        amount: 15,
        place: merchant,
    },
    {
        icon: false,
        title: "Плотный капюшон",
        cost: { caps: 1510, },
        amount: 9,
        place: merchant,
    },
    {
        icon: "⚙️",
        title: "Шлем синта",
        cost: {
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
        cost: {
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
        cost: {
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
        cost: {
            materials: 157990,
            generators: 590,
            microchip: 345,
            iridium: 320,
        },
        amount: 92,
        place: engineer,
    }
];

module.exports = meds;