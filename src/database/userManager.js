const userManager = User => ({
    create: ({telegramData, pipData}) => {
        return new Promise((resolve, reject) => {
            const newUser = new User({

            });


            newUser.save().then(user => {
                if(user === null) {
                    resolve(null);
                }

                resolve(user.toJSON());
            });
        });
    },
    update: ({id, telegramData, pipData}) => {
        return new Promise((resolve, reject) => {
            User.find({'telegram.id': id}).then(user => {
                // TODO: Detect is pip outdated
                // TODO: Detect is skills decreased
                // TODO: Detect is skills upgraded
                // TODO: Update pip values
                // TODO: Update pip history
                // TODO: Detect telegram username change and update if necessary


                if(user === null) {
                    resolve(null);
                }

                resolve(user.toJSON());
            });
        });
    },
    findByTelegramId: id => {
        return new Promise((resolve, reject) => {
            User.find({'telegram.id': id}).then(user => {
                if(user === null) {
                    resolve(null);
                }

                resolve(user.toJSON());
            });
        });
    },
});