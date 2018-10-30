require('dotenv').config({ path: '../../.env' });
const mongoose = require('mongoose');
const async = require('async');

const userSchema = require('../../schemes/user');

const User = mongoose.model('User', userSchema);

mongoose.connect('mongodb://localhost/wwa');

const factions = {};

User.find().then((users) => {
  console.log('===START===');
  async.forEach(users, (user, next) => {
    if (factions[user.pip.faction]) {
      factions[user.pip.faction] += 1;
      next();
    } else {
      factions[user.pip.faction] = 1;
      next();
    }
  }, () => {
    Object.keys(factions).forEach((faction) => {
      console.log(`${faction} - ${factions[faction]} юзеров`);
    });
    mongoose.disconnect();
  });
});
