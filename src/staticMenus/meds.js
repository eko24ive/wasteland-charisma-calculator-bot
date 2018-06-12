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
    }
];

module.exports = meds;