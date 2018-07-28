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
        icon: '🔗(Кубонит)',
        description: ''
    },
    OSMIUM: {
        title: 'Осмий',
        icon: '🔗(Осмий)',
        description: ''
    },
    TITANIUM: {
        title: 'β-Ti3Au',
        icon: '🔗(β-Ti3Au)',
        description: ''
    },
    EPHEDRINE: {
        title: 'Эфедрин',
        icon: 'Эфедрин',
        description: ''
    }
};

const getResource = (name,amount) => {
    const resource = resources[name];
    return `${resource.icon}${resource.title}: ${amount}`;
}

const FIRST = 'FIRST';
const SECOND = 'SECOND';

const rarity = {
    FIRST: {
        icon: '🔆'
    },
    SECOND: {
        icon: '🔆'
    }
}

const getRarityIcon = (name) => {
    const rarity = rarity[name];
    return rarity.icon;
};

module.export = {
    CAPS,
    getResource,
    getRarityIcon,
    rarity
}