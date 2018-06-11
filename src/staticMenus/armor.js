const merchant = '🏚Торгаш';
const craftingTable = '🛠Верстак';
const engineer = '👓Инженер';
const core = '🕎Ядро';
const cozyBasement = '🚪Уютный подвальчик';

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
        icon: "⚡",
        title: "⚡️Прочная бита",
        cost: { materials: 200, },
        amount: 2,
        place: craftingTable,
    },
    {
        icon: "⚡",
        title: "Копье",
        cost: { materials: 600, },
        amount: 4,
        place: craftingTable,
    },
    {
        icon: "⚡",
        title: "⚡Кистень",
        cost: { materials: 1300, },
        amount: 6,
        place: craftingTable,
    },
    {
        icon: "⚡",
        title: "Электромеч",
        cost: { materials: 3900, },
        amount: 9,
        place: craftingTable,
    },
    {
        icon: "💥",
        title: "Лазерный тесак",
        cost: {
            materials: 5600,
            quartz: 4,
        },
        amount: 12,
        place: craftingTable,
    },
    {
        icon: "💥",
        title: "BFGzzv-4000",
        cost: {
            materials: 12000,
            quartz: 30,
        },
        amount: 20,
        place: craftingTable,
    },
    {
        icon: "💥",
        title: "BFGzzv-4000",
        cost: {
            materials: 12000,
            quartz: 30,
        },
        amount: 20,
        place: craftingTable,
    },
    {
        icon: "🔗",
        title: "Силовой кастет",
        cost: {
            materials: 14000,
            quartz: 20,
            generators: 5,
        },
        amount: 25,
        place: craftingTable,
    },
    {
        icon: "💥",
        title: "Колыбель Пустоши",
        cost: {
            materials: 19990,
            quartz: 35,
            generators: 5,
        },
        amount: 29,
        place: craftingTable,
    },
    {
        icon: "💥",
        title: "Tyrant-PDR",
        cost: {
            materials: 29990,
            quartz: 60,
            generators: 25,
        },
        amount: 38,
        place: craftingTable,
    },
    {
        icon: "☄️",
        title: "Огнемёд",
        cost: {
            materials: 45900,
            quartz: 90,
            generators: 75,
            microchip: 5,
        },
        amount: 49,
        place: craftingTable,
    },
    {
        icon: "☄",
        title: "️Больверизатор",
        cost: {
            materials: 59990,
            quartz: 100,
            generators: 90,
            microchip: 45,
        },
        amount: 56,
        place: craftingTable,
    },
    {
        icon: "🔮",
        title: "Энергосфера",
        cost: {
            materials: 78990,
            generators: 120,
            microchip: 60,
            iridium: 20,
        },
        amount: 65,
        place: craftingTable,
    },
    {
        icon: "🌟",
        title: "Армагеддец",
        cost: {
            materials: 129990,
            generators: 150,
            microchip: 70,
            iridium: 40,
        },
        amount: 79,
        place: craftingTable,
    },
    {
        icon: "☣️",
        title: "Потрошитель",
        cost: {
            materials: 158990,
            generators: 220,
            microchip: 99,
            iridium: 88,
        },
        amount: 92,
        place: engineer,
    },
    {
        icon: "☣️",
        title: "Жиробас",
        cost: {
            materials: 191000,
            generators: 250,
            microchip: 135,
            iridium: 112,
        },
        amount: 125,
        place: engineer,
    },
    {
        icon: "🌟",
        title: "Гравипушка",
        cost: {
            materials: 241900,
            generators: 310,
            microchip: 185,
            iridium: 145,
        },
        amount: 159,
        place: engineer,
    },
    {
        icon: "💿",
        title: "DVD-VCH",
        cost: {
            materials: 269000,
            generators: 330,
            microchip: 200,
            iridium: 180,
        },
        amount: 187,
        place: engineer,
    },
    {
        icon: "♻️",
        title: "Рандомган",
        cost: {
            materials: 281300,
            generators: 350,
            microchip: 223,
            iridium: 197,
        },
        amount: 'random',
        place: engineer,
    },
    {
        icon: "🐱",
        title: "Ракетенок☄",
        cost: {
            materials: 349900,
            generators: 410,
            microchip: 299,
            iridium: 250,
        },
        amount: 266,
        place: engineer,
    },
    {
        icon: "✳️",
        title: "Протонный топор",
        cost: {
            materials: 359900,
            quartz: 2990,
            microchip: 289,
            iridium: 275,
        },
        amount: false,
        place: core,
    },
    {
        icon: "❇️",
        title: "Плазмакастер",
        cost: {
            materials: 349900,
            generators: 410,
            microchip: 359,
            iridium: 310,
        },
        amount: 291,
        place: core,
    },
    {
        icon: "💣",
        title: "Судный день",
        cost: {
            materials: 325900,
            generators: 680,
            microchip: 399,
            iridium: 390,
        },
        amount: false,
        place: core,
    },
    {
        icon: "💥",
        title: "Маленький друг",
        cost: {
            materials: 399400,
            generators: 750,
            microchip: 435,
            iridium: 329,
        },
        amount: 325,
        place: core,
    },
    {
        icon: "🧠",
        title: "Брейналайзер",
        cost: {
            materials: 656900,
            cubonite: 38990,
        },
        amount: 344,
        place: cozyBasement,
    },
    {
        icon: "🌡",
        title: "Плюмбус",
        cost: {
            materials: 957900,
            cubonite: 54990,
            osmium: 30290,
        },
        amount: 416,
        place: cozyBasement,
    },
    {
        icon: "💢",
        title: "Плазмолив",
        cost: {
            materials: 1135900,
            cubonite: 68490,
            osmium: 45590,
            titanium: 43930,
        },
        amount: false,
        place: cozyBasement,
    },
    {
        icon: "❇️",
        title: "γ-Дезинтегратор",
        cost: {
            materials: 1426900,
            cubonite: 99990,
            osmium: 79560,
            titanium: 66980,
        },
        amount: 507,
        place: cozyBasement,
    }
];

function getArmorsByPlace(place) {
    const placeArmor = armors.filter(armor => armor.place === place);
    let placeText = _.sortBy(placeArmor, armor => armor.amount).map(({
        icon,
        title,
        cost,
        amount
    }) => {
        return `${icon} *${title}* \n${cost} \nУрон: +${amount ? `${amount}` : '???'}`;
    }).join('\n');
    return placeText;
};

module.exports = getArmorsByPlace;