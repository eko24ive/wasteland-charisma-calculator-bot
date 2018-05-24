require('dotenv').config();
var uristring = process.env.MONGODB_URI;
var async = require('async');

const mongoose = require('mongoose');
const _ = require('underscore');
const TeleBot = require('telebot');
const program = require('commander');
const moment = require('moment-timezone');

const beastSchema = require('./src/schemes/beast');
const locationSchema = require('./src/schemes/location');
const giantScheme = require('./src/schemes/giant');
const userSchema = require('./src/schemes/user');


const parsePip = require('./src/parsers/parsePip');
const beastParser = require('./src/parsers/parseBeast');
const parseLocation = require('./src/parsers/parseLocation');
const parseFlee = require('./src/parsers/parseFlee');
const parseDeathMessage = require('./src/parsers/parseDeathMessage');
const parseBeastFaced = require('./src/parsers/parseBeastFaced');
const parseGiantFaced = require('./src/parsers/parseGiantFaced');
const parseGiant = require('./src/parsers/parseGiant');


const calculateUpgrade = require('./src/calculateUpgrade');
const upgradeAmountValidation = require('./src/utils/upgradeAmountValidation');
const processForwards = require('./src/utils/processForwards');
const getRanges = require('./src/utils/getRanges');
const tinyHash = require('./src/utils/tinyHash');

const routedBeastView = require('./src/views/routedBeastView');

const Beast = mongoose.model('Beast', beastSchema);
const Giant = mongoose.model('Giant', giantScheme);
const Location = mongoose.model('Location', locationSchema);
const User = mongoose.model('User', locationSchema);

const buttons = require('./src/ui/buttons');

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
const WAIT_FOR_BEAST_FACE_FORWARD = 'WAIT_FOR_BEAST_FACE_FORWARD';
const WAIT_FOR_DATA_TO_PROCESS = 'WAIT_FOR_DATA_TO_PROCESS';

const states = {
    WAIT_FOR_SKILL,
    WAIT_FOR_DISTANCE,
    WAIT_FOR_LEVELS,
    WAIT_FOR_RESPONSE,
    WAIT_FOR_START,
    WAIT_FOR_FORWARD_END,
    WAIT_FOR_PIP_FORWARD,
    WAIT_FOR_BEAST_FACE_FORWARD,
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
    if (sessions[msg.from.id].state === states.WAIT_FOR_START) {
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

    delete sessions[msg.from.id];
}

const createSession = id => {
    sessions[id] = {
        pip: null,
        state: states.WAIT_FOR_START,
        data: [],
        processDataConfig: {
            usePip: true,
            useBeastFace: true
        }
    };
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
    ],
    [
        buttons['showGiants'].label,
        buttons['showBeasts'].label,
        buttons['showDrones'].label
    ],
    [
        buttons['showAllLocations'].label,
        buttons['showRaidLocations'].label,
    ],
    [
        buttons['hallOfFame'].label,
        buttons['showHelp'].label
    ]
], {
    resize: true
});


const getBeastKeyboard = beastId => {
    return bot.inlineKeyboard([
        [
            bot.inlineButton('Инфо', {callback: `show_beast_page_info-${beastId}`}),
            bot.inlineButton('Лут', {callback: `show_beast_page_loot-${beastId}`}),
            bot.inlineButton('Бой', {callback: `show_beast_page_battles-${beastId}`}),
            bot.inlineButton('Оглушения', {callback: `show_beast_page_concussions-${beastId}`})
        ]
    ]);
}


