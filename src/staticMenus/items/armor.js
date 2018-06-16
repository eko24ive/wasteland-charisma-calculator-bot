const {
    merchant,
    engineer,
    workbench
} = require('./../places.js');

const armorsComment = '🛡Защита: +';
const armors = [
    {
        icon: false,
        title: "Плотная куртка",
        price: { caps: 30, },
        characteristic: 1,
        place: merchant,
    },
    {
        icon: false,
        title: "Комбинезон убежища",
        price: { caps: 30, },
        characteristic: 3,
        place: merchant,
    },
    {
        icon: false,
        title: "Кожанный нагрудник",
        price: { caps: 30, },
        characteristic: 6,
        place: merchant,
    },
    {
        icon: false,
        title: "Мото-защита",
        price: { caps: 30, },
        characteristic: 9,
        place: merchant,
    },
    {
        icon: false,
        title: "Легкий кевлар",
        price: { caps: 30, },
        characteristic: 10,
        place: merchant,
    },
    {
        icon: false,
        title: "Крепкий кевлар",
        price: { caps: 30, },
        characteristic: 10,
        place: merchant,
    },
    {
        icon: false,
        title: "Броня братства",
        price: { caps: 30, },
        characteristic: 15,
        place: merchant,
    },
    {
        icon: false,
        title: "Боевая броня",
        price: { caps: 680, },
        characteristic: 25,
        place: merchant,
    },
    {
        icon: false,
        title: "Броня Когтей",
        price: { caps: 1580, },
        characteristic: 32,
        place: merchant,
    },
    {
        icon: "👕",
        title: "Портупея",
        price: { materials: 390, },
        characteristic: 3,
        place: workbench,
    },
    {
        icon: "👕",
        title: "Кожаный жилет",
        price: { materials: 890, },
        characteristic: 6,
        place: workbench,
    },
    {
        icon: "👕",
        title: "Титановые щитки",
        price: { materials: 5200, },
        characteristic: 16,
        place: workbench,
    },
    {
        icon: "⚙️",
        title: "Силовая броня",
        price: {
            materials: 12990,
            generators: 5,
        },
        characteristic: 25,
        place: workbench,
    },
    {
        icon: "⚙️",
        title: "Силовая броня🎖",
        price: {
            materials: 22990,
            generators: 15,
        },
        characteristic: 35,
        place: workbench,
    },
    {
        icon: "⚙️",
        title: "Силовая броня🎖🎖",
        price: {
            materials: 35990,
            generators: 35,
        },
        characteristic: 45,
        place: workbench,
    },
    {
        icon: "⚙️",
        title: "Броня 'Тесла'",
        price: {
            materials: 40990,
            generators: 40,
            microchip: 10,
        },
        characteristic: 55,
        place: workbench,
    },
    {
        icon: "⚙️",
        title: "Броня 'Геенна'",
        price: {
            materials: 52990,
            generators: 80,
            microchip: 21,
        },
        characteristic: 66,
        place: workbench,
    },
    {
        icon: "🦇",
        title: "Бэткостюм",
        price: {
            materials: 72900,
            generators: 120,
            microchip: 54,
            iridium: 25,
        },
        characteristic: 76,
        place: engineer,
    },
    {
        icon: "⚛️",
        title: "Нановолокно",
        price: {
            materials: 98000,
            generators: 150,
            microchip: 85,
            iridium: 46,
        },
        characteristic: 89,
        place: engineer,
    },
    {
        icon: "🛠",
        title: "Мультизащита",
        price: {
            materials: 141900,
            generators: 190,
            microchip: 125,
            iridium: 69,
        },
        characteristic: 127,
        place: engineer,
    },
    {
        icon: "⚡️",
        title: "Тесла-мех",
        price: {
            materials: 179990,
            generators: 210,
            microchip: 145,
            iridium: 116,
        },
        characteristic: 161,
        place: engineer,
    }
];

module.exports = {
    armors,
    armorsComment
};