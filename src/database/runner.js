// mongoexport -h ds119490.mlab.com:19490 -d heroku_1q54zt8s -c beasts -u heroku_1q54zt8s -p 8kbg65u9g98hol9dgithpujahv -o test.json

const mongoose = require('mongoose');
var async = require('async');
const _ = require('underscore');
const program = require('commander');
const moment = require('moment');
const writeJsonFile = require('write-json-file');

const beastSchema = require('../schemes/beast');
const locationSchema = require('../schemes/location');
const userSchema = require('../schemes/user');

const Beast = mongoose.model('Beast', beastSchema);
const Location = mongoose.model('Location', locationSchema);
const User = mongoose.model('User', locationSchema);

const input = require('./input');
const output = require('./output');

program
  .version('0.1.0')
  .option('-U, --uri', 'Running bot with test token')
  .parse(process.argv);

program.dev


const filteredData = {};

mongoose.connect('mongodb://heroku_1q54zt8s:8kbg65u9g98hol9dgithpujahv@ds119490.mlab.com:19490/heroku_1q54zt8s');

input.forEach(row => {
  const {
    distanceRange,
    name,
    isDungeon,
    capsReceived,
    materialsReceived,
    receivedItems,
    battles,
    flees,
    concussions,
    lastUpdated
  } = row;

  if (filteredData[name]) {
    const fBeast = filteredData[name];
    delete fBeast.battles._id;

    let isSameFleeExists = true,
      isSameConcussionExists = true;

    const isSameBattleExists = fBeast.battles.map(battle => {
      const existingBattle = _.clone(battle);

      return _.isEqual(existingBattle, row.battles[0]);
    }).some(result => result === true);

    if (row.concussions) {
      if (row.concussions.length > 0) {
        isSameConcussionExists = fBeast.concussions.map(concussion => {
          const existingConcussion = _.clone(concussion);
          delete existingConcussion._id;

          return _.isEqual(existingConcussion, row.concussions[0]);
        }).some(result => result === true);
      }
    }

    if (row.flees) {
      if (row.flees.length === 1) {
        isSameFleeExists = fBeast.flees.map(flee => {
          const existingFlee = _.clone(flee);
          delete existingFlee._id;

          return _.isEqual(existingFlee, row.flees[0]);
        }).some(result => result === true);
      }
    }

    if (!_.isEmpty(row.receivedItems)) {
      Object.keys(row.receivedItems).map((item) => {
        const amount = row.receivedItems[item];

        if (_.isObject(fBeast.receivedItems)) {
          if (fBeast.receivedItems[item]) {
            if (!_.contains(fBeast.receivedItems[item], amount)) {
              fBeast.receivedItems[item].push(amount);
            }
          } else {
            fBeast.receivedItems[item] = [amount];
          }
        }
      })
    }

    if (!_.contains(fBeast.distanceRange, row.distanceRange[0])) {
      fBeast.distanceRange.push(row.distanceRange[0]);
    }

    if (!_.contains(fBeast.capsReceived, row.capsReceived[0])) {
      fBeast.capsReceived.push(row.capsReceived[0]);
    }

    if (!_.contains(fBeast.materialsReceived, row.materialsReceived[0])) {
      fBeast.materialsReceived.push(row.materialsReceived[0]);
    }

    if (!isSameBattleExists) {
      const battle = row.battles[0];
      delete battle._id
      fBeast.battles.push(battle);
    }

    if (!isSameConcussionExists) {
      const concussion = row.concussions[0];
      delete concussion._id
      fBeast.concussions.push(concussion);
    }

    if (!isSameFleeExists) {
      const flee = row.flee[0];
      delete flee._id
      fBeast.flees.push(flee);
    }
  } else {
    filteredData[name] = {
      distanceRange,
      name,
      isDungeon,
      capsReceived,
      materialsReceived,
      receivedItems,
      battles,
      flees,
      concussions,
      lastUpdated
    };
  }
});


// Object.keys(filteredData).forEach(key => {
//   const mob = filteredData[key];

//   if(mob.battles.length > 0) {
//     filteredData[key].battles.forEach((key, value) => {
//       delete filteredData[key].battles[key]._id;
//     })
//   }
// })


async.forEach(Object.keys(output), function (key, next) {
  const newBeast = new Beast(output[key]);

  newBeast.save().then(() => next());
}, function (err) {
  console.log('iterating done');
});

// writeJsonFile('foo.json', filteredData).then(() => {
//     console.log('done');
// });