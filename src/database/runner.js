const mongoose = require('mongoose');
const async = require('async');
const moment = require('moment');
const beastSchema = require('../schemes/beast');

const Beast = mongoose.model('Beast', beastSchema);

mongoose.connect(process.env.MONGODB_URI);

const dzRangeStageOne = [ // 20.06
  [21, 34],
  [50, 62],
];

const dzRangeStageTwo = [ // 01.07
  [23, 39],
  [52, 64],
];

const possibleDzRange = (distances, dzRange) => dzRange.map((range) => {
  const [from, to] = range;

  return distances.some(distance => distance >= from && distance <= to);
}).some(v => v);

let amount = 0;
let total = 0;
let totalBeasts = 0;

Beast.find({
  type: 'Regular',
  isDungeon: false,
}).then((beasts) => {
  console.log('===START===');

  async.forEach(beasts, (beast, next) => {
    totalBeasts += 1;
    const databaseBeast = beast;
    if (!beast.battles) {
      next();
      return;
    }

    const jBeast = databaseBeast.toJSON();

    const newBatlles = jBeast.battles.filter((battle) => {
      total += 1;
      if (battle.stamp) {
        const date = moment(Number(battle.stamp.slice(0, 13)));
        const day = Number(date.format('DD'));
        const month = Number(date.format('MM'));
        const year = date.year();

        if (year !== 2018) {
          console.log('SLICE ERROR');
          return true;
        }
        if (((day >= 20 && month >= 6) || (month >= 7)) && possibleDzRange(beast.distanceRange, dzRangeStageOne)) { // Stage one
          amount += 1;
          return false;
        } if (((day >= 1 && month >= 7) || month >= 8) && possibleDzRange(beast.distanceRange, dzRangeStageTwo)) { // Stage two
          amount += 1;
          return false;
        }

        return true;
      }

      return true;
    });

    databaseBeast.battles = newBatlles;
    databaseBeast.markModified('battles');
    databaseBeast.save().then(() => {
      next();
    });
  }, () => {
    console.log(`Total beasts: ${totalBeasts}\nTotal battles: ${total}\nAmount: ${amount}\nPost purge: ${total - amount}`);
    mongoose.disconnect();
    console.log('===END===');
  });
});
