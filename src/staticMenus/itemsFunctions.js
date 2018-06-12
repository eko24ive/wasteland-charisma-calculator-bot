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

function costText(cost) {
    let costText = '';
    Object.keys(cost).forEach(element => {
        costText += `${bills[element].icon}${cost[element]} `;
    });
    return costText;
};

function getItemsByPlace(place, placeComment, items) {
    if (placeComment == undefined) placeComment = '';
    const placeItem = items.filter(item => item.title === `${place}`);
    let placeText = _.sortBy(placeItem, item => item.amount).map(({
        icon,
        title,
        cost,
        amount
    }) => {
        return `${icon ? `${icon}` : ''} *${title}*\n${costText(cost)}\n${placeComment}${amount ? `${amount}` : '???'}`;
    }).join('\n');
    return placeText;
};

function getHelmetsByPlace(place) {
    let placeText = getItemsByPlace(place, helmetsComment, helmets);
    return placeText;
};

function getWeaponsByPlace(place) {
    let placeText = getItemsByPlace(place, weaponsComment, weapons);
    return placeText;
};

function getArmorsByPlace(place) {
    let placeText = getItemsByPlace(place, armorsComment, armors);
    return placeText;
};

function getMedsByPlace(place) {
    let placeText = getItemsByPlace(place, meds);
    return placeText;
};

module.exports = {
    getHelmetsByPlace,
    getWeaponsByPlace,
    getArmorsByPlace,
    getMedsByPlace
};