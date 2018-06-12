const {
    merchant,
    engineer,
    workbench
} = require('./places.js');

const meds = [
    {
        icon: '💧',
        title: "Чистая вода",
        cost: { materials: 30, },
        effect: '❤️',
        amount: 3,
        place: workbench,
    },
    {
        icon: '💊',
        title: "Speed-ы",
        cost: { 
            materials: 200,
            ephedrine: 1,
         },
        effect: '🔋',
        amount: 5,
        place: workbench,
        comment: 'на время',
    },
    {
        icon: '💉',
        title: "Стимулятор",
        cost: { 
            materials: 80,
         },
        effect: '❤️',
        amount: 30,
        place: workbench,
        comment: 'на время',
    },
    {
        icon: '💉',
        title: "++ Суперстим",
        cost: { 
            materials: 200,
            ephedrine: 1,
         },
        effect: 'полное здоровье + 20%',
        amount: false,
        place: workbench,
        comment: 'Необходимое колчичество 📦Материалов = \`Уровень вашего ❤️Здоровья * 7.2\`',
    },
    {
        icon: '💌',
        title: "Медпак",
        cost: { 
            materials: 630,
            ephedrine: 1,
         },
        effect: '❤️',
        amount: 60,
        place: engineer,
        comment: 'Можно носить только 1 шт\n' +
        'При наличии *👝 Сумки под медпаки* можно носить 3 шт',
    },
    {
        icon: '💉',
        title: "Мед-Х детский",
        cost: { 
            materials: 410,
         },
        effect: '❤️',
        amount: 30,
        place: engineer,
        comment: 'Можно носить по 2 шт',
    },
    {
        icon: '❣️',
        title: "Баффаут",
        cost: { 
            materials: 280,
         },
        effect: '❤️',
        amount: 17,
        place: engineer,
        comment: 'Можно носить по 2 шт',
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