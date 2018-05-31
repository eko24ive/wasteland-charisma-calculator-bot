const userManager = User => ({
    findByTelegramId: id => {
        return new Promise((resolve, reject) => {
            User.find({'telegram.id': id}).then(user => {
                if(user === null) {
                    resolve(null);
                }

                resolve(user.toJSON);
            });
        });
    }
});