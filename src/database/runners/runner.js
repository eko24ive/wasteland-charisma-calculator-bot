require('dotenv').config({ path: '../../../.env' });
const mongoose = require('mongoose');
const async = require('async');
const beastSchema = require('../../schemes/beast');

const Beast = mongoose.model('Beast', beastSchema);

const __version = '2.0';
let amount = 0;
let i = 1;
mongoose.connect(process.env.MONGODB_URI);

Beast.find().then((beasts) => {
  console.log('===START===');
  amount = beasts.length;

  async.forEach(beasts, (beast, next) => {
    const databaseBeast = beast;
    const jBeast = databaseBeast.toJSON();

    databaseBeast.subType = 'regular';
    databaseBeast.version = __version;

    if (databaseBeast.distanceRange.length > 0) {
      databaseBeast.distanceRange = jBeast.distanceRange.map(range => ({
        version: __version,
        value: range,
      }));
    }

    if (databaseBeast.capsReceived.length > 0) {
      databaseBeast.capsReceived = jBeast.capsReceived.map(caps => ({
        version: __version,
        value: caps,
      }));
    }

    if (databaseBeast.materialsReceived.length > 0) {
      databaseBeast.materialsReceived = jBeast.materialsReceived.map(materials => ({
        version: __version,
        value: materials,
      }));
    }

    if (databaseBeast.battles.length > 0) {
      databaseBeast.battles = jBeast.battles.map(battle => ({
        ...battle,
        version: __version,
      }));
    }

    if (databaseBeast.flees.length > 0) {
      databaseBeast.flees = jBeast.flees.map(flee => ({
        ...flee,
        version: __version,
      }));
    }

    if (databaseBeast.concussions.length > 0) {
      databaseBeast.concussions = jBeast.concussions.map(concussion => ({
        ...concussion,
        version: __version,
      }));
    }

    databaseBeast.markModified('distanceRange');
    databaseBeast.markModified('capsReceived');
    databaseBeast.markModified('materialsReceived');
    databaseBeast.markModified('battles');
    databaseBeast.markModified('flees');
    databaseBeast.markModified('concussions');

    databaseBeast.save().then(() => {
      console.log(`Updated: ${i}/${amount}`);
      i += 1;
      next();
    });
  }, () => {
    mongoose.disconnect();
    console.log('===END===');
  });
});
