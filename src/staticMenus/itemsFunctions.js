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
    let costText = '';
    Object.keys(cost).forEach(element => {
        costText += `${bills[element].icon}${cost[element]} `;
    });
    return costText;
};

const getItemsByPlace = (place, items, placeComment = '') => {
    const placeItem = items.filter(item => item.title === place);

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

    return _.sortBy(placeItem, item => item.amount).map(({
        icon,
        title,
        cost,
        amount
    }) => {
        return `${getItemIcon(icon)} *${title}*
        ${costText(cost)}
        ${placeComment}${getItemAmount(amount)}`;
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

module.exports = {
    getHelmetsByPlace,
    getWeaponsByPlace,
    getArmorsByPlace,
    getMedsByPlace
};