bot.on('/start', (msg) => {
    if (sessions[msg.from.id] === undefined) {
        createSession(msg.from.id);
    };

    return bot.sendMessage(
        msg.from.id,
        `
Привет, меня зовут «*Wasteland Wars Assistant*», я - что-то на подобии "умной" энциклопедии.

Как только ты перешлёшь мне свой *📟Пип-бой* - я помогу тебе узнать сколько нужно сделать заходов и крышек для прокачки твоих навыков.
Если хочешь посмотреть что я знаю о мобе которого ты встретил - скинь форвард встречи с ним.

Если хочешь научить бота новому - нажими \`[Скинуть лог 🏃]\`, затем cкидывай все свои форварды, которые хочешь записать(я умею обрабатывать бои и побеги с монстрами и проход км) и в конце свежий пип. Затем жми \`[Стоп 🙅‍♂️]\` и жди моего ответа.


КАНАЛ С НОВОСТЯМИ @wwCharismaCalculator
ЧАТ БЫСТРОГО РЕАГИРОВАНИЯ @wwCharismaCalculatorChat

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
    if(msg.forward_from.id !== 430930191 && sessions[msg.from.id].state !== states.WAIT_FOR_FORWARD_END) {
        return msg.reply.text('Форварды принимаються только от @WastelandWarsBot', {
            asReply: true
        })
    }

    if (sessions[msg.from.id] === undefined) {
        createSession(msg.from.id);
    }

    if (sessions[msg.from.id].state === states.WAIT_FOR_PIP_FORWARD) {
        const pip = parsePip(msg);

        if (_.isObject(pip)) {
            data = pip;
            dataType = 'pipboy';




            msg.reply.text('Супер, я вижу твой пип - сейчас обработаю его вместе с твоими форвардами').then(res => {
                sessions[msg.from.id].data.push({
                    data,
                    dataType,
                    date: msg.forward_date
                });

                processUserData(msg, {
                    usePip: sessions[msg.from.id].processDataConfig.usePip,
                    useBeastFace: sessions[msg.from.id].processDataConfig.useBeastFace
                })
            });
        } else {
            return msg.reply.text(`
Это не похоже на пип-бой. Если ты передумал его кидать - жми /skippipforward

*Но тогда я проигнорирую битвы и побеги от мобов*
            `, {
                asReply: true
            });
        }
    } if (sessions[msg.from.id].state === states.WAIT_FOR_BEAST_FACE_FORWARD) {
        let data;
        let dataType;

        const isLocation = regExpSetMatcher(msg.text, {
            regexpSet: regexps.location
        });

        const isDungeonBeastFaced = regExpSetMatcher(msg.text, {
            regexpSet: regexps.dungeonBeastFaced
        });

        if (isDungeonBeastFaced) {
            data = parseBeastFaced.parseDungeonBeastFaced(msg.text);
            dataType = 'dungeonBeastFaced';
        } else if (isLocation) {
            data = parseLocation(msg.text);
            dataType = 'location';
        }

        if (isLocation || isDungeonBeastFaced) {
            sessions[msg.from.id].data.push({
                data,
                dataType,
                date: msg.forward_date
            });

            msg.reply.text('Супер, я вижу встречу с мобом - сейчас обработаю её вместе с твоими форвардами').then(res => processUserData(msg, {
                usePip: sessions[msg.from.id].processDataConfig.usePip,
                useBeastFace: sessions[msg.from.id].processDataConfig.useBeastFace
            }));
        } else {
            return msg.reply.text(`
Это не похоже на встречу моба. Если ты передумал её кидать - жми /skipbeastforward

*Но тогда я проигнорирую битву с этим мобом*
            `, {
                asReply: true
            });
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

        const isDungeonBeast = regExpSetMatcher(msg.text, {
            regexpSet: regexps.dungeonBeast
        });

        const isFlee = regExpSetMatcher(msg.text, {
            regexpSet: regexps.flee
        });

        const isDeathMessage = regExpSetMatcher(msg.text, {
            regexpSet: regexps.deathMessage
        });

        const isDungeonBeastFaced = regExpSetMatcher(msg.text, {
            regexpSet: regexps.dungeonBeastFaced
        });

        const pip = parsePip(msg);

        /* if (isDungeonBeast) {
            data = beastParser.parseDungeonBeast(msg.text);
            dataType = 'dungeonBeast';
        } */
        if (isDungeonBeastFaced) {
            data = parseBeastFaced.parseDungeonBeastFaced(msg.text);
            dataType = 'dungeonBeastFaced';
        } else if (isFlee) {
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
            dataType = 'pipboy';
        }


        // isDungeonBeast ||
        if (isRegularBeast || isLocation || isFlee || isDeathMessage || isDungeonBeastFaced || _.isObject(pip)) {
            sessions[msg.from.id].data.push({
                data,
                dataType,
                date: msg.forward_date
            });
        }
    } else if (
        sessions[msg.from.id].state !== states.WAIT_FOR_PIP_FORWARD &&
        sessions[msg.from.id].state !== states.WAIT_FOR_BEAST_FACE_FORWARD &&
        sessions[msg.from.id].state !== states.WAIT_FOR_FORWARD_END
    ) {
        const pip = parsePip(msg);

        const isRegularBeast = regExpSetMatcher(msg.text, {
            regexpSet: regexps.regularBeastFaced
        });

        const isGiantFaced = regExpSetMatcher(msg.text, {
            regexpSet: regexps.giantFaced
        });

        const isGiantFought = regExpSetMatcher(msg.text, {
            regexpSet: regexps.giantFought
        });

        const isDungeonBeastFaced = regExpSetMatcher(msg.text, {
            regexpSet: regexps.dungeonBeastFaced
        });

        if (_.isObject(pip)) {
            sessions[msg.from.id].pip = pip;
            sessions[msg.from.id].state = states.WAIT_FOR_SKILL;

            const replyMarkup = bot.keyboard([
                [buttons.skillSelectStrength.label, buttons.skillSelectAccuracy.label, buttons.skillSelectAgility.label],
                [buttons.skillSelectHealth.label, buttons.skillSelectCharisma.label]
            ], {
                resize: true
            });

            return msg.reply.text('Что качать будешь?', {
                replyMarkup
            });
        } else if (isGiantFaced) {
            const giant = parseGiantFaced(msg.text);

            Giant.findOne({
                name: giant.name,
                distance: giant.distance
            }).then(fGiant => {
                if (fGiant === null) {
                    const newGiant = new Giant({
                        distance: giant.distance,
                        name: giant.name,
                        health: {
                            current: giant.healthCurrent,
                            cap: giant.healthCap
                        },
                        forwardStamp: msg.forward_date
                    });

                    newGiant.save().then(res => {
                        return msg.reply.text('Спасибо за форвард! Я добавил его в базу!', {
                            asReply: true
                        });
                    })
                } else {
                    const time = Number(moment.tz(moment().valueOf(), "Europe/Moscow").format('X'));

                    if (fGiant.forwardStamp >= time) {
                        return msg.reply.text(`Прости, у меня есть более свежая иформация про *${giant.name}*`, {
                            asReply: true,
                            parseMode: 'markdown'
                        });
                    } else {
                        fGiant.health.current = giant.healthCurrent;
                        fGiant.health.cap = giant.healthCap;
                        fGiant.forwardStamp = time;

                        fGiant.save().then(res => {
                            return msg.reply.text(`Спасибо за форвард! Я обновил ${giant.name} в базе!`, {
                                asReply: true
                            });
                        })
                    }
                }
            })
        } else if (isGiantFought) {
            const giant = parseGiant(msg.text);

            Giant.findOne({
                name: giant.name
            }).then(fGiant => {
                if (fGiant === null) {
                    const newGiant = new Giant({
                        name: giant.name,
                        health: {
                            current: giant.healthCurrent,
                            cap: giant.healthCap
                        },
                        forwardStamp: msg.forward_date
                    });

                    newGiant.save().then(res => {
                        return msg.reply.text('Спасибо за форвард! Я добавил его в базу!', {
                            asReply: true
                        });
                    })
                } else {
                    if (fGiant.forwardStamp >= msg.forward_date) {
                        return msg.reply.text(`Прости, у меня есть более свежая иформация про *${giant.name}*`, {
                            asReply: true,
                            parseMode: 'markdown'
                        });
                    } else {
                        fGiant.health.current = giant.healthCurrent;
                        fGiant.health.cap = giant.healthCap;
                        fGiant.forwardStamp = msg.forward_date;

                        fGiant.save().then(res => {
                            return msg.reply.text(`Спасибо за форвард! Я обновил ${giant.name} в базе!`, {
                                asReply: true
                            });
                        })
                    }
                }
            });
        } else if (isRegularBeast) {
            const beast = parseBeastFaced.parseRegularBeastFaced(msg.text);

            routedBeastView(Beast, {
                name: beast.name,
                isDungeon: false
            }).then(({reply, beast}) => {
                if(reply !== false) {
                    const beastReplyMarkup = getBeastKeyboard(beast._id.toJSON());

                    return msg.reply.text(reply,{
                        replyMarkup: beastReplyMarkup,
                        parseMode: 'html'
                    }).catch(e => console.log(e));
                } else {
                    return msg.reply.text(`Прости, я никогда не слышал про этого моба :c`, {
                        asReply: true
                    });
                }
            }).catch(e => console.log(e));
        } else if (isDungeonBeastFaced) {
            const oBeast = parseBeastFaced.parseDungeonBeastFaced(msg.text);

            routedBeastView(Beast, {
                name: oBeast.name,
                isDungeon: true
            }).then(({reply, beast}) => {
                if(reply !== false) {
                    /* const beastReplyMarkup = getBeastKeyboard(beast._id.toJSON());

                    return msg.reply.text(reply,{
                        replyMarkup: beastReplyMarkup,
                        parseMode: 'html'
                    }).catch(e => console.log(e)); */
                    msg.reply.text(`Хей, у меня есть данные про *${oBeast.name}*, но я пока что не умею их выводить, прости :с`,{
                        asReply: true,
                        parseMode: 'markdown'
                    })
                } else {
                    return msg.reply.text(`Чёрт, я никогда не слышал про *${oBeast.name}*, прости :с`, {
                        asReply: true,
                        parseMode: 'markdown'
                    });
                }
            }).catch(e => console.log(e));
        }
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
[8 км] 🧙‍♂ Безумный старик
[11км] ⛰ Старая шахта
[13км] ⚡️ Купол Грома
[15км] 🛤 Ореол
[19км] ⚠️ Пещера Ореола
[23км] 🚽 Сточная труба
-26км- 🗿 Радиоактив. Голем
[27км] 🏃🏿 Белое гетто
[29км] ⚙️ Открытое Убежище
[30км] 🕎 Ядро
[34км] 🦇 Бэт-пещера
-36км- 🤖 Киборг Анклава
[39км] 🦆 Перевал Уткина
[43км] 🚪 Уютный подвальчик
-44км- 👹 Повелитель Пустоши
[45км] 🌁 Высокий Хротгар
[50км] 🔴 Руины Гексагона
[51км] 🛏 Безопасный привал
-55км- ☠️ Киберкоготь
[56км] 🔬 Научный комплекс
-64км- 🐺 Яо-Гигант
[69км] ⛩ Храм Мудрости
[74км] 👁‍🗨 Чёрная Меза
    `, {
        webPreview: false
    });
});

