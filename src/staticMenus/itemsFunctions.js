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
const bills = require('./prices.js');

const costText = cost => {
    return _.forEach(cost, 
        function(price){ 
            return `${bills[element].icon}${cost[element]}` 
        }).join(' ');
};

const getItemsByPlace = (place, items, itemsGlobalComment = '') => {
    const itemsFromPlace = items.filter(item => item.place === place);

    const getItemIcon = icon => {
        if(icon) {
            return icon;
        } 
        
        return '';
    }

    const getItemAmount = amount => {
        if(amount) {
            return amount;
        } 
        
        return '???';
    }

    return _.sortBy(itemsFromPlace, item => item.amount).map(({
        icon,
        title,
        cost,
        effect,
        amount,
        comment
    }) => {
        return `${getItemIcon(icon)} *${title}*
        ${costText(cost)}
        ${effect ? effect : ''}${itemsGlobalComment}${getItemAmount(amount)}
        ${comment ? comment : ''}`;
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
        if(icon) {
            return icon;
        } 
        
        return '';
    }

    const getItemAmount = amount => {
        if(amount) {
            return amount;
        } 
        
        return '???';
    }

    return _.sortBy(items, item => item.amount).map(({
        icon,
        title,
        cost,
        effect,
        amount,
        place,
        comment
    }) => {
        return `${getItemIcon(icon)} *${title}*
        ${costText(cost)}
        ${effect ? effect : ''}${itemsGlobalComment}${getItemAmount(amount)}
        ${comment ? comment : ''}
        Место покупки: ${place}`;
    }).join('\n');
};

module.exports = {
    getHelmetsByPlace,
    getWeaponsByPlace,
    getArmorsByPlace,
    getMedsByPlace,
    getAllItemsWithPlace
};