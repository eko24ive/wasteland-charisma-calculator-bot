const mongoose = require('mongoose');
const moment = require('moment');
const beastSchema = require('../schemes/beast');
const Beast = mongoose.model('Beast', beastSchema);

mongoose.connect(process.env.MONGODB_URI);

const dzRangeStageOne = [ //20.06
  [21, 34],
  [50, 62],
  [74, 95]
];

const dzRangeStageTwo = [ //01.07
  [23, 39],
  [52, 64],
  [74, 95]
]

const possibleDzRange = (distances, dzRange) => {
  return dzRange.map(range => {
    const [from, to] = range;

    return distances.some(distance => distance >= from && distance <= to);
  }).some(v => v);
}

let amount = 0;
let total = 0;

Beast.find().then(beasts => {
  console.log('===START===');

  beasts.forEach(beast => {
    if (!beast.battles) {
      return;
    }

    beast.battles.forEach(battle => {
      total++;
      if (battle.stamp) {
        const date = moment(Number(battle.stamp.slice(0, 13)));
        const day = date.day();
        const month = date.month();
        const year = date.year();

        if (year !== 2018) {
          console.log('SLICE ERROR');
        } else {
          if ((day >= 20 && month >= 6) || (month >= 7)) { //Stage one
            if (possibleDzRange(beast.distanceRange, dzRangeStageOne)) {
              amount++;
            }
          } else if (day >= 1 && month >= 7 || month >= 8) { //Stage two
            if (possibleDzRange(beast.distanceRange, dzRangeStageTwo)) {
              amount++;
            }
          }
        }
      }
    })
  })
}).then(() => {
  console.log('===END===');
  console.log(`Total: ${total}\nAmount: ${amount}\nLoss: ${total-amount}`);
  mongoose.disconnect();
});

moment(15312107523 * 100).calendar()