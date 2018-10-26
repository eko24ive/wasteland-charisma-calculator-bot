require('dotenv').config({ path: '../../.env' });
const mongoose = require('mongoose');
const async = require('async');
const _ = require('underscore');

const beastSchema = require('../../schemes/beast');

const Beast = mongoose.model('Beast', beastSchema);

let i = 1;
let total = 0;
mongoose.connect('mongodb://localhost/wwa');

const wightBeasts = {};
const badBeast = {};

Beast.find().then((beasts) => {
  console.log('===START===');


  async.forEach(beasts, (beast, next) => {
    const databaseBeast = beast;

    const weightFields = [
      'distanceRange',
      'capsReceived',
      'materialsReceived',
      'battles',
      'flees',
      'concussions',
    ];

    const weight = _.reduce(weightFields.map(field => databaseBeast[field].length || 0), (memo, num) => memo + num, 0);

    if (wightBeasts[beast.name]) {
      if (wightBeasts[beast.name].weight >= weight) {
        const existingBeast = wightBeasts[beast.name];

        if (
          existingBeast.isDungeon === beast.isDungeon
          && existingBeast.type === beast.type
          && existingBeast.subType === beast.subType
        ) {
          if (beast.distanceRange) {
            beast.distanceRange.forEach((range) => {
              existingBeast.distanceRange.push(range);
            });
          }

          if (beast.capsReceived) {
            beast.capsReceived.forEach((range) => {
              existingBeast.capsReceived.push(range);
            });
          }

          if (beast.receivedItems) {
            beast.receivedItems.forEach((range) => {
              existingBeast.receivedItems.push(range);
            });
          }

          if (beast.concussions) {
            beast.concussions.forEach((range) => {
              existingBeast.concussions.push(range);
            });
          }

          if (beast.battles) {
            beast.battles.forEach((range) => {
              existingBeast.battles.push(range);
            });
          }

          if (beast.materialsReceived) {
            beast.materialsReceived.forEach((range) => {
              existingBeast.materialsReceived.push(range);
            });
          }

          if (beast.flees !== undefined) {
            existingBeast.flees.push(beast.flees[0]);
          }
        }
        next();
      } else {
        badBeast[beast.name] = beast;
        next();
      }
    } else {
      wightBeasts[beast.name] = {
        ...beast,
        weight,
      };

      total += 1;
      next();
    }

    // databaseBeast.markModified('distanceRange');
    // databaseBeast.markModified('capsReceived');
    // databaseBeast.markModified('materialsReceived');
    // databaseBeast.markModified('battles');
    // databaseBeast.markModified('flees');
    // databaseBeast.markModified('concussions');

    // databaseBeast.save().then(() => {
    // console.log(`Updated: ${i}/${amount}`);
    i += 1;
    // });
  }, () => {
    console.log(`Total: ${i}`);
    console.log(`Beasts for merge: ${(Object.keys(wightBeasts).length)}`);
    console.log(`Beasts after merge: ${(Object.keys(badBeast).length)}`);
    /* async.forEach(Object.keys(wightBeasts), (beast, next) => {
      Beast.update({ _id: wightBeasts[beast]._doc._id.toString() }, { $set: wightBeasts[beast]._doc }).then((err) => {
        if (err) {
          console.log(err);
          next();
        } else {
          next();
        }
      }).catch(e => console.log(e));
    }, () => {
      async.forEach(Object.keys(badBeast), (beast, next) => {
        Beast.remove({ _id: badBeast[beast]._doc._id.toString() }).then((err) => {
          if (err) {
            console.log(err);
            next();
          } else {
            next();
          }
        }).catch(e => console.log(e));
      }, () => {
        Beast.find().then((_beasts) => {
          console.log('=======');
          console.log(`Beasts now: ${_beasts.length}`);

          mongoose.disconnect();
          console.log('===END===');
        });
      });
    }); */
  });
});
