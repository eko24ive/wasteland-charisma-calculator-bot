require('dotenv').config({ path: '../../.env' });
const mongoose = require('mongoose');
const async = require('async');
const _ = require('underscore');

const beastSchema = require('../../schemes/beast');

const Beast = mongoose.model('Beast', beastSchema);
const sp = {};

let i = 1;
mongoose.connect('mongodb://localhost/wwa');

const wightBeasts = [];
const beastsToDelete = [];

Beast.find(sp).then((beasts) => {
  console.log('===START===');

  const mergeBeast = (
    _master,
    slave,
  ) => {
    beastsToDelete.push(slave._id.toJSON());
    const master = _.clone(_master);

    if (slave.distanceRange) {
      slave.distanceRange.forEach((range) => {
        master.distanceRange.push(range);
      });
    }

    if (slave.capsReceived) {
      slave.capsReceived.forEach((range) => {
        master.capsReceived.push(range);
      });
    }

    if (slave.materialsReceived) {
      slave.materialsReceived.forEach((range) => {
        master.materialsReceived.push(range);
      });
    }

    /* if (slave.receivedItems) {
      slave.receivedItems.forEach((range) => {
        master.receivedItems.push(range);
      });
    } */

    if (slave.concussions) {
      slave.concussions.forEach((range) => {
        master.concussions.push(range);
      });
    }

    if (slave.battles) {
      slave.battles.forEach((range) => {
        master.battles.push(range);
      });
    }

    if (slave.flees !== undefined) {
      slave.flees.forEach((flee) => {
        master.flees.push(flee);
      });
    }

    return master;
  };

  const getBeast = (collection, {
    name,
    isDungeon,
    subType,
    type,
  }) => {
    if (collection.length === 0) {
      return {
        beast: null,
        index: null,
      };
    }

    const foundBeasts = collection.map((beast, index) => ({
      beast,
      index,
    })).filter(({ beast }) => (
      beast.name === name
        && beast.isDungeon === isDungeon
        && beast.subType === subType
        && (beast.type === (type || 'Regular'))
    ));

    if (foundBeasts.length === 1) {
      return foundBeasts.pop();
    } if (foundBeasts.length === 0) {
      return {
        beast: null,
        index: null,
      };
    }

    throw new Error('found two beasts!');
  };

  async.forEach(beasts, (beast, next) => {
    const databaseBeast = beast.toJSON();

    i += 1;
    const weightFields = [
      'distanceRange',
      'battles',
      'flees',
    ];

    const weight = _.reduce(weightFields.map(field => databaseBeast[field].length || 0), (a, b) => a + b, 0);

    const { beast: foundBeast, index } = getBeast(wightBeasts, {
      name: databaseBeast.name,
      isDungeon: databaseBeast.isDungeon,
      subType: databaseBeast.subType,
      type: databaseBeast.type,
    });

    if (foundBeast !== null && index !== null) {
      if (foundBeast.weight >= weight) {
        const mergedBeast = mergeBeast(foundBeast, databaseBeast);
        wightBeasts[index] = mergedBeast;

        next();
      } else {
        const mergedBeast = mergeBeast(beast, foundBeast);
        wightBeasts[index] = mergedBeast;

        next();
      }
    } else {
      wightBeasts.push({
        ...databaseBeast,
        weight,
      });

      next();
    }
  }, () => {
    console.log(`Total: ${i}`);
    console.log(`Post merge: ${wightBeasts.length}`);
    Beast.remove(sp).then(() => {
      async.forEach(wightBeasts, ({ _id, ...beast }, next) => {
        const bts = beast.toJSON ? beast.toJSON() : beast;
        const newBeast = new Beast(bts);

        newBeast.save().then(() => {
          next();
        })
          .catch((e) => {
            console.log(e);
          });
      }, () => {
        Beast.find().then((_beasts) => {
          console.log('=======');
          console.log(`Beasts now: ${_beasts.length}`);

          mongoose.disconnect();
          console.log('===END===');
        });
      });
    });
  });
});
