const {
    merchant,
    engineer,
    workbench,
    madman,
    hexagon,
    siencelab
} = require('./../places.js');

const armorsComment = '🛡 Защита: +';
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
        icon: "⚙️",
        title: "Броня 'Геенна'",
        price: {
            'Вольфрам': 9,
            'Тряпка': 12,
        },
        characteristic: 87,
        place: workbench,
        rarity: 'first'
    },
    {
        icon: "⚙️",
        title: "Броня 'Геенна'",
        price: {
            'Вольфрам': 19,
            'Тряпка': 22,
        },
        characteristic: 96,
        place: workbench,
        rarity: 'second'
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
        icon: "🦇",
        title: "Бэткостюм",
        price: {
            'Фольга!': 3,
            'Изолента': 12,
            'Провода': 15,
        },
        characteristic: 95,
        place: engineer,
        rarity: 'first'
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
        icon: "⚛️",
        title: "Нановолокно",
        price: {
            'Фольга!': 3,
            'Вольфрам': 13,
            'Изолента': 12,
            'Провода': 16,
        },
        characteristic: 113,
        place: engineer,
        rarity: 'first'
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
        icon: "🛠",
        title: "Мультизащита",
        price: {
            'Фольга!': 12,
            'Плазма': 14,
            'Сердце трога': 11,
            'Потенциометр': 23,
            'Сталь': 24,
        },
        characteristic: 157,
        place: engineer,
        rarity: 'first'
    },
    {
        icon: "🛠",
        title: "Мультизащита",
        price: {
            'Фольга!': 32,
            'Плазма': 29,
            'Сердце трога': 21,
            'Потенциометр': 33,
            'Сталь': 39,
        },
        characteristic: false,
        place: engineer,
        rarity: 'second'
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
    },
    {
        icon: "⚡️",
        title: "Тесла-мех",
        price: {
            'Минизаряд': 31,
            'Батарейка BIOS': 4,
            'Магнит': 5,
            'Подорожник': 16,
        },
        characteristic: 187,
        place: { engineer, siencelab },
        rarity: 'first'
    },
    {
        icon: "⚡️",
        title: "Тесла-мех",
        price: {
            'Минизаряд': 46,
            'Батарейка BIOS': 15,
            'Магнит': 35,
            'Подорожник': 36,
        },
        characteristic: 198,
        place: engineer,
        rarity: 'second'
    },
    {
        icon: '⚙️',
        title: 'Броня Безумца',
        price: {
            'Провода': 17,
            'Плазма': 7,
            'Изолента': 9,
        },
        characteristic: 58,
        place: madman
    },
    {
        icon: false,
        title: 'Броня Безумца',
        price: {
            'Фольга!': 2,
            'Сердце трога': 11,
            'Потенциометр': 3,
            'Сталь': 4,
        },
        characteristic: 58,
        place: madman,
        rarity: 'first'
    },
    {
        icon: false,
        title: 'Броня Безумца',
        price: {
            'Фольга!': 12,
            'Сердце трога': 21,
            'Потенциометр': 13,
            'Сталь': 14,
        },
        characteristic: false,
        place: madman,
        rarity: 'second'
    },
    {
        icon: '⚙️',
        title: 'Экзокостюм',
        price: {
            'Крахмал': 6,
            'Воздушный фильтр': 5,
            'Эфедрин': 15,
        },
        characteristic: 68,
        place: madman
    },
    {
        icon: '⚛️',
        title: 'Экзокостюм',
        price: {
            'Минизаряд': 4,
            'Изолента': 6,
            'Топаз': 5,
        },
        characteristic: 89,
        place: madman,
        rarity: 'first'
    },
    {
        icon: '⚙️',
        title: 'Экзокостюм',
        price: {
            'Минизаряд': 14,
            'Изолента': 16,
            'Топаз': 15,
        },
        characteristic: 95,
        place: madman,
        rarity: 'second'
    },
    {
        icon: '💠',
        title: 'Алмазная броня',
        price: false,
        characteristic: 149,
        place: hexagon
    },
    {
        icon: 'Ⓜ️',
        title: 'Модульная броня',
        price: false,
        characteristic: 149,
        place: hexagon
    }
];

module.exports = {
    armors,
    armorsComment
};