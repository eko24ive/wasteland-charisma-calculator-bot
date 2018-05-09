require('dotenv').config();
var uristring = process.env.MONGODB_URI;


const mongoose = require('mongoose');
const _ = require('underscore');
const TeleBot = require('telebot');
const program = require('commander');
const moment = require('moment');


const beastSchema = require('./src/schemes/beast');
const locationSchema = require('./src/schemes/location');
const userSchema = require('./src/schemes/user');


const parsePip = require('./src/parsers/parsePip');
const beastParser = require('./src/parsers/parseBeast');
const parseLocation = require('./src/parsers/parseLocation');
const parseFlee = require('./src/parsers/parseFlee');
const parseDeathMessage = require('./src/parsers/parseDeathMessage');
const parseBeastFaced = require('./src/parsers/parseBeastFaced');


const calculateUpgrade = require('./src/calculateUpgrade');

const upgradeAmountValidation = require('./src/utils/upgradeAmountValidation');

const processForwards = require('./src/utils/processForwards');

const Beast = mongoose.model('Beas', beastSchema);
const Location = mongoose.model('Location', locationSchema);
const User = mongoose.model('User', locationSchema);

mongoose.connect(uristring);


const {
    matcher,
    regExpSetMatcher
} = require('./src/utils/matcher');
const regexps = require('./src/regexp/regexp');

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
const WAIT_FOR_FORWARD_END = 'WAIT_FOR_FORWARD_END';
const WAIT_FOR_START = 'WAIT_FOR_START';
const WAIT_FOR_PIP_FORWARD = 'WAIT_FOR_PIP_FORWARD';
const WAIT_FOR_DATA_TO_PROCESS = 'WAIT_FOR_DATA_TO_PROCESS';

const states = {
    WAIT_FOR_SKILL,
    WAIT_FOR_DISTANCE,
    WAIT_FOR_LEVELS,
    WAIT_FOR_RESPONSE,
    WAIT_FOR_START,
    WAIT_FOR_FORWARD_END,
    WAIT_FOR_PIP_FORWARD,
    WAIT_FOR_DATA_TO_PROCESS
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
};