bot.on('/raids_text', msg => {
    return msg.reply.text(`
Каждый день проходит ТРИ рейда с промежутком в ВОСЕМЬ часов (по МСК):
<b>01:00</b> - <b>09:00</b> - <b>17:00</b>

<b>Старая фабрика</b>
[5км] 📦Материалы

<b>Завод "Ядер-Кола"</b>
[9км] 🕳Крышки

<b>Тюрьма</b>
[12км] 💊Вещества

<b>Склады</b>
[16км] 🍗Еда

<b>Датацентр</b>
[20км] 🔹Кварц

<b>Госпиталь</b>
[24км] ❤️Лечение

<b>Завод "Электрон"</b>
[28км] 💡Генераторы

<b>Офисное здание</b>
[32км] 💾Микрочипы

<b>Иридиевые шахты</b>
[38км] 🔩Иридий

<b>Склад металла</b>
[46км] 🔗Кубонит
    `, {
        webPreview: false,
        parseMode: 'html'
    });
});

bot.on('/upgradeSkill', msg => {
    if (msg.text === 'МАКСИМАЛОЧКА') {
        const pip = sessions[msg.from.id].pip;
        const skillToUpgrade = sessions[msg.from.id].upgradeSkill;

        const newText = levelsToMax(pip, skillToUpgrade, 1300);
        msg.text = newText;

        getEffort(msg, bot);
    } else {
        getEffort(msg, bot);
    }
});

