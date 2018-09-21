const _ = require('underscore');

const {
  helmets,
  helmetsComment,
} = require('./helmet.js');

const {
  weapons,
  weaponsComment,
} = require('./weapon.js');

const {
  armors,
  armorsComment,
} = require('./armor.js');

const meds = require('./meds.js');
const prices = require('./../prices.js');

const priceText = price => Object.keys(price).map(element => `${prices[element].icon}${(element === 'ephedrine') ? `(${price[element]})` : `${price[element]}`} `).join(', ');

const getItemIcon = (icon) => {
  if (icon) {
    return icon;
  }

  return '';
};

const getItemCharacteristic = (characteristic) => {
  if (characteristic) {
    return characteristic;
  }

  return '???';
};

const getItemsByPlace = (place, items, itemsGlobalComment = '') => {
  const itemsFromPlace = items.filter(item => item.place === place);

  return _.sortBy(itemsFromPlace, item => item.characteristic).map(({
    icon,
    title,
    price,
    effect,
    characteristic,
    comment,
  }) => `${getItemIcon(icon)} *${title}*
${effect || ''}${itemsGlobalComment}${getItemCharacteristic(characteristic)}
💰: ${priceText(price)}
${comment ? `${comment}\n` : ''}`).join('\n');
};

const getHelmetsByPlace = (place) => {
  const placeText = getItemsByPlace(place, helmets, helmetsComment);
  return placeText;
};

const getWeaponsByPlace = (place) => {
  const placeText = getItemsByPlace(place, weapons, weaponsComment);
  return placeText;
};

const getArmorsByPlace = (place) => {
  const placeText = getItemsByPlace(place, armors, armorsComment);
  return placeText;
};

const getMedsByPlace = (place) => {
  const placeText = getItemsByPlace(place, meds);
  return placeText;
};

/* const getAllItemsWithPlace = (items, itemsGlobalComment = '') => {
  const getItemIcon = (icon) => {
    if (icon) {
      return icon;
    }

    return '';
  };

  const getItemCharacteristic = (characteristic) => {
    if (characteristic) {
      return characteristic;
    }

    return '???';
  };

  return _.sortBy(items, item => item.characteristic).map(({
    icon,
    title,
    price,
    effect,
    characteristic,
    place,
    comment,
  }) => `${getItemIcon(icon)} *${title}*
        ${priceText(price)}
        ${effect || ''}${itemsGlobalComment}${getItemCharacteristic(characteristic)}
        ${comment || ''}
        Место покупки: ${place}`).join('\n');
}; */

module.exports = {
  getHelmetsByPlace,
  getWeaponsByPlace,
  getArmorsByPlace,
  getMedsByPlace,
};
