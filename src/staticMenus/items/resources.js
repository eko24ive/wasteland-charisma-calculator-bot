const CAPS = 'CAPS';
const MATERIALS = 'MATERIALS';
const QUARZ = 'QUARZ';
const GENERATORS = 'GENERATORS';
const MICROCHIPS = 'MICROCHIPS';
const IRIDIUM = 'IRIDIUM';
const CUBONITE = 'CUBONITE';
const OSMIUM = 'OSMIUM';
const TITANIUM = 'TITANIUM';
const EPHEDRINE = 'EPHEDRINE';
const WIRES = 'WIRES';
const MINICHARGE = 'MINICHARGE';
const TRANSISTOR = 'TRANSISTOR';
const TOPAZ = 'TOPAZ';
const DUSTER = 'DUSTER';
const WOLFRAM = 'WOLFRAM';
const FOIL = 'FOIL';
const TAPE = 'TAPE';
const IRONTHING = 'IRONTHING';
const THROGHEART = 'THROGHEART';
const POTENTIOMETER = 'POTENTIOMETER';
const STEEL = 'STEEL';
const PLASMA = 'PLASMA';
const DOLL = 'DOLL';
const BIOS = 'BIOS';
const MAGNET = 'MAGNET';
const PLANTAIN = 'PLANTAIN';
const STARCH = 'STARCH';
const AIRFILTER = 'AIRFILTER';

const resources = {
    CAPS: {
        title: 'Крышки',
        icon: '🕳',
        description: 'Основная валюта в пустоши'
    },
    MATERIALS: {
        title: 'Материалы',
        icon: '📦',
        description: 'Материалы можно найти почти на каждом углу Пустоши - это самый распостраненный ресуср'
    },
    QUARZ: {
        title: 'Кварц',
        icon: '🔹',
        description: ''

    },
    GENERATORS: {
        title: 'Генераторы',
        icon: '💡',
        description: ''
    },
    MICROCHIPS: {
        title: 'Микрочипы',
        icon: '💾',
        description: ''
    },
    IRIDIUM: {
        title: 'Иридий',
        icon: '🔩',
        description: ''
    },
    CUBONITE: {
        title: 'Кубонит',
        icon: '🔗',
        description: ''
    },
    OSMIUM: {
        title: 'Осмий',
        icon: '🔗',
        description: ''
    },
    TITANIUM: {
        title: 'β-Ti3Au',
        icon: '🔗',
        description: ''
    },
    EPHEDRINE: {
        title: 'Эфедрин',
        icon: '',
        description: ''
    },
    WIRES: {
        title: 'Провода',
        icon: '',
        description: ''
    },
    MINICHARGE: {
        title: 'Минизаряд',
        icon: '',
        description: ''
    },
    TRANSISTOR: {
        title: 'Транзистор',
        icon: '',
        description: ''
    },
    TOPAZ: {
        title: 'Топаз',
        icon: '',
        description: ''
    },
    DUSTER: {
        title: 'Тряпка',
        icon: '',
        description: ''
    },
    WOLFRAM: {
        title: 'Вольфрам',
        icon: '',
        description: ''
    },
    FOIL: {
        title: 'Фольга!',
        icon: '',
        description: ''
    },
    TAPE: {
        title: 'Изолента',
        icon: '',
        description: ''
    },
    IRONTHING: {
        title: 'Что-то чугунное',
        icon: '',
        description: ''
    },
    THROGHEART: {
        title: 'Сердце трога',
        icon: '',
        description: ''
    },
    POTENTIOMETER: {
        title: 'Потенциометр',
        icon: '',
        description: ''
    },
    STEEL: {
        title: 'Сталь',
        icon: '',
        description: ''
    },
    PLASMA: {
        title: 'Плазма',
        icon: '',
        description: ''
    },
    DOLL: {
        title: 'Детская кукла',
        icon: '',
        description: '' 
    },
    BIOS: {
        title: 'Батарейка BIOS',
        icon: '',
        description: '' 
    },
    MAGNET: {
        title: 'Магнит',
        icon: '',
        description: '' 
    },
    PLANTAIN: {
        title: 'Подорожник',
        icon: '',
        description: '' 
    },
    STARCH: {
        title: 'Крахмал',
        icon: '',
        description: '' 
    },
    AIRFILTER: {
        title: 'Воздушный фильтр',
        icon: '',
        description: '' 
    },
};

const getResource = (name, amount) => {
    const resource = resources[name];
    return `${resource.icon}${resource.title} x${amount}`;
}

const FIRST = 'FIRST';
const SECOND = 'SECOND';

const rarities = {
    FIRST: {
        icon: '🏅'
    },
    SECOND: {
        icon: '🔆'
    }
}

const getRarityIcon = (name) => {
    const rarity = rarities[name];
    return `${rarity.icon}`;
};

module.exports = {
    CAPS,
    MATERIALS,
    QUARZ,
    GENERATORS,
    MICROCHIPS,
    IRIDIUM,
    CUBONITE,
    OSMIUM,
    TITANIUM,
    EPHEDRINE,
    WIRES,
    MINICHARGE,
    TRANSISTOR,
    TOPAZ,
    DUSTER,
    WOLFRAM,
    FOIL,
    TAPE,
    IRONTHING,
    THROGHEART,
    POTENTIOMETER,
    STEEL,
    PLASMA,
    DOLL,
    BIOS,
    PLANTAIN,
    MAGNET,
    STARCH,
    AIRFILTER,
    getResource,
    FIRST,
    SECOND,
    getRarityIcon
}