bot.on('/journeyforwardstart', msg => {
    createSession(msg.from.id);

    let inlineReplyMarkup = bot.inlineKeyboard([
        [
            bot.inlineButton('📟 Перейти в игру.', {url: 'https://t.me/WastelandWarsBot'})
        ]
    ]);

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
Хей, вижу ты хочешь поделиться со мной ценной информацией с пустоши - отлично!
*Я принимаю следующую информацию*:
 - Бой с мобом
 - Побег от моба
 - Информацию о локации(километре)
    `, {
        replyMarkup,
        parseMode: 'markdown'
    }).then(() => {
        return msg.reply.text(`
*Я умею работать с данными только за один круг/вылазку - больше одной вылазки я пока обработать не смогу :с*

Пожалуйста убедись, что ты перешлёшь _все_ сообщения - Телеграм может немного притормаживать.
Ну а как закончишь - смело жми кнопку \`[Стоп 🙅‍♂️]\`!
            `, {
                replyMarkup: inlineReplyMarkup,
                parseMode: 'markdown'
            })
    })

});

const processUserData = (msg, options) => {
    sessions[msg.from.id].state = states.WAIT_FOR_DATA_TO_PROCESS;

    const {
        data
    } = sessions[msg.from.id];

    const {
        reportData,
        updatesData
    } = processForwards(data);

    if (reportData.criticalError) {
        return msg.reply.text(`
Произошла критическая ошибка! Отменяю форварды.

_${reportData.criticalError}_
        `, {
            parseMode: 'markdown',
            replyMarkup: defaultKeyboard
        });
    }

    if (options.usePip && reportData.pipRequired) {
        sessions[msg.from.id].state = states.WAIT_FOR_PIP_FORWARD;
        return msg.reply.text(`
Я не заметил в форвардах твоего пип-боя, можешь мне его дослать?
Если у тебя нет на это времени жми /skippipforward

*ВНИМАНИЕ: ПРИ НАЖАТИИ НА /skippipforward - БОТ ПРОИГНОРИРУЕТ ТВОИ БИТВЫ И ПОБЕГИ ОТ МОБОВ И НЕ ЗАПИШЕТ ИХ В БАЗУ*
`, {
    parseMode: 'markdown',
});
    }

    if(options.useBeastFace && !_.isEmpty(reportData.beastToValidate)) {
        sessions[msg.from.id].state = states.WAIT_FOR_BEAST_FACE_FORWARD;
        return msg.reply.text(`
Слушай, я не могу понять кто тебе надрал задницу, ${reportData.beastToValidate[0].name} - это обычный моб или данжевый?

Пожалуйста скинь форвард встречи с этим мобом:
\`Во время вылазки на тебя напал...\`
_или_
\`...перегородил тебе путь.\`

Если у тебя нет на это времени жми /skipbeastforward

*ВНИМАНИЕ: ПРИ НАЖАТИИ НА /skipbeastforward - БОТ ПРОИГНОРИРУЕТ ТОЛЬКО РЕЗУЛЬТАТ ТВОЕЙ БИТВЫ С ${reportData.beastToValidate[0].name} НЕ ЗАПИШЕТ ИХ В БАЗУ*
`, {
    parseMode: 'markdown',
});
    }



    msg.reply.text(`Перехожу в режим обработки данных, подожди пожалуйста немного :3`, {
        replyMarkup: 'hide'
    });

    let amountOfData = updatesData.beasts.length + updatesData.locations.length;

    console.log({
        reportData,
        updatesData,
        telegram: {
            id: msg.from.id,
            firstName: msg.from.first_name,
            userName: msg.from.username
        }
    });

    /* User.findOne({
        'telegram.id': msg.from.id
    }, function (err, user) {
        if (user === null) {
            const newUser = new User({
                telegram: {
                    id: msg.from.id,
                    firstName: msg.from.first_name,
                    userName: msg.from.username
                },
                pip: reportData.lastPip
            });

            newUser.save().then(function (user, err) {
                if (err) {
                    console.log('#mongo_error User save error:' + err);
                    return msg.reply.text('Ошибка при сохранении твоего пип-боя');
                }
            });
        }
    }); */

    const isBeastUnderValidation = (name) => {
        return reportData.beastToValidate.filter(beast => {
            return beast.name === name;
        }).length > 0
    }

    if (options.usePip !== true) {
        amountOfData = updatesData.locations.length;
    }

    if (updatesData.beasts.length > 0 && options.usePip === true) {

        async.forEach(updatesData.beasts, function (iBeast, next) {
            if (!options.useBeastFace) {
                if (isBeastUnderValidation(iBeast.name)) {
                    amountOfData -= 1;
                    next();
                }
            } else {
                Beast.findOne({
                    name: iBeast.name,
                    isDungeon: iBeast.isDungeon
                }).then(function (fBeast) {
                    if (fBeast === null) {
                        const newBeast = new Beast(iBeast);

                        newBeast.save().then(() => next());
                    } else {
                        let isSameFleeExists = true,
                            isSameConcussionExists = true,
                            isSameBattleExists = true;

                        if (iBeast.battles) {
                            if (iBeast.battles.length > 0) {
                                isSameBattleExists = fBeast.battles.map(battle => {
                                    if (iBeast.battles === undefined) {
                                        return true;
                                    }

                                    const existingBattle = _.clone(battle.toJSON());

                                    return existingBattle.totalDamageReceived === iBeast.battles[0].totalDamageReceived &&
                                    existingBattle.totalDamageGiven === iBeast.battles[0].totalDamageGiven;
                                }).some(result => result === true);
                            }
                        }

                        if (iBeast.concussions) {
                            if (iBeast.concussions.length > 0) {
                                isSameConcussionExists = fBeast.concussions.map(concussion => {
                                    const existingConcussion = _.clone(concussion.toJSON());

                                    return existingConcussion.stats.agility === iBeast.concussions[0].stats.agility &&
                                            existingConcussion.amount === iBeast.concussions[0].amount;
                                }).some(result => result === true);
                            }
                        }

                        if (iBeast.flees) {
                            if (iBeast.flees.length === 1) {
                                isSameFleeExists = fBeast.flees.map(flee => {
                                    const existingFlee = _.clone(flee.toJSON());

                                    if (iBeast.flees[0].outcome === 'win') {
                                        return existingFlee.stats.agility === iBeast.flees[0].stats.agility &&
                                            existingFlee.outcome === iBeast.flees[0].outcome
                                    }

                                    return existingFlee.stats.agility === iBeast.flees[0].stats.agility &&
                                            existingFlee.outcome === iBeast.flees[0].outcome &&
                                            existingFlee.damageReceived === iBeast.flees[0].damageReceived;
                                }).some(result => result === true);
                            }
                        }

                        if (!_.isEmpty(iBeast.receivedItems)) {

                            if (_.isEmpty(fBeast.receivedItems)) {
                                fBeast.receivedItems = {};
                            }

                            Object.keys(iBeast.receivedItems).map((item) => {
                                const amount = iBeast.receivedItems[item];

                                if (fBeast.receivedItems[item]) {
                                    if (!_.contains(fBeast.receivedItems[item], amount)) {
                                        fBeast.receivedItems[item].push(amount);
                                    }
                                    // TODO: Apply to similar
                                    fBeast.markModified('receivedItems');
                                } else {
                                    fBeast.markModified('receivedItems');
                                    fBeast.receivedItems[item] = [amount];
                                }
                            })
                        }

                        if (!_.contains(fBeast.distanceRange, iBeast.distanceRange[0])) {
                            fBeast.distanceRange.push(iBeast.distanceRange[0]);
                        }

                        if (iBeast.capsReceived !== undefined) {
                            if (!_.contains(fBeast.capsReceived, iBeast.capsReceived)) {
                                fBeast.capsReceived.push(iBeast.capsReceived);
                            }
                        }

                        if (iBeast.materialsReceived !== undefined) {
                            if (!_.contains(fBeast.materialsReceived, iBeast.materialsReceived)) {
                                fBeast.materialsReceived.push(iBeast.materialsReceived);
                            }
                        }

                        if (!isSameBattleExists) {
                            fBeast.battles.push(iBeast.battles[0]);
                        }

                        if (!isSameConcussionExists) {
                            fBeast.concussions.push(iBeast.concussions[0]);
                        }

                        if (!isSameFleeExists) {
                            fBeast.flees.push(iBeast.flees[0]);
                        }


                        // TODO: Concussion
                        // TODO: Received items

                        fBeast.save().then(() => next()).catch(e => console.log(e));
                    }
                });
            }

        }, function (err) {
            console.log('iterating done');
        });
    }

    if (updatesData.locations.length > 0) {
        async.forEach(updatesData.locations, function (iLocation, next) {
            Location.findOne({
                distance: iLocation.distance
            }).then(function (fLocation) {
                if (fLocation === null) {
                    const newLocation = new Location({
                        distance: iLocation.distance,
                        name: iLocation.name,
                        type: iLocation.type,
                        isRaid: iLocation.isRaid,
                        effects: [iLocation.effect],
                        capsReceived: [iLocation.capsReceived],
                        materialsReceived: [iLocation.materialsReceived],
                        capsLost: [iLocation.capsLost],
                        materialsLost: [iLocation.materialsLost],
                        receivedItems: [iLocation.receivedItems],
                        receivedBonusItems: [iLocation.receivedBonusItems],
                        healthInjuries: [iLocation.healthInjuries]
                    });

                    newLocation.save().then(() => next())
                } else {
                    if (!_.contains(fLocation.effects, iLocation.effect)) {
                        fLocation.effects.push(iLocation.effect);
                    }

                    if (!_.contains(fLocation.capsReceived, iLocation.capsReceived)) {
                        fLocation.capsReceived.push(iLocation.capsReceived);
                    }

                    if (!_.contains(fLocation.materialsReceived, iLocation.materialsReceived)) {
                        fLocation.materialsReceived.push(iLocation.materialsReceived);
                    }

                    if (!_.contains(fLocation.capsLost, iLocation.capsLost)) {
                        fLocation.capsLost.push(iLocation.capsLost);
                    }

                    if (!_.contains(fLocation.materialsLost, iLocation.materialsLost)) {
                        fLocation.materialsLost.push(iLocation.materialsLost);
                    }

                    if (!_.contains(fLocation.healthInjuries, iLocation.healthInjuries)) {
                        fLocation.healthInjuries.push(iLocation.healthInjuries);
                    }

                    if (!_.isEmpty(iLocation.receivedItems)) {
                        Object.keys(iLocation.receivedItems).map((item) => {
                            const amount = iLocation.receivedItems[item];

                            if (fLocation.receivedItems[item]) {
                                if (!_.contains(fLocation.receivedItems[item], amount)) {
                                    fLocation.receivedItems[item].push(amount);
                                }
                            } else {
                                fLocation.receivedItems[item] = [amount];
                            }
                        })
                    }

                    if (!_.isEmpty(iLocation.receivedBonusItems)) {
                        Object.keys(iLocation.receivedBonusItems).map((item) => {
                            const amount = iLocation.receivedBonusItems[item];

                            if (!_.isEmpty(fLocation.receivedBonusItems)) {
                                if (fLocation.receivedBonusItems[item]) {
                                    if (!_.contains(fLocation.receivedBonusItems[item], amount)) {
                                        fLocation.receivedBonusItems[item].push(amount);
                                    }
                                }
                            } else {
                                fLocation.receivedBonusItems[item] = [amount];
                            }
                        })
                    }

                    fLocation.save().then(() => next());
                }
            });
        }, function (err) {
            console.log(err, 'iterating done');
        });
    }


    // if PIP exist - try to apply it to given data
    // if not - request recent PIP
    // try to apply PIP to given data
    // if PIP not applyible throw error and update data which is not relies on PIP

    let errors = '';

    if (reportData.errors.length > 0) {
        errors = `
*Также я заметил такие ошибки*:
${reportData.errors.join('\n')}
        `;
    }

    if (amountOfData > 0) {
        // TODO: Move out shit to strings
        // TODO: Implement meaningfull report data regarding found usefull data
        setTimeout(() => {
    // Я насчитал ${amountOfData} данных!

            msg.reply.text(`
Фух, я со всём справился - спасибо тебе огромное за информацию!
Теперь ты опять можешь пользоваться функционалом *Скилокачатора*.
Если ты чего-то забыл докинуть - смело жми на \`[Скинуть лог 🏃]\` и _докидывай_
${errors}
    `, {
                replyMarkup: defaultKeyboard,
                parseMode: 'markdown'
            });
        }, 1500);
    } else {
        setTimeout(() => {
            msg.reply.text(`
К сожалению я ничего не смог узнать из твоих форвардов :с
    `, {
                replyMarkup: defaultKeyboard,
                parseMode: 'markdown'
            });
        }, 1500);
    }

    delete sessions[msg.from.id];
}

