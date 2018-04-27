require('dotenv').config();
const TeleBot = require('telebot');
const program = require('commander');

const parsePip = require('./src/parsePip');
const calculateUpgrade = require('./src/calculateUpgrade');

const upgradeAmountValidation = require('./src/utils/upgradeAmountValidation');

const config = require('./package.json');

program
    .version('0.1.0')
    .option('-D, --dev', 'Running bot with test token')
    .option('-P, --prod', 'Running bot with produciton token')
    .parse(process.argv);

const sessions = {};

const WAIT_FOR_SKILL = 'WAIT_FOR_SKILL';
const WAIT_FOR_DISTANCE = 'WAIT_FOR_DISTANCE';
const WAIT_FOR_LEVELS = 'WAIT_FOR_LEVELS';
const WAIT_FOR_RESPONSE = 'WAIT_FOR_RESPONSE';
const WAIT_FOR_START = 'WAIT_FOR_START';

const states = {
    WAIT_FOR_SKILL,
    WAIT_FOR_DISTANCE,
    WAIT_FOR_LEVELS,
    WAIT_FOR_RESPONSE,
    WAIT_FOR_START
};

const sessionAbort = (msg) => {
    const replyMarkup = bot.keyboard([
        [buttons.sessionAbortYes.label, buttons.sessionAbortNo.label]
    ], {
        resize: true
    });

    return bot.sendMessage(msg.from.id, 'Ты хочешь обнулить данные своего пип-боя ?', {
        replyMarkup
    });
}

const askAmountOfLevels = (msg) => {
    const replyMarkup = bot.keyboard([
        [
            buttons.amountOfLevelsTen.label,
            buttons.amountOfLevelsTwenty.label,
            buttons.amountOfLevelsThirty.label
        ],
        [
            buttons.amountOfLevelsFourty.label,
            buttons.amountOfLevelsFifty.label,
            buttons.amountOfLevelsSixty.label
        ],
        [
            buttons.amountOfLevelsMAX.label
        ]
    ], {
        resize: true
    });

    return bot.sendMessage(msg.from.id, `
Выбери на сколько уровней ты хочешь прокачать *${sessions[msg.from.id].upgradeSkill}*
\`Либо напиши своё количество (например: 17)\`
`, {
        replyMarkup,
        parseMode: 'markdown'
    });
}

const askReachableKm = (msg) => {
    const replyMarkup = bot.keyboard([
        [
            buttons['reachableKm20'].label,
            buttons['reachableKm30'].label,
            buttons['reachableKm40'].label
        ],
        [

            buttons['reachableKm50'].label,
            buttons['reachableKm60'].label,
            buttons['reachableKm70'].label
        ]
    ], {
        resize: true
    });

    return bot.sendMessage(msg.from.id, "Выбери до какого километра ты ходишь (при этом оставаясь в живих)?\n"+
"`Либо напиши своё количество (например: 28)`", {
        replyMarkup,
        parseMode: 'markdown'
    });
}

const getEffort = (msg, bot) => {
    if (sessions[msg.from.id].state == states.WAIT_FOR_START) {
        return false;
    }

    sessions[msg.from.id].state = states.WAIT_FOR_RESPONSE;

    sessions[msg.from.id].amountToUpgrade = msg.text;

    const effort = calculateUpgrade(sessions[msg.from.id]);

    bot.sendMessage(msg.from.id, effort, {
        replyMarkup: "hide",
        parseMode: 'markdown'
    });

    console.log(`
------------------------------------------
[REPLY]
User: ${sessions[msg.from.id].pip.name} | ${sessions[msg.from.id].pip.faction}
Reachable distance: ${sessions[msg.from.id].reachableKm}
Amout to upgrade: ${sessions[msg.from.id].amountToUpgrade}
`);

    sessions[msg.from.id].state = states.WAIT_FOR_START;
}

const seedSession = id => {
    sessions[id] = {
        pip: null,
        state: states.WAIT_FOR_START
    };
};

const buttons = {
    sessionAbortYes: {
        label: "Да",
        command: "/resetSession"
    },
    sessionAbortNo: {
        label: "Нет",
        command: "/resetSessionAbort"
    },
    skillSelectHealth: {
        label: "❤ Живучесть",
        command: "/levelUpHealth"
    },
    skillSelectStrength: {
        label: "💪 Сила",
        command: "/levelUpStrength"
    },
    skillSelectAccuracy: {
        label: "🔫 Меткость",
        command: "/levelUpAccuracy"
    },
    skillSelectCharisma: {
        label: "🗣 Харизма",
        command: "/levelUpCharisma"
    },
    skillSelectAgility: {
        label: "🤸‍♀️ Ловкость",
        command: "/levelUpAgility"
    },
    amountOfLevelsTen: {
        label: "+10",
        command: "/upgradeSkill"
    },
    amountOfLevelsTwenty: {
        label: "+20",
        command: "/upgradeSkill"
    },
    amountOfLevelsThirty: {
        label: "+20",
        command: "/upgradeSkill"
    },
    amountOfLevelsFourty: {
        label: "+40",
        command: "/upgradeSkill"
    },
    amountOfLevelsFifty: {
        label: "+50",
        command: "/upgradeSkill"
    },
    amountOfLevelsSixty: {
        label: "+60",
        command: "/upgradeSkill"
    },
    amountOfLevelsMAX: {
        label: "МАКСИМАЛОЧКА",
        command: "/upgradeSkill"
    },
    reachableKm20: {
        label: "20км",
        command: "/reachableKm"
    },
    reachableKm30: {
        label: "30км",
        command: "/reachableKm"
    },
    reachableKm40: {
        label: "40км",
        command: "/reachableKm"
    },
    reachableKm50: {
        label: "50км",
        command: "/reachableKm"
    },
    reachableKm60: {
        label: "60км",
        command: "/reachableKm"
    },
    reachableKm70: {
        label: "70+ км",
        command: "/reachableKm"
    },
};

