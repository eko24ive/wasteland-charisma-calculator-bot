const {
    engineer,
    workbench
} = require('./../places.js');

const meds = [
    {
        icon: '💧',
        title: "Чистая вода",
        price: { materials: 30, },
        effect: '❤️',
        characteristic: 3,
        place: workbench,
    },
    {
        icon: '💊',
        title: "Speed-ы",
        price: { 
            materials: 200,
            ephedrine: 1,
         },
        effect: '🔋',
        characteristic: 5,
        place: workbench,
        comment: 'временный эффект',
    },
    {
        icon: '💉',
        title: "Стимулятор",
        price: { 
            materials: 80,
         },
        effect: '❤️',
        characteristic: 30,
        place: workbench,
    },
    {
        icon: '💉',
        title: "++ Суперстим",
        price: { 
            materials: '*',
            ephedrine: 1,
         },
        effect: '❤️',
        characteristic: 'полное здоровье + 20%',
        place: workbench,
        comment: '* 📦Материалы считаются по формуле = \`Ваше ❤️Здоровье * 7.2\`',
    },
    {
        icon: '💌',
        title: "Медпак",
        price: { 
            materials: 630,
            ephedrine: 1,
         },
        effect: '❤️',
        characteristic: 60,
        place: engineer,
        comment: 'Можно носить только 1 шт\n' +
        'При наличии *👝 Сумки под медпаки* можно носить 3 шт',
    },
    {
        icon: '💉',
        title: "Мед-Х детский",
        price: { 
            materials: 410,
         },
        effect: '❤️',
        characteristic: 30,
        place: engineer,
        comment: 'Можно носить по 2 шт',
    },
    {
        icon: '❣️',
        title: "Баффаут",
        price: { 
            materials: 280,
         },
        effect: '❤️',
        characteristic: 17,
        place: engineer,
        comment: 'Можно носить по 2 шт',
    }
];

module.exports = meds;