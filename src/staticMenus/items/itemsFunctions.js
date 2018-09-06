const _ = require('underscore');

const {
    helmets,
    helmetsComment
} = require('./helmet.js');

const {
    weapons,
    weaponsShortComment,
    weaponsLongComment
} = require('./weapon.js');

const {
    armors,
    armorsShortComment,
    armorsLongComment
} = require('./armor.js');

const meds = require('./meds.js');

const {
    FIRST,
    SECOND,
    getRarityIcon
} = require('./resources.js');

const getItemIcon = icon => {
    if (icon) {
       return icon;
    }

   return '';
}

const getItemPrice = item => {
    if (item.price) {
       return item.price.join(', ');
    }

   return '???';
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
💰: ${getItemPrice(item)}
`;
}

const showMed = item => {
    return `
${getItemIcon(item.icon)} *${item.title}*
${item.effect}${getItemCharacteristic(item.characteristic)}
💰: ${getItemPrice(item)}${item.comment ? `\n${item.comment}` : ''}
`;
}

//const showInvention = (item, comment) => {
//    return `
//${getItemIcon(item.icon)}${item.title} ${item.rarity}
//(${getItemCharacteristic(item.characteristic)}${comment}) - ${getItemPrice(item)}
//`;
//}

const showInventionWithoutTitle = (item, comment) => {
    return `${item.rarity} (${getItemCharacteristic(item.characteristic)}${comment}) - ${getItemPrice(item)}`;
}

const showItemsByPlace = (place, items, itemsComment) => {
    const itemsFromPlace = items.filter(item => (item.place === place)&&(!!item.price)&&(!item.rarity));
    return Object.keys(itemsFromPlace).map(item => {
        return showItem(itemsFromPlace[item], itemsComment);
    }).join('');
};

const showItemsInventionsByPlace = (place, items, itemsComment) => {
    const allInv = items.filter(item => (item.place === place)&&(!!item.rarities));
    let result = '';
    allInv.forEach(inv => {
        const rar1 = items.filter(i => (i.title === inv.title)&&(i.rarity === getRarityIcon(FIRST)));
        const rar2 = items.filter(i => (i.title === inv.title)&&(i.rarity === getRarityIcon(SECOND)));
        result += `${getItemIcon(inv.icon)} *${inv.title}* (${getItemCharacteristic(inv.characteristic)}${itemsComment})
${rar1[0] ? `${showInventionWithoutTitle(rar1[0], itemsComment)}` : ''}
${rar2[0] ? `${showInventionWithoutTitle(rar2[0], itemsComment)}\n` : ''}\n`;
    });
    return result;
}

const getHelmetsByPlace = place => {
    return showItemsByPlace(place, helmets, helmetsComment)
};

const getWeaponsByPlace = place => {
    return showItemsByPlace(place, weapons, weaponsLongComment)
};

const getWeaponInventionsByPlace = place => {
    return showItemsInventionsByPlace(place, weapons, weaponsShortComment)
};

const getArmorsByPlace = place => {
    return showItemsByPlace(place, armors, armorsLongComment)
};

const getArmorInventionsByPlace = place => {
    return showItemsInventionsByPlace(place, armors, armorsShortComment)
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