const helmets = require('./helmet.js');
const weapons = require('./weapon.js');
const armors = require('./armor.js');
const bills = require('./places&bills.js');

function costText(cost) {
    let costText = '';
    Object.keys(cost).forEach(element => {
        costText += `${cost[element]}`;
    });  
    return costText;
};

function getItemsByPlace(place, items) {
    const placeItem = items.filter(item => item.place === place);
    let placeText = _.sortBy(placeItem, item => item.amount).map(({
        icon,
        title,
        cost,
        amount
    }) => {
        return `${icon ? `${icon}` : ''} *${title}*\n${costText(cost)}\nУрон: +${amount ? `${amount}` : '???'}`;
    }).join('\n');
    return placeText;
};

function getHelmetsByPlace(place) {
    let placeText = getItemsByPlace(place, helmets); 
    return placeText;
};

function getWeaponsByPlace(place) {
    let placeText = getItemsByPlace(place, weapons); 
    return placeText;
};

function getArmorsByPlace(place) {
    let placeText = getItemsByPlace(place, armors); 
    return placeText;
};

module.exports = getHelmetsByPlace;
module.exports = getWeaponsByPlace;
module.exports = getArmorsByPlace;