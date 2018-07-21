const {
    merchant,
    engineer,
    workbench,
    core,
    basement
} = require('./../places.js');

const weaponsComment = '💪 Урон: +';
const inventionWeaponIcon = '⚔️';
const weapons = [
    {
        icon: false,
        title: "Бейсбольная бита",
        price: { caps: 30, },
        characteristic: 1,
        place: merchant
    },
    {
        icon: false,
        title: "Ржавый нож",
        price: { caps: 30, },
        characteristic: 3,
        place: merchant
    },
    {
        icon: false,
        title: "Разводной ключ",
        price: { caps: 30, },
        characteristic: 5,
        place: merchant
    },
    {
        icon: false,
        title: "Топор",
        price: { caps: 30, },
        characteristic: 7,
        place: merchant
    },
    {
        icon: false,
        title: "Кинжал",
        price: { caps: 30, },
        characteristic: 9,
        place: merchant
    },
    {
        icon: false,
        title: "Мачете",
        price: { caps: 30, },
        characteristic: 11,
        place: merchant
    },
    {
        icon: false,
        title: "Хлыст",
        price: { caps: 30, },
        characteristic: 13,
        place: merchant
    },
    {
        icon: false,
        title: "Стальная бита",
        price: { caps: 30, },
        characteristic: 16,
        place: merchant
    },
    {
        icon: "⚡",
        title: "Прочная бита",
        price: { materials: 200, },
        characteristic: 2,
        place: workbench
    },
    {
        icon: "⚡",
        title: "Копье",
        price: { materials: 600, },
        characteristic: 4,
        place: workbench
    },
    {
        icon: "⚡",
        title: "Кистень",
        price: { materials: 1300, },
        characteristic: 6,
        place: workbench
    },
    {
        icon: "⚡",
        title: "Электромеч",
        price: { materials: 3900, },
        characteristic: 9,
        place: workbench
    },
    {
        icon: "⚡",
        title: "Электромеч",
        price: { 'Провода': 7, },
        characteristic: 15,
        rarity: first
    },
    {
        icon: "⚡",
        title: "Электромеч",
        price: { 'Провода': 17, },
        characteristic: 21,
        rarity: second
    },
    {
        icon: "💥",
        title: "Лазерный тесак",
        price: {
            materials: 5600,
            quartz: 4,
        },
        characteristic: 12,
        place: workbench
    },
    {
        icon: "💥",
        title: "Лазерный тесак",
        price: {
            'Минизаряд': 7,
            'Провода': 5,
        },
        characteristic: 20,
        rarity: first
    },
    {
        icon: "💥",
        title: "Лазерный тесак",
        price: {
            'Минизаряд': 17,
            'Провода': 15,
        },
        characteristic: 28,
        rarity: second
    },
    {
        icon: "💥",
        title: "BFGzzv-4000",
        price: {
            materials: 12000,
            quartz: 30,
        },
        characteristic: 20,
        place: workbench
    },
    {
        icon: "💥",
        title: "BFGzzv-4000",
        price: {
            'Транзистор': 5,
            'Изолента': 6,
        },
        characteristic: 29,
        rarity: first
    },
    {
        icon: "🔗",
        title: "Силовой кастет",
        price: {
            materials: 14000,
            quartz: 20,
            generators: 5,
        },
        characteristic: 25,
        place: workbench
    },
    {
        icon: "🔗",
        title: "Силовой кастет",
        price: {
            'Минизаряд': 4,
            'Изолента': 6,
            'Топаз': 5,
        },
        characteristic: 25,
        rarity: first
    },
    {
        icon: "🔗",
        title: "Силовой кастет",
        price: {
            'Минизаряд': 14,
            'Изолента': 16,
            'Топаз': 15,
        },
        characteristic: 32,
        rarity: second
    },
    {
        icon: "💥",
        title: "Колыбель Пустоши",
        price: {
            materials: 19990,
            quartz: 35,
            generators: 5,
        },
        characteristic: 29,
        place: workbench
    },
    {
        icon: "💥",
        title: "Колыбель Пустоши",
        price: {
            'Транзистор': 9,
            'Что-то чугунное': 10,
        },
        characteristic: 29,
        rarity: first
    },
    {
        icon: "💥",
        title: "Tyrant-PDR",
        price: {
            materials: 29990,
            quartz: 60,
            generators: 25,
        },
        characteristic: 38,
        place: workbench

    },
    {
        icon: "💥",
        title: "Tyrant-PDR",
        price: {
            'Вольфрам': 9,
            'Тряпка': 12,
        },
        characteristic: 46,
        rarity: first
    },
    {
        icon: "💥",
        title: "Tyrant-PDR",
        price: {
            'Вольфрам': 19,
            'Тряпка': 22,
        },
        characteristic: 51,
        rarity: second
    },
    {
        icon: "☄️",
        title: "Огнемёд",
        price: {
            materials: 45900,
            quartz: 90,
            generators: 75,
            microchip: 5,
        },
        characteristic: 49,
        place: workbench
    },
    {
        icon: "☄️",
        title: "Огнемёд",
        price: {
            'Фольга!': 2,
            'Сердце трога': 11,
            'Потенциометр': 3,
            'Сталь': 4,
        },
        characteristic: 58,
        rarity: first
    },
    {
        icon: "☄️",
        title: "Огнемёд",
        price: {
            'Фольга!': 12,
            'Сердце трога': 21,
            'Потенциометр': 13,
            'Сталь': 14,
        },
        characteristic: 65,
        rarity: second
    },
    {
        icon: "☄️",
        title: "Больверизатор",
        price: {
            materials: 59990,
            quartz: 100,
            generators: 90,
            microchip: 45,
        },
        characteristic: 56,
        place: workbench
    },
    {
        icon: "☄️",
        title: "Больверизатор",
        price: {
            'Фольга!': 3,
            'Провода': 15,
            'Изолента': 12,
        },
        characteristic: 69,
        rarity: first
    },
    {
        icon: "☄️",
        title: "Больверизатор",
        price: {
            'Фольга!': 19,
            'Провода': 25,
            'Изолента': 28,
        },
        characteristic: 76,
        rarity: second
    },
    {
        icon: "🔮",
        title: "Энергосфера",
        price: {
            materials: 78990,
            generators: 120,
            microchip: 60,
            iridium: 20,
        },
        characteristic: 65,
        place: workbench
    },
    {
        icon: "🔮",
        title: "Энергосфера",
        price: {
            'Сердце трога': 20,
            'Детская кукла': 3,
        },
        characteristic: 78,
        rarity: first
    },
    {
        icon: "🌟",
        title: "Армагеддец",
        price: {
            materials: 129990,
            generators: 150,
            microchip: 70,
            iridium: 40,
        },
        characteristic: 79,
        place: workbench
    },
    {
        icon: "🌟",
        title: "Армагеддец",
        price: {
            'Что-то чугунное': 9,
            'Провода': 30,
            'Изолента': 25,
        },
        characteristic: 90,
        rarity: first
    },
    {
        icon: "☣️",
        title: "Потрошитель",
        price: {
            materials: 158990,
            generators: 220,
            microchip: 99,
            iridium: 88,
        },
        characteristic: 92,
        place: engineer
    },
    {
        icon: "☣️",
        title: "Потрошитель",
        price: {
            'Минизаряд': 11,
            'Потенциометр': 14,
            'Сталь': 5,
        },
        characteristic: 122,
        rarity: first
    },
    {
        icon: "☣️",
        title: "Потрошитель",
        price: {
            'Минизаряд': 23,
            'Потенциометр': 24,
            'Сталь': 15,
        },
        characteristic: 141,
        rarity: second
    },
    {
        icon: "☣️",
        title: "Жиробас",
        price: {
            materials: 191000,
            generators: 250,
            microchip: 135,
            iridium: 112,
        },
        characteristic: 125,
        place: engineer
    },
    {
        icon: "☣️",
        title: "Жиробас",
        price: {
            'Минизаряд': 10,
            'Плазма': 8,
            'Изолента': 4,
        },
        characteristic: 155,
        rarity: first
    },
    {
        icon: "☣️",
        title: "Жиробас",
        price: {
            'Минизаряд': 23,
            'Плазма': 21,
            'Изолента': 24,
        },
        characteristic: 163,
        rarity: first
    },
    {
        icon: "🌟",
        title: "Гравипушка",
        price: {
            materials: 241900,
            generators: 310,
            microchip: 185,
            iridium: 145,
        },
        characteristic: 159,
        place: engineer
    },
    {
        icon: "🌟",
        title: "Гравипушка",
        price: {
            'Фольга!': 2,
            'Сердце трога': 11,
            'Потенциометр': 6,
            'Сталь': 7,
        },
        characteristic: 189,
        rarity: first
    },
    {
        icon: "🌟",
        title: "Гравипушка",
        price: {
            'Фольга!': 12,
            'Сердце трога': 21,
            'Потенциометр': 26,
            'Сталь': 17,
        },
        characteristic: 194,
        rarity: second
    },
    {
        icon: "💿",
        title: "DVD-VCH",
        price: {
            materials: 269000,
            generators: 330,
            microchip: 200,
            iridium: 180,
        },
        characteristic: 187,
        place: engineer
    },
    {
        icon: "💿",
        title: "DVD-VCH",
        price: { 'Тряпка': 30, },
        characteristic: 207,
        rarity: first
    },
    {
        icon: "💿",
        title: "DVD-VCH",
        price: { 'Тряпка': 50, },
        characteristic: false,
        rarity: second
    },
    {
        icon: "♻️",
        title: "Рандомган",
        price: {
            materials: 281300,
            generators: 350,
            microchip: 223,
            iridium: 197,
        },
        characteristic: 206,
        place: engineer
    },
    {
        icon: "♻️",
        title: "Рандомган",
        price: {
            'Фольга!': 3,
            'Вольфрам': 13,
            'Изолента': 12,
            'Провода': 15,
        },
        characteristic: 231,
        rarity: first
    },
    {
        icon: "♻️",
        title: "Рандомган",
        price: {
            'Фольга!': 13,
            'Вольфрам': 19,
            'Изолента': 32,
            'Провода': 25,
        },
        characteristic: 242,
        rarity: second
    },
    {
        icon: "🐱",
        title: "Ракетенок☄",
        price: {
            materials: 349900,
            generators: 410,
            microchip: 299,
            iridium: 250,
        },
        characteristic: 266,
        place: engineer
    },
    {
        icon: "🐱",
        title: "Ракетенок☄",
        price: {
            'Фольга!': 12,
            'Плазма': 14,
            'Сердце трога': 21,
            'Потенциометр': 21,
            'Сталь': 24,
        },
        characteristic: 284,
        rarity: first
    },
    {
        icon: "🐱",
        title: "Ракетенок☄",
        price: {
            'Фольга!': 32,
            'Плазма': 44,
            'Сердце трога': 31,
            'Потенциометр': 31,
            'Сталь': 44,
        },
        characteristic: 298,
        rarity: second
    },
    {
        icon: "✳️",
        title: "Протонный топор",
        price: {
            materials: 359900,
            quartz: 2990,
            microchip: 289,
            iridium: 250,
        },
        characteristic: 278,
        place: core
    },
    {
        icon: "❇️",
        title: "Плазмакастер",
        price: {
            materials: 379900,
            generators: 410,
            microchip: 359,
            iridium: 265,
        },
        characteristic: 291,
        place: core
    },
    {
        icon: "❇️",
        title: "Плазмакастер",
        price: {
            'Фольга!': 23,
            'Изолента': 22,
            'Провода': 25,
        },
        characteristic: 314,
        rarity: first
    },
    {
        icon: "❇️",
        title: "Плазмакастер",
        price: {
            'Фольга!': 43,
            'Изолента': 49,
            'Провода': 55,
        },
        characteristic: 329,
        rarity: second
    },
    {
        icon: "💣",
        title: "Судный день",
        price: {
            materials: 325900,
            generators: 680,
            microchip: 399,
            iridium: 280,
        },
        characteristic: 305,
        place: core
    },
    {
        icon: "✝️",
        title: "Святое пламя",
        price: {
            materials: 385900,
            generators: 720,
            microchip: 419,
            iridium: 300,
        },
        characteristic: 318,
        place: core
    },
    {
        icon: "💥",
        title: "Маленький друг",
        price: {
            materials: 399400,
            generators: 750,
            microchip: 435,
            iridium: 329,
        },
        characteristic: 325,
        place: core
    },
    {
        icon: "🧠",
        title: "Брейналайзер",
        price: {
            materials: 656900,
            cubonite: 38990,
        },
        characteristic: 344,
        place: basement
    },
    {
        icon: "🌡",
        title: "Плюмбус",
        price: {
            materials: 957900,
            cubonite: 54990,
            osmium: 30290,
        },
        characteristic: 416,
        place: basement
    },
    {
        icon: "💢",
        title: "Плазмолив",
        price: {
            materials: 1135900,
            cubonite: 68490,
            osmium: 45590,
            titanium: 43930,
        },
        characteristic: false,
        place: basement
    },
    {
        icon: "❇️",
        title: "γ-Дезинтегратор",
        price: {
            materials: 1426900,
            cubonite: 99990,
            osmium: 79560,
            titanium: 66980,
        },
        characteristic: 507,
        place: basement
    }
];

module.exports = {
    weapons,
    weaponsComment,
    inventionWeaponIcon
};
