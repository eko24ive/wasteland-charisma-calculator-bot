const merchant = '🏚Торгаш';
const craftingTable = '🛠Верстак';
const engineer = '👓Инженер';
const core = '🕎Ядро';
const cozyBasement = '🚪Уютный подвальчик';

const helmets = [
    {
        icon: false,
        title: "Вязаная шапка",
        cost: { caps: 30, },
        amount: 1,
        place: merchant,
    },
    {
        icon: false,
        title: "Ушанка",
        cost: { caps: 30, },
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
        icon: "👕",
        title: "Портупея",
        cost: { materials: 390, },
        amount: 3,
        place: craftingTable,
    },
    {
        icon: "👕",
        title: "Кожаный жилет",
        cost: { materials: 890, },
        amount: 6,
        place: craftingTable,
    },
    {
        icon: "👕",
        title: "Титановые щитки",
        cost: { materials: 5200, },
        amount: 16,
        place: craftingTable,
    },
    {
        icon: "⚙️",
        title: "Силовая броня",
        cost: { 
            materials: 12990,
            generators: 5,
        },
        amount: 25,
        place: craftingTable,
    },
    {
        icon: "⚙️",
        title: "Силовая броня🎖",
        cost: {
            materials: 22990,
            generators: 15,
        },
        amount: 35,
        place: craftingTable,
    },
    {
        icon: "⚙️",
        title: "Силовая броня🎖🎖",
        cost: {
            materials: 35990,
            generators: 35,
        },
        amount: 45,
        place: craftingTable,
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
        place: craftingTable,
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
        place: craftingTable,
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

function getHelmetsByPlace(place) {
    const placeHelmet = helmets.filter(helmet => helmet.place === place);
    let placeText = _.sortBy(placeHelmet, helmet => helmet.amount).map(({
        icon,
        title,
        cost,
        amount
    }) => {
        return `${icon} *${title}* \n${cost} \nУрон: +${amount ? `${amount}` : '???'}`;
    }).join('\n');
    return placeText;
};

module.exports = getHelmetsByPlace;