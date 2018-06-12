const merchant = require('./places&bills.js');
const engineer = require('./places&bills.js');
const workbench = require('./places&bills.js');

const armorsComment = '🛡Защита: +';
const armors = [
    {
        icon: false,
        title: "Плотная куртка",
        cost: { caps: 30, },
        amount: 1,
        place: merchant,
    },
    {
        icon: false,
        title: "Комбинезон убежища",
        cost: { caps: 30, },
        amount: 3,
        place: merchant,
    },
    {
        icon: false,
        title: "Кожанный нагрудник",
        cost: { caps: 30, },
        amount: 6,
        place: merchant,
    },
    {
        icon: false,
        title: "Мото-защита",
        cost: { caps: 30, },
        amount: 9,
        place: merchant,
    },
    {
        icon: false,
        title: "Легкий кевлар",
        cost: { caps: 30, },
        amount: 10,
        place: merchant,
    },
    {
        icon: false,
        title: "Крепкий кевлар",
        cost: { caps: 30, },
        amount: 10,
        place: merchant,
    },
    {
        icon: false,
        title: "Броня братства",
        cost: { caps: 30, },
        amount: 15,
        place: merchant,
    },
    {
        icon: false,
        title: "Боевая броня",
        cost: { caps: 680, },
        amount: 25,
        place: merchant,
    },
    {
        icon: false,
        title: "Броня Когтей",
        cost: { caps: 1580, },
        amount: 32,
        place: merchant,
    },
    {
        icon: "👕",
        title: "Портупея",
        cost: { materials: 390, },
        amount: 3,
        place: workbench,
    },
    {
        icon: "👕",
        title: "Кожаный жилет",
        cost: { materials: 890, },
        amount: 6,
        place: workbench,
    },
    {
        icon: "👕",
        title: "Титановые щитки",
        cost: { materials: 5200, },
        amount: 16,
        place: workbench,
    },
    {
        icon: "⚙️",
        title: "Силовая броня",
        cost: { 
            materials: 12990,
            generators: 5,
        },
        amount: 25,
        place: workbench,
    },
    {
        icon: "⚙️",
        title: "Силовая броня🎖",
        cost: {
            materials: 22990,
            generators: 15,
        },
        amount: 35,
        place: workbench,
    },
    {
        icon: "⚙️",
        title: "Силовая броня🎖🎖",
        cost: {
            materials: 35990,
            generators: 35,
        },
        amount: 45,
        place: workbench,
    },
    {
        icon: "⚙️",
        title: "Броня 'Тесла'",
        cost: {
            materials: 40990,
            generators: 40,
            microchip: 10,
        },
        amount: 55,
        place: workbench,
    },
    {
        icon: "⚙️",
        title: "Броня 'Геенна'",
        cost: {
            materials: 52990,
            generators: 80,
            microchip: 21,
        },
        amount: 66,
        place: workbench,
    },
    {
        icon: "🦇",
        title: "Бэткостюм",
        cost: {
            materials: 72900,
            generators: 120,
            microchip: 54,
            iridium: 25,
        },
        amount: 76,
        place: engineer,
    },
    {
        icon: "⚛️",
        title: "Нановолокно",
        cost: {
            materials: 98000,
            generators: 150,
            microchip: 85,
            iridium: 46,
        },
        amount: 89,
        place: engineer,
    },
    {
        icon: "🛠",
        title: "Мультизащита",
        cost: {
            materials: 141900,
            generators: 190,
            microchip: 125,
            iridium: 69,
        },
        amount: 127,
        place: engineer,
    },
    {
        icon: "⚡️",
        title: "Тесла-мех",
        cost: {
            materials: 179990,
            generators: 210,
            microchip: 145,
            iridium: 116,
        },
        amount: 161,
        place: engineer,
    }
];

module.exports = armors;
module.exports = armorsComment;