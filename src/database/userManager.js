const _ = require('underscore');
const comparePips = require('./utils/comparePips');

const userManager = User => ({
    create: ({telegramData, pipData}) => {
        return new Promise((resolve, reject) => {
            User.findOne({
                'telegram.firstName': telegramData.first_name,
                'telegram.id': telegramData.id,
                $or: [
                    {'telegram.userName': telegramData.username},
                    {'telegram.userNamesHistory': telegramData.username}
                ]
            }).then(databaseUser => {
                if(databaseUser !== null) {
                    return resolve({
                        ok: false,
                        status: 'USER_ALREADY_EXISTS'
                    });
                }
            });

            const newUser = new User({
                telegram: {
                    firstName: telegramData.first_name,
                    id: telegramData.id,
                    userName: telegramData.username,
                    userNamesHistory: [telegramData.username]
                },
                pip: pipData,
                history: {
                    pip: [pipData]
                }
            });

            newUser.save().then(databaseUser => {
                return resolve({
                    ok: true,
                    reason: 'USER_CREATED',
                    data: databaseUser.toJSON()
                });
            });
        });
    },
    update: ({telegramData, pipData}) => {
        return new Promise((resolve, reject) => {
            User.findOne({'telegram.id': telegramData.id}).then(databaseUser => {
                if(databaseUser === null) {
                    return resolve({
                        ok: false,
                        reason: 'USER_NOT_FOUND'
                    });
                }

                if (databaseUser.pip.timeStamp > pipData.timeStamp) {
                    return resolve({
                        ok: false,
                        reason: 'PIP_OUTDATED'
                    });
                }

                if (!comparePips(pipData, databaseUser.pip)) {
                    return resolve({
                        ok: false,
                        reason: 'PIP_VALIDATION_FAILED'
                    });
                }

                databaseUser.pip = pipData;
                databaseUser.history.pip.push(pipData);

                // TODO: Verify
                if(databaseUser.telegram.username !== telegramData.username) {
                    databaseUser.telegram.username = telegramData.username;

                    if(!_.contains(databaseUser.telegram.userNamesHistory, telegramData.username)) {
                        databaseUser.telegram.userNamesHistory.push(telegramData.username);
                    }
                }

                databaseUser.save().then(databaseUser => {
                    return resolve({
                        ok: true,
                        reason: 'USER_UPDATED',
                        data: databaseUser.toJSON()
                    });
                });
            });
        });
    },
    findByTelegramId: id => {
        return new Promise((resolve, reject) => {
            User.findOne({'telegram.id': id}).then(databaseUser => {
                if(databaseUser === null) {
                    return resolve({
                        ok: false,
                        reason: 'USER_NOT_FOUND'
                    });
                }

                const {pip, points} = databaseUser.toJSON();

                return resolve({
                    ok: true,
                    reason: 'USER_FOUND',
                    data: {pip, points}
                });
            });
        });
    },
    addPoints: (id, points) => {
        return new Promise((resolve, reject) => {
            User.findOne({'telegram.id': id}).then(databaseUser => {
                if(databaseUser === null) {
                    return resolve({
                        ok: false,
                        reason: 'USER_NOT_FOUND'
                    });
                }

                if (points <= 0) {
                    return resolve({
                        ok: false,
                        reason: 'INCORECT_POINTS_VALUE'
                    });
                } else {
                    databaseUser.points.score += points;

                    databaseUser.save().then(databaseUpdatedUser => {
                        return resolve({
                            ok: true,
                            reason: 'USER_FOUND',
                            data: databaseUpdatedUser.toJSON().points.score
                        });
                    })
                }


            });
        });
    },
    leaderboard: (name, data) => {
        // Usage: leaderboard('Lawson', x);
        const sorted = _.sortBy(data, data => -data.points.score);

        const userIndex = _.findIndex(sorted, user => user.telegram.userName === name) + 1;

        const topTen = sorted.slice(0,10);

        const pastOutput = (index) => {
          if(index > 10) {
            const user = sorted[userIndex - 1];
            let reply = '\n========================\n';
            if(user.telegram.userName === name) {
              reply +=`${index}. <b>${user.telegram.userName}</b> - ${Math.floor(user.points.score)}`;
            } else {
              reply +=`${index}. ${user.telegram.userName} - ${Math.floor(user.points.score)}`;
            }

            return reply;
          }

          return '';
        }

        return topTen.map((user, index) => {
          const place = index + 1;
          const getMedal = position => {
            switch(position) {
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
          }

            if(user.telegram.userName === name) {
            return `${place}. ${getMedal(place)}<b>${user.telegram.userName}</b> - ${Math.floor(user.points.score)}`;
            }

            return `${place}. ${getMedal(place)}${user.telegram.userName} - ${Math.floor(user.points.score)}`;

        }).join('\n') + pastOutput(userIndex);
    }

});

module.exports = userManager;