const journeyForwardEndKeyboard = (msg) => {
    const replyMarkup = bot.keyboard([
        [
            buttons['journeyForwardEnd'].label
        ]
    ], {
        resize: true
    });

    if (sessions[msg.from.id] === undefined) {
        createSession(msg.from.id);
    }

    sessions[msg.from.id].state = states.WAIT_FOR_START;

    return bot.sendMessage(msg.from.id, `

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

    return bot.sendMessage(msg.from.id, "Выбери до какого километра ты ходишь (при этом оставаясь в живих)?\n" +
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
        replyMarkup: defaultKeyboard,
        parseMode: 'markdown'
    });

    console.log(`
------------------------------------------
[REPLY]
User: ${sessions[msg.from.id].pip.name} | ${sessions[msg.from.id].pip.faction} | ${msg.from.username}
Reachable distance: ${sessions[msg.from.id].reachableKm}
Amout to upgrade: ${sessions[msg.from.id].amountToUpgrade}
`);

    sessions[msg.from.id].state = states.WAIT_FOR_START;
}

const createSession = id => {
    sessions[id] = {
        pip: null,
        state: states.WAIT_FOR_START,
        data: [],
        dataPips: []
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
    journeyForwardStart: {
        label: "Скинуть лог 🏃",
        command: "/journeyforwardstart"
    },
    journeyForwardEnd: {
        label: "Стоп 🙅‍♂️",
        command: "/journeyforwardend"
    },
    journeyForwardCancel: {
        label: "Назад ↩️",
        command: "/journeyforwardcancel"
    }
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

const defaultKeyboard = bot.keyboard([
    [
        buttons['journeyForwardStart'].label
    ]
], {
    resize: true
});

bot.on('/start', (msg) => {
    if (sessions[msg.from.id] === undefined) {
        createSession(msg.from.id);
    };

    return bot.sendMessage(
        msg.from.id,
        `
Привет, меня зовут «Скилокачатор» - я могу тебе помочь узнать информацию о том сколько нужно потратить заходов и крышек для прокачки твоих навыков.

Как только ты перешлёш мне свой *📟Пип-бой* ты сможешь выбрать какой навык ты хочешь прокачать и на сколько уровней - и я сделаю всю грязную работу/математику за тебя.

Если хочешь как «только так сразу»™ получать информацию о моих обновлениях - милости прошу на канал https://t.me/wwCharismaCalculator

Есть желание посоветовать крутой функционал или сообщить о баге - залетай в уютный(не очень) чат https://t.me/wwCharismaCalculatorChat

_Учти, что я ещё нахожусь в бета-режиме, и ты можешь наткнуться на большие и маленькие баги.
Но, не переживай - они будут пофикшены_
        `, {
            replyMarkup: defaultKeyboard,
            parseMode: 'markdown',
            webPreview: false
        }
    );
});

/* bot.on('/resetSession', (msg) => {
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
}); */

bot.on('forward', (msg) => {
    if (sessions[msg.from.id] === undefined) {
        createSession(msg.from.id);
    }

    if (sessions[msg.from.id].state === states.WAIT_FOR_PIP_FORWARD) {
        const pip = parsePip(msg);

        if (_.isObject(pip)) {
            data = pip;
            sessions[msg.from.id].dataPips.push(pip);
            dataType = 'pipboy';

            sessions[msg.from.id].data.push({
                data,
                dataType,
                date: msg.forward_date
            });

            msg.reply.text('Супер, я вижу твой пип - сейчас обработаю его вместе с твоими форвардами');

            processUserData(msg);
        } else {
            return msg.reply.text('Это не похоже на пип-бой. Если ты передумал его кидать - жми /skippipforward', {asReply: true});
        }

    } else if (sessions[msg.from.id].state === states.WAIT_FOR_FORWARD_END) {
        let data;
        let dataType;
        const isLocation = regExpSetMatcher(msg.text, {
            regexpSet: regexps.location
        });

        const isRegularBeast = regExpSetMatcher(msg.text, {
            regexpSet: regexps.regularBeast
        });

        /* const isDungeonBeast = regExpSetMatcher(msg.text, {
            regexpSet: regexps.dungeonBeast
        }); */

        const isFlee = regExpSetMatcher(msg.text, {
            regexpSet: regexps.flee
        });

        const isDeathMessage = regExpSetMatcher(msg.text, {
            regexpSet: regexps.deathMessage
        });

        /* const isDungeonBeastFaced = regExpSetMatcher(msg.text, {
            regexpSet: regexps.dungeonBeastFaced
        }); */

        const pip = parsePip(msg);

        /*         if (isDungeonBeastFaced) {
                    data = parseBeastFaced.parseDungeonBeastFaced(msg.text);
                    dataType = 'dungeonBeastFaced';
                } */

        /* if (isDungeonBeast) {
            data = beastParser.parseDungeonBeast(msg.text);
            dataType = 'dungeonBeast';
        } else */

        if (isFlee) {
            data = parseFlee(msg.text);
            dataType = 'flee';
        } else if (isDeathMessage) {
            data = parseDeathMessage(msg.text);
            dataType = 'deathMessage';
        } else if (isRegularBeast) {
            data = beastParser.parseRegularBeast(msg.text);
            dataType = 'regularBeast';
        } else if (isLocation) {
            data = parseLocation(msg.text);
            dataType = 'location';
        } else if (_.isObject(pip)) {
            data = pip;
            sessions[msg.from.id].dataPips.push(pip);
            dataType = 'pipboy';
        }


        // isDungeonBeast || 
        if (isRegularBeast || isLocation || isFlee || isDeathMessage || parseBeastFaced) {
            sessions[msg.from.id].data.push({
                data,
                dataType,
                date: msg.forward_date
            });
        }

    } else {


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
    }

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

bot.on('/locs_text', msg => {
    return msg.reply.text(`
8км - Безумный старик
11км - ⛓Старая шахта
13км -⚡️Купол Грома
15км - 🛤Ореол
19км - ⚠️Пещера Ореола
23км - 🚽Сточная труба
27км - 🏃🏿Белое гетто
29км -⚙️Открытое Убежище
30км - 🕎 Ядро
34км - 🦇Бэт-пещера
39км - 🦆Перевал Уткина
43км - 🚪Уютный подвальчик
45км - 🌁Высокий Хротгар
50км - 🔴Руины Гексагона
51км - 🛏Безопасный привал
56км - 🔬Научная лаборатория
69км - ⛩Храм Мудрости
74км - Чёрная Меза

Инфо взята из @trust_42 - https://t.me/trust_42/61
    `, {
        webPreview: false
    });
});

bot.on('/raids_text', msg => {
    return msg.reply.text(`
📦5 - Материалы (Старая фабрика)
🕳9 - Крышки (Завод "Ядер-Кола")
💊12 - Вещества (Тюрьма)
🍗16 - Еда (Склады)
🔹20 - Кварц (Датацентр)
❤️24 - Лечение (Госпиталь)
💡28 - Генераторы (Завод "Электрон")
💾32 - Микрочипы (Офисное здание)
🔩38 - Иридий (Иридиевые шахты)
🔗46 - Кубонит (Склад металла)

Инфо взята из @trust_42 - https://t.me/trust_42/57
    `, {
        webPreview: false
    });
});

bot.on('/upgradeSkill', msg => {
    if (msg.text === 'МАКСИМАЛОЧКА') {
        const pip = sessions[msg.from.id].pip;
        const skillToUpgrade = sessions[msg.from.id].upgradeSkill;

        const newText = levelsToMax(pip, skillToUpgrade, 1200);
        msg.text = newText;

        getEffort(msg, bot);
    }

    getEffort(msg, bot);
});

bot.on('/journeyforwardstart', msg => {
    if (sessions[msg.from.id] === undefined) {
        createSession(msg.from.id);
    }

    sessions[msg.from.id].state = states.WAIT_FOR_FORWARD_END;
    const replyMarkup = bot.keyboard([
        [
            buttons['journeyForwardEnd'].label,
            buttons['journeyForwardCancel'].label
        ]
    ], {
        resize: true
    });

    msg.reply.text(`
Хей, вижу ты хочешь поделиться со мной ценной информации с пустоши - отлично!
Ну что же кидай её сюда. 

Пожалуйста убедись что все сообщение были пересланы - Телеграм может немного притормаживать.
Ну а как закончишь - смело жми кнопку [\`Стоп 🙅‍♂️\`]!
    `, {
        replyMarkup,
        parseMode: 'markdown'
    })
});

