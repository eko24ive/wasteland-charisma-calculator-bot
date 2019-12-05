require('dotenv').config({ path: '../../../.env' });
const mongoose = require('mongoose');
const async = require('async');

const beastSchema = require('../../schemes/beast');

const Beast = mongoose.model('Beast', beastSchema);

mongoose.connect(process.env.RUNNER_URI);

let newBattles = 0;
let oldBattles = 0;

console.log('START');

Beast.find().then((beasts) => {
  if (beasts === null) {
    return;
  }

  async.forEach(beasts, (beast, next) => {
    if (!beast.battles) {
      next();
    }

    beast.battles.forEach(({ version }) => {
      if (version === process.env.VERSION) {
        newBattles += 1;
      } else {
        oldBattles += 1;
      }
    });

    next();
  }, () => {
    console.log(`
newBattles: ${newBattles}
oldBattles: ${oldBattles}
      `);
    mongoose.disconnect();
  });
});
