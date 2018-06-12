const helmets = require('./helmet.js');
const helmetsComment = require('./helmet.js');
const weapons = require('./weapon.js');
const weaponsComment = require('./weapon.js');
const armors = require('./armor.js');
const armorsComment = require('./armor.js');
const meds = require('./meds.js');
const bills = require('./places&bills.js');

function costText(cost) {
    let costText = '';
    Object.keys(cost).forEach(element => {
        costText += `${bills[element].icon}${cost[element]} `;    
    });  
    return costText;
};

function getItemsByPlace(place, placeComment, items) {
    const placeItem = items.filter(item => item.place === place);
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

module.exports = getHelmetsByPlace;
module.exports = getWeaponsByPlace;
module.exports = getArmorsByPlace;
module.exports = getMedsByPlace;