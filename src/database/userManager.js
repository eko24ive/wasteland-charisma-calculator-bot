const _ = require('underscore');

const comparePips = require('./utils/comparePips');
const userDefaults = require('../schemes/defaults/user');

const userManager = User => ({
  create: ({ telegramData, pipData, points = 0 }) => new Promise((resolve) => {
    User.findOne({
      'telegram.id': telegramData.id,
    }).then(async (databaseUser) => {
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
        points: {
          ...userDefaults.points,
          ...{
            points,
          },
        },
        history: {
          pip: pipData ? [pipData] : userDefaults.history.pip,
        },
        settings: userDefaults.settings,
      });

      const newDatabaseUser = await newUser.save();

      return {
        ok: true,
        reason: 'USER_CREATED',
        data: newDatabaseUser.toJSON(),
      };
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
  update: ({ telegramData, pipData, settings }) => new Promise((resolve) => {
    User.findOne({ 'telegram.id': telegramData.id }).then((databaseUser) => {
      if (databaseUser === null) {
        return resolve({
          ok: false,
          reason: 'USER_NOT_FOUND',
        });
      }

      if (pipData) {
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
      }

      if (settings) {
        databaseUser.settings = settings;
      }

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

      if (pip === undefined) {
        return resolve({
          ok: false,
          reason: 'PIP_IS_EMPTY',
        });
      }

      return resolve({
        ok: true,
        reason: 'USER_FOUND',
        data: { pip, points },
      });
    });
  }),
  addPoints({ id, points, telegramData }) {
    return new Promise((resolve) => {
      User.findOne({ 'telegram.id': id }).then((databaseUser) => {
        if (databaseUser === null) {
          return this.create({ telegramData, pipData: undefined, points }).then(() => resolve({
            ok: true,
            reason: 'USER_FOUND',
          }));
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
    });
  },
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
  getOrCreateSettings: function _getOrCreateSettings({ id, telegramData }) {
    return new Promise((resolve) => {
      User.findOne({ 'telegram.id': id }).then(async (databaseUser) => {
        if (databaseUser === null) {
          return this.create({ telegramData, pipData: undefined }).then(({
            data,
          }) => resolve({
            ok: true,
            reason: 'USER_FOUND',
            data: data.settings,
          }));
        }

        const { settings } = databaseUser.toJSON();

        if (settings === undefined || Object.keys(settings).map(key => settings[key]).some(entry => entry.length === 0)) {
          await this.update({
            telegramData,
            pipData: undefined,
            settings: userDefaults.settings,
          }).then(({ data }) => resolve({
            ok: true,
            reason: 'USER_FOUND',
            data: data.settings,
          }));
        }

        return resolve({
          ok: true,
          reason: 'USER_FOUND',
          data: settings,
        });
      });
    });
  },
  updateSettings: ({ id, settings }) => new Promise((resolve) => {
    User.findOne({ 'telegram.id': id }).then((databaseUser) => {
      if (databaseUser === null) {
        return resolve({
          ok: false,
          result: 'USER_NOT_FOUND',
        });
      }

      databaseUser.settings = settings;

      databaseUser.save().then(updatedDatabaseUser => resolve({
        ok: true,
        reason: 'USER_UPDATED',
        data: updatedDatabaseUser.toJSON(),
      }));
    });
  }),
});

module.exports = userManager;
