require('dotenv').config();
const mongoose = require('mongoose');
const async = require('async');

const beastSchema = require('../../schemes/beast');

const Beast = mongoose.model('Beast', beastSchema);

mongoose.connect(process.env.RUNNER_URI);

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

    beast.battles = beast.battles.filter(({ distance }) => {
      if (distance) {
        if (beastDistances.indexOf(distance) === -1) {
          return false;
        }

        return true;
      }

      return false;
    });

    beast.save().then(() => next());
  }, () => {
    console.log('END');
    mongoose.disconnect();
  });
});