const getToken = () => {
    if (program.dev) {
        console.log('RUNNING IN TEST MODE');
        return process.env.BOT_TOKEN_TEST;
    } else if (program.prod) {
        console.log('RUNNING IN PRODUCTION MODE');
        return process.env.BOT_TOKEN;
    }

    throw new Error('Please, specify bot token mode "--dev" for development and "--prod" production');
};

const levelsToMax = (pip, skillToUpgrade, cap) => {
    const skillMap = {
        "❤ Живучесть": "health",
        "💪 Сила": "strength",
        "🔫 Меткость": "precision",
        "🗣 Харизма": "charisma",
        "🤸‍♀️ Ловкость": "agility"
    };

    const currentSkillLevel = pip[skillMap[skillToUpgrade]];
    const amountToUpgrade = cap - currentSkillLevel;

    return amountToUpgrade;
}

const bot = new TeleBot({
    token: getToken(),
    usePlugins: ['namedButtons'],
    polling: {
        interval: 100, // How often check updates (in ms).
        limit: 500, // Limits the number of updates to be retrieved.
        retryTimeout: 1000 // Reconne   cting timeout (in ms).
    },
    pluginConfig: {
        namedButtons: {
            buttons
        }
    }
});

bot.on('/start', (msg) => {
    if (sessions[msg.from.id] === undefined) {
        seedSession(msg.from.id);
    }

    return bot.sendMessage(
        msg.from.id, 'Пожалуйста, перешли мне свой пип-бой :3', {
            replyMarkup: 'hide'
        }
    );
});

bot.on('/resetSession', (msg) => {
    sessions[msg.from.id] = {
        pip: null,
        state: null
    };

    bot.sendMessage(
        msg.from.id, 'Данные сброшены - можешь скинуть свой пип-бой снова.', {
            replyMarkup: 'hide'
        }
    );
});

bot.on('/resetSessionAbort', (msg) => {
    bot.sendMessage(
        msg.from.id, 'Cброс данных отменён.', {
            replyMarkup: 'hide'
        }
    );
});

bot.on('forward', (msg) => {
    if (msg.from.is_bot) {
        return;
    }

    if (sessions[msg.from.id] === undefined) {
        seedSession(msg.from.id);
    }

    const pip = parsePip(msg);

    if (typeof pip === 'object') {
        sessions[msg.from.id].pip = pip;
        sessions[msg.from.id].state = states.WAIT_FOR_SKILL;

        const replyMarkup = bot.keyboard([
            [buttons.skillSelectStrength.label, buttons.skillSelectAccuracy.label, buttons.skillSelectAgility.label],
            [buttons.skillSelectHealth.label, buttons.skillSelectCharisma.label]
        ], {
            resize: true
        });

        return bot.sendMessage(msg.from.id, 'Что качать будешь?', {
            replyMarkup
        });
    }

    return msg.reply.text('Форвардни настоящий пип');
});

bot.on('/help', (msg) => {
    msg.reply.text(`
Я буду помогать тебе считать сколько тебе нужно усилий потратить для прокачки навыка.
Что бы начать со мной роботу - перешли мне свой пип-бой!
    `, {
        replyMarkup: 'hide'
    });
});

bot.on([
    '/levelUpHealth',
    '/levelUpStrength',
    '/levelUpAccuracy',
    '/levelUpCharisma',
    '/levelUpAgility'
], msg => {
    sessions[msg.from.id].upgradeSkill = msg.text;
    sessions[msg.from.id].state = states.WAIT_FOR_DISTANCE;

    askReachableKm(msg);
});

bot.on('/reachableKm', msg => {
    sessions[msg.from.id].reachableKm = msg.text;
    sessions[msg.from.id].state = states.WAIT_FOR_LEVELS;

    askAmountOfLevels(msg);
});

bot.on('/upgradeSkill', msg => {
    if(msg.text === 'МАКСИМАЛОЧКА') {
        const pip = sessions[msg.from.id].pip;
        const skillToUpgrade = sessions[msg.from.id].upgradeSkill;

        const newText = levelsToMax(pip, skillToUpgrade, 1100);
        msg.text = newText;

        getEffort(msg, bot);
    }

    getEffort(msg, bot);
});

bot.on('/version', msg => msg.reply.text(config.version))

bot.on('/debug', msg => {
    return bot.sendMessage(msg.from.id, `
    _За инфу о мобах, благодаря которой эта логика стала возможной огромное спасибо создателю @WastelandWarsHelper - @radueff_
`, {
    parseMode: 'markdown'
    });
})

bot.on(/^\d+$/, msg => {
    switch (sessions[msg.from.id].state) {
        case states.WAIT_FOR_DISTANCE:
            const reachableKm = Number(msg.text);

            if(reachableKm > 100) {
                msg.reply.text('Бля, ну не гони - давай чуть более реалистичней, окей ?)')
            } else if (reachableKm <= 100) {
                sessions[msg.from.id].reachableKm = reachableKm;
                sessions[msg.from.id].state = states.WAIT_FOR_LEVELS;

                askAmountOfLevels(msg);
            }

            break;
        case states.WAIT_FOR_LEVELS:
            const upgradeAmount = Number(msg.text);
            const pip = sessions[msg.from.id].pip;
            const skillToUpgrade = sessions[msg.from.id].upgradeSkill;

            if (upgradeAmountValidation(pip, skillToUpgrade, upgradeAmount, 1100)) {
                getEffort(msg, bot);
            } else {
                msg.reply.text('Чёто дохуя получилось, попробуй число поменьше.')
            }

            break;
    }
})

bot.start();