bot.on('/journeyforwardend', msg => {
    sessions[msg.from.id].state = states.WAIT_FOR_DATA_TO_PROCESS;

    // console.log(JSON.stringify(sessions[msg.from.id].data));
    processUserData(msg, {
        usePip: sessions[msg.from.id].processDataConfig.usePip,
        useBeastFace: sessions[msg.from.id].processDataConfig.useBeastFace
    });
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

    sessions[msg.from.id].processDataConfig.usePip = false;

    processUserData(msg, {
        usePip: sessions[msg.from.id].processDataConfig.usePip,
        useBeastFace: sessions[msg.from.id].processDataConfig.useBeastFace
    });
});

bot.on('/skipbeastforward', msg => {
    msg.reply.text('Окей, сейчас попробую обработать что смогу');

    sessions[msg.from.id].processDataConfig.useBeastFace = false;

    processUserData(msg, {
        usePip: sessions[msg.from.id].processDataConfig.usePip,
        useBeastFace: sessions[msg.from.id].processDataConfig.useBeastFace
    });
})


bot.on('/version', msg => {
    msg.reply.text(`Текущая версия бота - <b>${config.version}</b> [β]`, {
        asReply: true,
        parseMode: 'html'
    });
})

bot.on('/debug', msg => {

    let inlineReplyMarkup = bot.inlineKeyboard([
        [
            bot.inlineButton('Инфо', {callback: 'https://t.me/WastelandWarsBot'}),
            bot.inlineButton('Лут', {callback: 'https://t.me/WastelandWarsBot'}),
            bot.inlineButton('Бой', {callback: 'https://t.me/WastelandWarsBot'}),
            bot.inlineButton('Побег', {callback: 'https://t.me/WastelandWarsBot'}),
            bot.inlineButton('Оглушения', {callback: 'https://t.me/WastelandWarsBot'})
        ]
    ]);

    return msg.reply.text(`
*🦎Геккон (⭐️)*
Был замечен на 1-181км


*Самый удачный бой при наименьшем уроне*:
Уроне мобу 2899.
Статы игрока: ⚔️Урон: 1365 🛡Броня: 290.
Всего урона от моба получено - 💔749

*Самый не удачный бой при наименьшем уроне*:
Уроне мобу 1500.
Статы игрока: ⚔️Урон: 866 🛡Броня: 110.
Всего урона от моба получено - 💔500
`, {
    parseMode: 'markdown',
    replyMarkup: inlineReplyMarkup,
    resize: false
});
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

bot.on('/show_help', msg => msg.reply.text(`
_Бот работает в бета режиме._

Если хочешь начать использовать скилокачатор - скинь пип;

Если хочешь посмотреть что знает бот про моба - скинь форвард встречи с ним;

Если хочешь научить бота новому - нажимаешь скинуть лог, затем кидаешь все свои форварды, которые хочешь записать( бои с монстрами и проход км бот распознает) и в конце свежий пип. Затем нажимаешь стоп и ждешь реакции бота.

Если что, вот гайд - https://teletype.in/@eko24/SkUiLkzCz;
`, {
    parseMode: 'markdown'
}));

bot.on('/show_drones', msg => msg.reply.text(`
🛰Барахло ⚙️Универсальный
⚔️10 🛡50/50 ⚡️6%

🛰Малыш ⚙️Универсальный
⚔️18 🛡80/80 ⚡️10%

🛰Дефолт ⚙️Универсальный
⚔️28 🛡120/120 ⚡️12%

🛰Шерлокдрон ⚙️Универсальный
⚔️12 🛡130/130 ⚡️3%
Имеет модуль Радар, позволяющий получать больше ресурсов.
---------------------------------------
🛰Robot Rock 🔫Боевой
⚔️46 🛡150/150 ⚡️14%

🛰Рад-дрон 🔫Боевой
⚔️68 🛡180/180 ⚡️14%
---------------------------------------
🛰Протекдрон 🛡Обороняющий
⚔️14 🛡270/270 ⚡️14%

🛰AWESOM-O 🛡Обороняющий
⚔️23 🛡420/420 ⚡️16%
---------------------------------------
По статам:
⚔️ - урон дрона
🛡- прочность, уменьшается при попадание монстров по дрону.
⚡️- шанс вступить в бой.
`, {
    parseMode: 'markdown',
    webPreview: false
}));

bot.on('/show_hall_of_fame', msg => msg.reply.text(`
<code>Здесь увековечены жители и организации пустоши, оказавшие титаническую помощь на этапе открытой беты, и развития бота ещё как Скилокачатора</code>

Самому харизматичному человеку в Пустоши - Илье (@Rev1veD) Фунту

Низкий поклон Владимиру (@radueff) Кузьмичёву - создателю первого бота-хелпера

Бундарная благодарочка каналу @chetirka_bund за помощь в распостронении инфы о боте-ассистенте

Ядерная благодарность каналу @nushit за информацию про дронов
https://t.me/nushit/393

Сорок два раза спасибо "Основе" и товарищу Звёздопылькину за ифнормацию про локации
https://t.me/trust_42/57

Отдельная благодарнасть товарищу @MohanMC за помощь в форматировании

<code>🏅 Медаль с отличием х1</code> и <code>ОГРОМНОЕ спасибо х4</code> @K3nny2k за обнаружение ужасного бага в сохранении побегов,
помощь в создании каталога мобов, обнаружении нескольких багов с гигантами, и хуй знает что ещё.

<code>Необычная благодарность х1</code> @x59x75x72x79 за многочисленые багрепорты о выводе инфы

Список дополняется...
`, {
    parseMode: 'html',
    webPreview: false
}));

const giantsKeyboard = bot.inlineKeyboard([
    [
        bot.inlineButton('🔄 Обновить', {callback: 'update_giants'}),
        bot.inlineButton('ℹ️ Информация', {callback: 'show_info'})
    ]
]);

const beastRangesKeyboard = bot.inlineKeyboard(_.chunk(getRanges.map(range => {
    const first = _.min(range);
    const last = _.max(range);

    if (first !== last) {
        return bot.inlineButton(`${first}-${last}`, {
            callback: `show_beast_${first}-${last}`
        });
    }
    return bot.inlineButton(`${first}`, {
        callback: `show_beast_${first}-${first}`
    });
}), 5));



bot.on('/show_giants', msg => {


Giant.find({}).then(giants => {
    const giantsReply = _.sortBy(giants, 'distance').map(giant => {
    const isDead = giant.health.current <= 0;
    const time = moment(giant.forwardStamp, 'X').add(3, 'hour').format('DD.MM HH:mm');

    return `▫️ *${giant.name}* (${giant.distance || '??'}км) - ${time} - ${isDead ? 'убит' : `❤️${giant.health.current}`}`;
});

        const reply = `
Текущее состояние по гигантам (МСК):

${_.isEmpty(giantsReply.join('\n')) ? 'Пока что данных нет' : giantsReply.join('\n')}

_Скидывайте форварды о встрече или бое с гигантом - они запишутся автоматом._
_Если гиганта нет в списке - значит его ещё не присылали боту_
`;

        return msg.reply.text(reply, {
            parseMode: 'markdown',
            replyMarkup: giantsKeyboard
        });
    });
});

bot.on('/show_beasts', msg => {
    const reply = `
Это каталог всех мобов в Пустоши <i>(не данжевых)</i>
Каталог наполняется посредством форвардов от игроков (бои, побеги и оглушения)

Выбери интересующий диапазон километров, после вам будет доступен список мобов, которые были замечены на этом километре.

Жмякай по <b>/mob_1234qwerty...</b> под нужным вам мобом, после вам будет доступна "карточка" простомтра моба с вкладками:
[<code>Инфо</code>], [<code>Лут</code>], [<code>Бой</code>] и [<code>Оглушения</code>]

Гайд тут: https://teletype.in/@eko24/Sy4pCyiRM
`;
    msg.reply.text(reply, {
        replyMarkup: beastRangesKeyboard,
        parseMode: 'html',
        webPreview: false
    }).catch(e => console.log(e))
});

bot.on(/mob_(.+)/, msg => {
    const [, id] = /mob_(.+)/.exec(msg.text);

    routedBeastView(Beast, {
        _id: id,
        isDungeon: false
    }).then(({reply,beast}) => {
        if(reply != false) {
            const beastReplyMarkup = getBeastKeyboard(beast._id.toJSON());

            return msg.reply.text(reply, {
                asReply: true,
                parseMode: 'html',
                replyMarkup: beastReplyMarkup
            });
        } else {
            return msg.reply.text(`Прости, я никогда не слышал про этого ${beast.name} :c`, {
                asReply: true
            })
        }
    });
})

bot.on('callbackQuery', msg => {
    const chatId = msg.from.id;
    const messageId = msg.message.message_id;
    const showMobRegExp = /show_beast_(\d+)-(\d+)/;
    const showMobRouteRegExp = /show_beast_page_(.+)-(.+)/;

    if(msg.data === 'update_giants') {
        Giant.find({}).then(giants => {
            bot.answerCallbackQuery(msg.id);

            const giantsReply = _.sortBy(giants, 'distance').map(giant => {
            const isDead = giant.health.current <= 0;
            const time = moment(giant.forwardStamp, 'X').format('DD.MM HH:mm');

            return `▫️ *${giant.name}* (${giant.distance}км) - ${time} - ${isDead ? 'убит' : `❤️${giant.health.current}`}`;
        });

                const reply = `
Текущее состояние по гигантам (МСК):

${_.isEmpty(giantsReply.join('\n')) ? 'Пока что данных нет' : giantsReply.join('\n')}

_Скидывайте форварды о встрече или бое с гигантом - они запишутся автоматом._
_Если гиганта нет в списке - значит его ещё не присылали боту_
        `;



            return bot.editMessageText({chatId, messageId}, reply,{replyMarkup: giantsKeyboard, parseMode: 'markdown'});
        }).catch(e => console.log(e));
    } else if (msg.data === 'show_info') {
        bot.answerCallbackQuery(msg.id);

        const reply = `
На данный момент известно о следующих гигантах:
▫️26км - *🗿Радиоактивный Голем*
▫️36км - *🤖Киборг Анклава*
▫️44км - *👹Повелитель Пустоши*
▫️55км - *☠️Киберкоготь*
▫️64км - *🐺Яо-Гигант*

Гиганты имеют огромный запас здоровья. Игрок встречает гиганта, не убив которого нельзя пройти дальше. Каждый игрок может атаковать этого Гиганта.

Если Гигант вас ударит в ответ и у вас не менее 11 единиц здоровья, то у вас останется 1 хп. Если у вас остается менее 11 единиц здоровья и вы получаете удар, то вы умираете.

Гиганты общие для всех фракций, соответственно, чем больше игроков их атакуют, тем быстрее все смогут ходить дальше.

После победы над Гигантом, он вновь появится на том же километре через 12 часов, за которые можно беспрепятственно проходить дальше в Пустошь вплоть до следующего Гиганта.
        `;

        return bot.editMessageText({chatId, messageId}, reply,{
            replyMarkup: giantsKeyboard,
            parseMode: 'markdown'
        });
    } else if (showMobRegExp.test(msg.data)) {
        const [, from, to] = showMobRegExp.exec(msg.data);


        Beast.find({isDungeon: false, distanceRange: {$gte: Number(from), $lte: Number(to)}}).then(beasts => {
            bot.answerCallbackQuery(msg.id);


            const beastsList = beasts.sort((a, b) => {
                const aBattle = _.sortBy(a.battles,'totalDamageReceived').shift();
                const bBattle = _.sortBy(b.battles,'totalDamageReceived').shift();

                if (aBattle !== undefined && bBattle !== undefined) {
                    if (aBattle.totalDamageReceived < bBattle.totalDamageReceived)
                        return -1;
                    if (aBattle.totalDamageReceived > bBattle.totalDamageReceived)
                        return 1;
                }

                return 0;
              }).map(beast => {
                return `
${beast.name}
/mob_${beast.id}`;
            }).join('\n');

            const reply = `
<b>Мобы на ${from}-${to}км</b>
${beastsList}
`;

            return bot.editMessageText({chatId, messageId}, reply,{
                replyMarkup: beastRangesKeyboard,
                parseMode: 'html'
            }).catch(e => console.log(e));
        }).catch(e => console.log(e));;
    } else if (showMobRouteRegExp.test(msg.data)) {
        bot.answerCallbackQuery(msg.id);

        const [, route, beastId] = showMobRouteRegExp.exec(msg.data);

        routedBeastView(Beast, {
            _id: beastId,
            isDungeon: false
        }, route).then(({reply, beast}) => {
            // TODO: Fix keyboard for dungeon beasts
            const beastReplyMarkup = getBeastKeyboard(beast._id.toJSON());

            return bot.editMessageText({chatId, messageId}, reply, {
                replyMarkup: beastReplyMarkup,
                parseMode: 'html'
            }).catch(e => console.log(e));
        })
    }
});



bot.start();