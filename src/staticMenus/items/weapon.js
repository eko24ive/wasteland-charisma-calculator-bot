const {
    merchant,
    engineer,
    workbench,
    core,
    basement,
    mine,
    openShelter,
    highHrotgar,
    moltenCore
} = require('./../places.js');

const {
    CAPS,
    getResource
} = require('./resources.js');

const weaponsComment = '💪 Урон: +';
const inventionWeaponIcon = '⚔️';
const weapons = [
    {
        icon: false,
        title: "Бейсбольная бита",
        price: [getResource(CAPS, 30)],
        characteristic: 1,
        place: merchant
    },
    {
        icon: false,
        title: "Ржавый нож",
        price: [getResource(CAPS, 30)],
        characteristic: 3,
        place: merchant
    },
    {
        icon: false,
        title: "Разводной ключ",
        price: [getResource(CAPS, 30)],
        characteristic: 5,
        place: merchant
    },
    {
        icon: false,
        title: "Топор",
        price: [getResource(CAPS, 30)],
        characteristic: 7,
        place: merchant
    },
    {
        icon: false,
        title: "Кинжал",
        price: [getResource(CAPS, 30)],
        characteristic: 9,
        place: merchant
    },
    {
        icon: false,
        title: "Мачете",
        price: [getResource(CAPS, 30)],
        characteristic: 11,
        place: merchant
    },
    {
        icon: false,
        title: "Хлыст",
        price: [getResource(CAPS, 30)],
        characteristic: 13,
        place: merchant
    },
    {
        icon: false,
        title: "Стальная бита",
        price: [getResource(CAPS, 30)],
        characteristic: 16,
        place: merchant
    },
    {
        icon: "⚡",
        title: "Прочная бита",
        price: [getResource(MATERIALS, 200)],
        characteristic: 2,
        place: workbench
    },
    {
        icon: "⚡",
        title: "Копье",
        price: [getResource(MATERIALS, 600)],
        characteristic: 4,
        place: workbench
    },
    {
        icon: "⚡",
        title: "Кистень",
        price: [getResource(MATERIALS, 1300)],
        characteristic: 6,
        place: workbench
    },
    {
        icon: "⚡",
        title: "Электромеч",
        price: [getResource(MATERIALS, 3900)],
        characteristic: 9,
        place: workbench
    },
    {
        icon: "⚡",
        title: "Электромеч",
        price: [getResource('Провода', 7)],
        characteristic: 15,
        place: workbench,
        rarity: 'first'
    },
    {
        icon: "⚡",
        title: "Электромеч",
        price: [getResource('Провода', 17)],
        characteristic: 21,
        place: workbench,
        rarity: 'second'
    },
    {
        icon: "💥",
        title: "Лазерный тесак",
        price: [getResource(MATERIALS, 5600),getResource(QUARZ, 4)],
        characteristic: 12,
        place: workbench
    },
    {
        icon: "💥",
        title: "Лазерный тесак",
        price: [getResource('Минизаряд', 7), getResource('Провода', 5)],
        characteristic: 20,
        place: workbench,
        rarity: 'first'
    },
    {
        icon: "💥",
        title: "Лазерный тесак",
        price: [getResource('Минизаряд', 17), getResource('Провода', 15)],
        characteristic: 28,
        place: workbench,
        rarity: 'second'
    },
    {
        icon: "💥",
        title: "BFGzzv-4000",
        price: [getResource(MATERIALS, 12000), getResource(QUARZ, 30)],
        characteristic: 20,
        place: workbench
    },
    {
        icon: "💥",
        title: "BFGzzv-4000",
        price: [getResource('Транзистор', 5), getResource('Изолента', 6)],
        characteristic: 29,
        place: workbench,
        rarity: 'first'
    },
    {
        icon: "🔗",
        title: "Силовой кастет",
        price: [getResource(MATERIALS, 14000), getResource(QUARZ, 20), getResource(GENERATORS, 5)],
        characteristic: 25,
        place: workbench
    },
    {
        icon: "🔗",
        title: "Силовой кастет",
        price: [getResource('Минизаряд', 4), getResource('Изолента', 6), getResource('Топаз', 5)],
        characteristic: 25,
        place: workbench,
        rarity: 'first'
    },
    {
        icon: "🔗",
        title: "Силовой кастет",
        price: [getResource('Минизаряд', 14), getResource('Изолента', 16), getResource('Топаз', 15)],
        characteristic: 32,
        place: workbench,
        rarity: 'second'
    },
    {
        icon: "💥",
        title: "Колыбель Пустоши",
        price: [getResource(MATERIALS, 19990), getResource(QUARZ, 35), getResource(GENERATORS, 5)],
        characteristic: 29,
        place: workbench
    },
    {
        icon: "💥",
        title: "Колыбель Пустоши",
        price: [getResource('Транзистор', 9), getResource('Что-то чугунное', 10)],
        characteristic: 29,
        place: workbench,
        rarity: 'first'
    },
    {
        icon: "💥",
        title: "Tyrant-PDR",
        price: [getResource(MATERIALS, 29990), getResource(QUARZ, 60), getResource(GENERATORS, 25)],
        characteristic: 38,
        place: workbench

    },
    {
        icon: "💥",
        title: "Tyrant-PDR",
        price: [getResource('Вольфрам', 9), getResource('Тряпка', 12)],
        characteristic: 46,
        place: workbench,
        rarity: 'first'
    },
    {
        icon: "💥",
        title: "Tyrant-PDR",
        price: [getResource('Вольфрам', 19), getResource('Тряпка', 22)],
        characteristic: 51,
        place: workbench,
        rarity: 'second'
    },
    {
        icon: "☄️",
        title: "Огнемёд",
        price: [getResource(MATERIALS, 45900), getResource(QUARZ, 90),
            getResource(GENERATORS, 75), getResource(MICROCHIPS, 5)],
        characteristic: 49,
        place: workbench
    },
    {
        icon: "☄️",
        title: "Огнемёд",
        price: [getResource('Фольга!', 2), getResource('Сердце трога', 11),
        getResource('Потенциометр', 3), getResource('Сталь', 4)],
        characteristic: 58,
        place: workbench,
        rarity: 'first'
    },
    {
        icon: "☄️",
        title: "Огнемёд",
        price: [getResource('Фольга!', 12), getResource('Сердце трога', 21),
        getResource('Потенциометр', 13), getResource('Сталь', 14)],
        characteristic: 65,
        place: workbench,
        rarity: 'second'
    },
    {
        icon: "☄️",
        title: "Больверизатор",
        price: [getResource(MATERIALS, 59990), getResource(QUARZ, 100),
            getResource(GENERATORS, 90), getResource(MICROCHIPS, 45)],
        characteristic: 56,
        place: workbench
    },
    {
        icon: "☄️",
        title: "Больверизатор",
        price: [getResource('Фольга!', 3), getResource('Провода', 15), getResource('Изолента', 12)],
        characteristic: 69,
        place: workbench,
        rarity: 'first'
    },
    {
        icon: "☄️",
        title: "Больверизатор",
        price: [getResource('Фольга!', 19), getResource('Провода', 25), getResource('Изолента', 28)],
        characteristic: 76,
        place: workbench,
        rarity: 'second'
    },
    {
        icon: "🔮",
        title: "Энергосфера",
        price: [getResource(MATERIALS, 78990), getResource(GENERATORS, 120), 
            getResource(MICROCHIPS, 60), getResource(IRIDIUM, 20)],
        characteristic: 65,
        place: workbench
    },
    {
        icon: "🔮",
        title: "Энергосфера",
        price: [getResource('Сердце трога', 20), getResource('Детская кукла', 3)],
        characteristic: 78,
        place: workbench,
        rarity: 'first'
    },
    {
        icon: "🌟",
        title: "Армагеддец",
        price: [getResource(MATERIALS, 129990), getResource(GENERATORS, 150), 
            getResource(MICROCHIPS, 70), getResource(IRIDIUM, 40)],
        characteristic: 79,
        place: workbench
    },
    {
        icon: "🌟",
        title: "Армагеддец",
        price: [getResource('Провода', 30), getResource('Что-то чугунное', 9), getResource('Изолента', 25)],
        characteristic: 90,
        place: workbench,
        rarity: 'first'
    },
    {
        icon: "☣️",
        title: "Потрошитель",
        price: [getResource(MATERIALS, 158990), getResource(GENERATORS, 220), 
            getResource(MICROCHIPS, 99), getResource(IRIDIUM, 88)],
        characteristic: 92,
        place: engineer
    },
    {
        icon: "☣️",
        title: "Потрошитель",
        price: [getResource('Минизаряд', 11), getResource('Потенциометр', 14), getResource('Сталь', 5)],
        characteristic: 122,
        place: engineer,
        rarity: 'first'
    },
    {
        icon: "☣️",
        title: "Потрошитель",
        price: [getResource('Минизаряд', 23), getResource('Потенциометр', 24), getResource('Сталь', 15)],
        characteristic: 141,
        place: engineer,
        rarity: 'second'
    },
    {
        icon: "☣️",
        title: "Жиробас",
        price: [getResource(MATERIALS, 191000), getResource(GENERATORS, 250), 
            getResource(MICROCHIPS, 135), getResource(IRIDIUM, 112)],
        characteristic: 125,
        place: engineer
    },
    {
        icon: "☣️",
        title: "Жиробас",
        price: [getResource('Минизаряд', 10), getResource('Плазма', 8), getResource('Изолента', 4)],
        characteristic: 155,
        place: engineer,
        rarity: 'first'
    },
    {
        icon: "☣️",
        title: "Жиробас",
        price: [getResource('Минизаряд', 23), getResource('Плазма', 21), getResource('Изолента', 24)],
        characteristic: 163,
        place: engineer,
        rarity: 'first'
    },
    {
        icon: "🌟",
        title: "Гравипушка",
        price: [getResource(MATERIALS, 241900), getResource(GENERATORS, 310), 
            getResource(MICROCHIPSS, 185), getResource(IRIDIUM, 145)],
        characteristic: 159,
        place: engineer
    },
    {
        icon: "🌟",
        title: "Гравипушка",
        price: [getResource('Фольга!', 2), getResource('Сердце трога', 11),
        getResource('Потенциометр', 6), getResource('Сталь', 7)],
        characteristic: 189,
        place: engineer,
        rarity: 'first'
    },
    {
        icon: "🌟",
        title: "Гравипушка",
        price: [getResource('Фольга!', 12), getResource('Сердце трога', 21),
        getResource('Потенциометр', 26), getResource('Сталь', 17)],
        characteristic: 194,
        place: engineer,
        rarity: 'second'
    },
    {
        icon: "💿",
        title: "DVD-VCH",
        price: [getResource(MATERIALS, 269000), getResource(GENERATORS, 330), 
            getResource(MICROCHIPSS, 200), getResource(IRIDIUM, 180)],
        characteristic: 187,
        place: engineer
    },
    {
        icon: "💿",
        title: "DVD-VCH",
        price: [getResource('Тряпка', 30)],
        characteristic: 207,
        place: engineer,
        rarity: 'first'
    },
    {
        icon: "💿",
        title: "DVD-VCH",
        price: [getResource('Тряпка', 50)],
        characteristic: false,
        place: engineer,
        rarity: 'second'
    },
    {
        icon: "♻️",
        title: "Рандомган",
        price: [getResource(MATERIALS, 281300), getResource(GENERATORS, 350), 
            getResource(MICROCHIPS, 223), getResource(IRIDIUM, 197)],
        characteristic: 206,
        place: engineer
    },
    {
        icon: "♻️",
        title: "Рандомган",
        price: [getResource('Фольга!', 3), getResource('Вольфрам', 13),
        getResource('Изолента', 12), getResource('Провода', 15)],
        characteristic: 231,
        place: engineer,
        rarity: 'first'
    },
    {
        icon: "♻️",
        title: "Рандомган",
        price: [getResource('Фольга!', 13), getResource('Вольфрам', 19),
        getResource('Изолента', 32), getResource('Провода', 25)],
        characteristic: 242,
        place: engineer,
        rarity: 'second'
    },
    {
        icon: "🐱",
        title: "Ракетенок☄",
        price: [getResource(MATERIALS, 349900), getResource(GENERATORS, 410), 
            getResource(MICROCHIPS, 299), getResource(IRIDIUM, 250)],
        characteristic: 266,
        place: engineer
    },
    {
        icon: "🐱",
        title: "Ракетенок☄",
        price: [getResource('Фольга!', 12), getResource('Плазма', 14),
        getResource('Сердце трога', 21), getResource('Потенциометр', 21), getResource('Сталь', 24)],
        characteristic: 284,
        place: engineer,
        rarity: 'first'
    },
    {
        icon: "🐱",
        title: "Ракетенок☄",
        price: [getResource('Фольга!', 32), getResource('Плазма', 44),
        getResource('Сердце трога', 31), getResource('Потенциометр', 31), getResource('Сталь', 44)],
        characteristic: 298,
        place: engineer,
        rarity: 'second'
    },
    {
        icon: "✳️",
        title: "Протонный топор",
        price: [getResource(MATERIALS, 359900), getResource(QUARZ, 2990), 
            getResource(MICROCHIPS, 289), getResource(IRIDIUM, 250)],
        characteristic: 278,
        place: core
    },
    {
        icon: "❇️",
        title: "Плазмакастер",
        price: [getResource(MATERIALS, 379900), getResource(GENERATORS, 410), 
            getResource(MICROCHIPS, 359), getResource(IRIDIUM, 265)],
        characteristic: 291,
        place: core
    },
    {
        icon: "❇️",
        title: "Плазмакастер",
        price: [getResource('Фольга!', 23), getResource('Изолента', 22), getResource('Провода', 25)],
        characteristic: 314,
        place: core,
        rarity: 'first'
    },
    {
        icon: "❇️",
        title: "Плазмакастер",
        price: [getResource('Фольга!', 43), getResource('Изолента', 49), getResource('Провода', 55)],
        characteristic: 329,
        place: core,
        rarity: 'second'
    },
    {
        icon: "💣",
        title: "Судный день",
        price: [getResource(MATERIALS, 325900), getResource(GENERATORS, 680), 
            getResource(MICROCHIPS, 399), getResource(IRIDIUM, 280)],
        characteristic: 305,
        place: core
    },
    {
        icon: "✝️",
        title: "Святое пламя",
        price: [getResource(MATERIALS, 385900), getResource(GENERATORS, 720), 
            getResource(MICROCHIPS, 419), getResource(IRIDIUM, 300)],
        characteristic: 318,
        place: core
    },
    {
        icon: "💥",
        title: "Маленький друг",
        price: [getResource(MATERIALS, 399400), getResource(GENERATORS, 750), 
            getResource(MICROCHIPS, 435), getResource(IRIDIUM, 329)],
        characteristic: 325,
        place: core
    },
    {
        icon: "🧠",
        title: "Брейналайзер",
        price: [getResource(MATERIALS, 656900), getResource(CUBONITE, 38990)],
        characteristic: 344,
        place: basement
    },
    {
        icon: "🌡",
        title: "Плюмбус",
        price: [getResource(MATERIALS, 957900), getResource(CUBONITE, 54990), getResource(OSMIUM, 30290)],
        characteristic: 416,
        place: basement
    },
    {
        icon: "💢",
        title: "Плазмолив",
        price: [getResource(MATERIALS, 1135900), getResource(CUBONITE, 68490), 
            getResource(OSMIUM, 45590), getResource(TITANIUM, 43930)],
        characteristic: false,
        place: basement
    },
    {
        icon: "❇️",
        title: "γ-Дезинтегратор",
        price: [getResource(MATERIALS, 1426900), getResource(CUBONITE, 99990), 
            getResource(OSMIUM, 79560), getResource(TITANIUM, 66980)],
        characteristic: 507,
        place: basement
    },
    {
        icon: false,
        title: 'Фалмерский клинок',
        price: false,
        characteristic: 8,
        place: mine
    },
    {
        icon: '💥',
        title: 'Фусронет',
        price: false,
        characteristic: 55,
        place: openShelter
    },
    {
        icon: '📯',
        title: 'Даэдрический меч',
        price: false,
        characteristic: 216,
        place: highHrotgar
    },
    {
        icon: false,
        title: 'Барракуда',
        price: false,
        characteristic: 360,
        place: moltenCore
    }
];

module.exports = {
    weapons,
    weaponsComment,
    inventionWeaponIcon
};
