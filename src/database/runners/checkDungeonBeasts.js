require('dotenv').config();
const mongoose = require('mongoose');
const async = require('async');

const beastSchema = require('../../schemes/beast');

const Beast = mongoose.model('Beast', beastSchema);

mongoose.connect(process.env.RUNNER_URI);

const dungeonBeastDistances = [
  11,
  19,
  23,
  29,
  34,
  39,
  45,
  50,
  56,
  69,
  74,
  80,
];

const issues = [];

console.log('START');

Beast.find({
  isDungeon: true,
}).then((beasts) => {
  if (beasts === null) {
    return;
  }

  async.forEach(beasts, (beast, next) => {
    const beastDistances = beast.distanceRange.map(({ value }) => value);

    const intersect = beastDistances.map(distance => dungeonBeastDistances.indexOf(distance) !== -1).some(distance => distance === true);

    if (!intersect) {
      issues.push(`${beast.name} - ${beast._id}`);
    }

    next();
  }, () => {
    if (issues.length > 0) {
      console.log(issues.join('\n'));
    } else {
      console.log('NO ISSUES DETECTED');
    }
    console.log('END');
    mongoose.disconnect();
  });
});
