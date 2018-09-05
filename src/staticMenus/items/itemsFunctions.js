const _ = require('underscore');

const {
    helmets,
    helmetsComment
} = require('./helmet.js');

const {
    weapons,
    weaponsComment
} = require('./weapon.js');

const {
    armors,
    armorsComment
} = require('./armor.js');

const meds = require('./meds.js');

const getItemIcon = icon => {
    if (icon) {
       return icon;
    }

   return '';
}

const getItemCharacteristic = characteristic => {
    if (characteristic) {
        return characteristic;
    }

    return '???';
}

const showItem = (item, comment) => {
    return `
${getItemIcon(item.icon)} *${item.title}*
${comment} ${item.characteristic}
💰: ${item.price.join(', ')}
`;
}

const showMed = item => {
    return `
${getItemIcon(item.icon)} *${item.title}*
${item.effect}${getItemCharacteristic(item.characteristic)}
💰: ${item.price.join(',')}
${item.comment ? `${item.comment}` : ''}
`;
}

const showInvention = (item, comment) => {
    return `
    ${item.icon}${item.title}
    ${item.rarity} (${item.characteristic}${comment}) - ${item.price.join(',')}
    `;
}

const showItemsByPlace = (place, items, itemsComment) => {
    const itemsFromPlace = items.filter(item => (item.place === place)&&(!!item.price));
    return Object.keys(itemsFromPlace).map(item => {
        return showItem(itemsFromPlace[item], itemsComment);
    }).join('');
};

const getHelmetsByPlace = place => {
    return showItemsByPlace(place, helmets, helmetsComment)
};

const getWeaponsByPlace = place => {
    return showItemsByPlace(place, weapons, weaponsComment)
};

const getWeaponInventionsByPlace = place => {
    const itemsFromPlace = weapons.filter(item => (item.place === place)&&(!!item.rarity));
    return Object.keys(itemsFromPlace).map(item => {
        return showInvention(itemsFromPlace[item], '⚔️');
    }).join('');
};

const getArmorsByPlace = place => {
    return showItemsByPlace(place, armors, armorsComment)
};

const getArmorInventionsByPlace = place => {
    const itemsFromPlace = armors.filter(item => (item.place === place)&&(!!item.rarity));
    return Object.keys(itemsFromPlace).map(item => {
        return showInvention(itemsFromPlace[item], '🛡');
    }).join('');
};

const getMedsByPlace = place => {
    const itemsFromPlace = meds.filter(item => (item.place === place));
    return Object.keys(itemsFromPlace).map(item => {
        return showMed(itemsFromPlace[item]);
    }).join('');
};

module.exports = {
    getHelmetsByPlace,
    getWeaponsByPlace,
    getArmorsByPlace,
    getMedsByPlace,
    getWeaponInventionsByPlace,
    getArmorInventionsByPlace
};