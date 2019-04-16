require('dotenv').config();
const mongoose = require('mongoose');
const async = require('async');

const beastSchema = require('../../schemes/beast');

const Beast = mongoose.model('Beast', beastSchema);

mongoose.connect(process.env.RUNNER_URI);

let totalBattles = 0;
let totalIssues = 0;
let withoutDistance = 0;

console.log('START');

Beast.find().then((beasts) => {
  if (beasts === null) {
    return;
  }

  async.forEach(beasts, (beast, next) => {
    const beastDistances = beast.distanceRange.map(({ value }) => value);

    if (!beast.battles) {
      next();
    }

    beast.battles.forEach(({ distance }) => {
      totalBattles += 1;

      if (distance) {
        if (beastDistances.indexOf(distance) === -1) {
          totalIssues += 1;
        }
      } else {
        withoutDistance += 1;
      }
    });

    next();
  }, () => {
    if (totalIssues > 0) {
      console.log(`
totalBattles: ${totalBattles}
totalIssues: ${totalIssues}
withoutDistance: ${withoutDistance}
      `);
    } else {
      console.log('NO ISSUES DETECTED');
      console.log(`totalBattles: ${totalBattles}`);
    }
    console.log('END');
    mongoose.disconnect();
  });
});
