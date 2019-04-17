require('dotenv').config();
const mongoose = require('mongoose');
const async = require('async');

const userSchema = require('../../schemes/user');

const User = mongoose.model('User', userSchema);

mongoose.connect(process.env.MONGODB_URI);

let total = 0;
let processed = 0;

console.log('===START===');

const existingButton = {
  index: 11,
  label: '📯Входы в подземелья',
  command: '/dungeon_locations',
};

const newButton = {
  index: 11,
  label: '🌋Входы в подземелья',
  command: '/dungeon_locations',
};

User.find().then((users) => {
  total = users.length;

  async.forEach(users, (user, next) => {
    if (user.settings) {
      if (user.settings.buttons) {
        user.settings.buttons = user.settings.buttons.map(({
          index,
          label,
          command,
          ...rest
        }) => {
          if (
            index === existingButton.index
            && label === existingButton.label
            && command === existingButton.command
          ) {
            return {
              index: newButton.index,
              label: newButton.label,
              command: newButton.command,
              ...rest,
            };
          }

          return {
            index,
            label,
            command,
            ...rest,
          };
        });

        user.save().then(() => {
          processed += 1;
          console.log(`${processed}/${total}`);

          next();
        });
      } else {
        next();
      }
    } else {
      next();
    }
  }, () => {
    mongoose.disconnect();
    console.log('===END===');
  });
});
