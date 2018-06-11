const helmets = require('./helmet.js');
const bills = require('./places&bills.js');

function costText(cost) {
    let costText = '';
    Object.keys(cost).forEach(element => {
        costText += `${cost[element]}`;
    });  
    return costText;
};

function getHelmetsByPlace(place) {
    const placeHelmet = helmets.filter(helmet => helmet.place === place);
    let placeText = _.sortBy(placeHelmet, helmet => helmet.amount).map(({
        icon,
        title,
        cost,
        amount
    }) => {
        return `${icon ? `${icon}` : ''} *${title}*\n${costText(cost)}\nУрон: +${amount ? `${amount}` : '???'}`;
    }).join('\n');
    return placeText;
};

module.exports = getHelmetsByPlace;