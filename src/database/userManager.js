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
                    userNamesHistory: [telegramData.first_name]
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

                if(databaseUser.telegram.username !== telegramData.user_name) {
                    databaseUser.telegram.username = telegramData.user_name;

                    if(!_.contains(databaseUser.telegram.userNamesHistory, telegramData.user_name)) {
                        databaseUser.telegram.userNamesHistory.push(telegramData.user_name);
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

                return resolve({
                    ok: true,
                    reason: 'USER_FOUND',
                    data: databaseUser.toJSON().pip
                });
            });
        });
    },
});

module.exports = userManager;