const processUserData = (msg) => {
    sessions[msg.from.id].state = states.WAIT_FOR_DATA_TO_PROCESS;

    const {
        data,
        dataPips
    } = sessions[msg.from.id];

    const {
        reportData,
        updatesData
    } = processForwards(data, dataPips);

    if (reportData.recalculationRequired) {
        sessions[msg.from.id].state = states.WAIT_FOR_PIP_FORWARD;
        return msg.reply.text(`
Хей, я так и не увидел твоего пип-боя, можешь мне его дослать?
Если у тебя нет на это времени жми /skippipforward
        `);
    }

    const amountOfData = sessions[msg.from.id].data.length;

    console.log({reportData, updatesData});

    // try to find PIP of user
    // if PIP exist - try to apply it to given data
    // if not - request recent PIP
    // try to apply PIP to given data
    // if PIP not applyible throw error and update data which is not relies on PIP


    setTimeout(() => {
        msg.reply.text(`
Фух, я со всём справился - спасибо тебе огромное за эту информацию!
Теперь ты опять можешь пользоваться функционалом скилокачатор, либо если ты чего-то забыл докинуть - смело жми на \`[Скинуть лог 🏃]\`
Я насчитал ${amountOfData} данных!
`, {
            replyMarkup: defaultKeyboard,
            parseMode: 'markdown'
        });
    }, 1500);

    sessions[msg.from.id].data = [];
}

bot.on('/journeyforwardend', msg => {
    sessions[msg.from.id].state = states.WAIT_FOR_DATA_TO_PROCESS;

    msg.reply.text(`Перехожу в режим оброботки данных, подожди пожалуйста немного :3`, {
        replyMarkup: 'hide'
    });

    // console.log(JSON.stringify(sessions[msg.from.id].data));
    processUserData(msg);
});

bot.on('/journeyforwardcancel', msg => {
    createSession(msg.from.id);

    return msg.reply.text('Окей, теперь можешь кинуть пип-бой для помощи в прокачке скилов либо же перейти в меню  [`Скинуть лог 🏃`]', {
        replyMarkup: defaultKeyboard,
        parseMode: 'markdown'
    });
});

bot.on('/skippipforward', msg => {
    msg.reply.text('Окей, сейчас попробую обработать что смогу');

    processUserData(msg, {usePip: false});
})

bot.on('/version', msg => msg.reply.text(config.version))

bot.on('/debug', msg => {
    return bot.sendMessage(msg.from.id, '123');
})

bot.on(/^\d+$/, msg => {
    switch (sessions[msg.from.id].state) {
        case states.WAIT_FOR_DISTANCE:
            const reachableKm = Number(msg.text);

            if (reachableKm > 100) {
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

            if (upgradeAmountValidation(pip, skillToUpgrade, upgradeAmount, 1060)) {
                getEffort(msg, bot);
            } else {
                msg.reply.text('Чёто дохуя получилось, попробуй число поменьше.')
            }

            break;
    }
});

bot.start();