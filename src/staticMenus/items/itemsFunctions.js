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
const prices = require('./../prices.js');

const priceText = price => {
    return Object.keys(price).map(element => {
        return `${prices[element].icon}${(element === 'ephedrine') ? `(${price[element]})` : `${price[element]}`} `;
    }).join(', ');
};

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

const getItemsByPlace = (place, items, itemsGlobalComment = '') => {
    const itemsFromPlace = items.filter(item => item.place === place);

    return _.sortBy(itemsFromPlace, item => item.characteristic).map(({
        icon,
        title,
        price,
        effect,
        characteristic,
        comment
    }) => {
        return `${getItemIcon(icon)} *${title}*
${effect ? effect : ''}${itemsGlobalComment}${getItemCharacteristic(characteristic)}
💰: ${priceText(price)}
${comment ? `${comment}\n` : ''}`;
    }).join('\n');
};

const getHelmetsByPlace = place => {
    let placeText = getItemsByPlace(place, helmets, helmetsComment);
    return placeText;
};

const getWeaponsByPlace = place => {
    let placeText = getItemsByPlace(place, weapons, weaponsComment);
    return placeText;
};

const getArmorsByPlace = place => {
    let placeText = getItemsByPlace(place, armors, armorsComment);
    return placeText;
};

const getMedsByPlace = place => {
    let placeText = getItemsByPlace(place, meds);
    return placeText;
};

const getAllItemsWithPlace = (items, itemsGlobalComment = '') => {
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

    return _.sortBy(items, item => item.characteristic).map(({
        icon,
        title,
        price,
        effect,
        characteristic,
        place,
        comment
    }) => {
        return `${getItemIcon(icon)} *${title}*
        ${priceText(price)}
        ${effect ? effect : ''}${itemsGlobalComment}${getItemCharacteristic(characteristic)}
        ${comment ? comment : ''}
        Место покупки: ${place}`;
    }).join('\n');
};

module.exports = {
    getHelmetsByPlace,
    getWeaponsByPlace,
    getArmorsByPlace,
    getMedsByPlace
};