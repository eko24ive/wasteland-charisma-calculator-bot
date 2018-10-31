const _ = require('underscore');
const comparePips = require('./utils/comparePips');

const userManager = User => ({
  create: ({ telegramData, pipData }) => new Promise((resolve) => {
    User.findOne({
      'telegram.id': telegramData.id,
    }).then((databaseUser) => {
      if (databaseUser !== null) {
        return resolve({
          ok: false,
          status: 'USER_ALREADY_EXISTS',
        });
      }
      const newUser = new User({
        telegram: {
          firstName: telegramData.first_name,
          id: telegramData.id,
          userName: telegramData.username,
          userNamesHistory: [telegramData.username],
        },
        pip: pipData,
        history: {
          pip: [pipData],
        },
      });

      newUser.save().then(newDatabaseUser => resolve({
        ok: true,
        reason: 'USER_CREATED',
        data: newDatabaseUser.toJSON(),
      }));

      return false;
    });
  }),
  delete: id => new Promise((resolve) => {
    User.findOne({ 'telegram.id': id }).then((databaseUser) => {
      if (databaseUser === null) {
        return resolve({
          ok: false,
          reason: 'USER_NOT_FOUND',
        });
      }

      databaseUser.remove().then(deletedDatabaseUser => resolve({
        ok: true,
        reason: 'USER_DELETED',
        data: deletedDatabaseUser.toJSON(),
      }));

      return false;
    });
  }),
  update: ({ telegramData, pipData }) => new Promise((resolve) => {
    User.findOne({ 'telegram.id': telegramData.id }).then((databaseUser) => {
      if (databaseUser === null) {
        return resolve({
          ok: false,
          reason: 'USER_NOT_FOUND',
        });
      }

      if (!_.isEmpty(databaseUser.toJSON().pip)) {
        if (databaseUser.pip.timeStamp > pipData.timeStamp) {
          return resolve({
            ok: false,
            reason: 'PIP_OUTDATED',
          });
        }

        if (!comparePips(pipData, databaseUser.pip)) {
          return resolve({
            ok: false,
            reason: 'PIP_VALIDATION_FAILED',
          });
        }
      }

      databaseUser.pip = pipData;
      databaseUser.history.pip.push(pipData);

      // TODO: Verify
      if (databaseUser.telegram.username !== telegramData.username) {
        databaseUser.telegram.username = telegramData.username;

        if (!_.contains(databaseUser.telegram.userNamesHistory, telegramData.username)) {
          databaseUser.telegram.userNamesHistory.push(telegramData.username);
        }
      }

      databaseUser.save().then(updatedDatabaseUser => resolve({
        ok: true,
        reason: 'USER_UPDATED',
        data: updatedDatabaseUser.toJSON(),
      }));

      return false;
    });
  }),
  findByTelegramId: id => new Promise((resolve) => {
    User.findOne({ 'telegram.id': id }).then((databaseUser) => {
      if (databaseUser === null) {
        return resolve({
          ok: false,
          reason: 'USER_NOT_FOUND',
        });
      }

      const { pip, points } = databaseUser.toJSON();

      return resolve({
        ok: true,
        reason: 'USER_FOUND',
        data: { pip, points },
      });
    });
  }),
  addPoints: (id, points) => new Promise((resolve) => {
    User.findOne({ 'telegram.id': id }).then((databaseUser) => {
      if (databaseUser === null) {
        return resolve({
          ok: false,
          reason: 'USER_NOT_FOUND',
        });
      }

      if (points <= 0) {
        return resolve({
          ok: false,
          reason: 'INCORECT_POINTS_VALUE',
        });
      }
      databaseUser.points.score += points;

      databaseUser.save().then(databaseUpdatedUser => resolve({
        ok: true,
        reason: 'USER_FOUND',
        data: databaseUpdatedUser.toJSON().points.score,
      }));

      return false;
    });
  }),
  leaderboard: id => new Promise((resolve) => {
    User.find().sort({
      'points.score': -1,
    }).then((users) => {
      if (users.length === 0) {
        return resolve({
          ok: false,
          reason: 'NO_USERS_FOUND',
        });
      }
      // const sorted = _.sortBy(data, data => -data.points.score);


      const userIndex = _.findIndex(users, user => user.telegram.id === id);

      const topTen = users.slice(0, 10);

      const pastOutput = (index) => {
        if ((index + 1) > 10 && userIndex !== -1) {
          const user = users[userIndex];
          let reply = '\n========================\n';

          if (user.telegram.id === id) {
            reply += `${index + 1}. <b>${user.telegram.userName}</b> - ${Math.floor(user.points.score)}`;
          } else {
            reply += `${index + 1}. ${user.telegram.userName} - ${Math.floor(user.points.score)}`;
          }

          return reply;
        } if (userIndex === -1) {
          return '\n\nУ меня ещё нет твоего профиля - скинь свой пип-бой и начни кидать форварды боту что бы получить очки!';
        }

        return '';
      };

      const leaderboard = topTen.map((user, index) => {
        const place = index + 1;
        const getMedal = (position) => {
          switch (position) {
            case 1:
              return '🥇';
            case 2:
              return '🥈';
            case 3:
              return '🥉';
            case 4:
            case 5:
            case 6:
            case 7:
            case 8:
            case 9:
            case 10:
              return '🏅';
            default:
              return '';
          }
        };

        if (user.telegram.id === id) {
          return `${place}. ${getMedal(place)}<b>${user.telegram.userName}</b> - ${Math.floor(user.points.score)}`;
        }

        return `${place}. ${getMedal(place)}${user.telegram.userName} - ${Math.floor(user.points.score)}`;
      }).join('\n') + pastOutput(userIndex);


      return resolve({
        ok: true,
        reason: 'LEADERBOARD_GENERATED',
        data: leaderboard,
      });
    });
  }),
});

module.exports = userManager;
