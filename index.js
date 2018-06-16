// TODO: Supply it with pip from database (with appropriate validation just like from the processForwards)

require('dotenv').config();
const uristring = process.env.MONGODB_URI;

const async = require('async');
const mongoose = require('mongoose');
const _ = require('underscore');
const TeleBot = require('telebot');
const program = require('commander');
const moment = require('moment-timezone');
const objectDeepSearch = require('object-deep-search');

const config = require('./package.json');

const forwardPoints = require('./src/constants/forwardPoints');

const regexps = require('./src/regexp/regexp');
const PipRegexps = require('./src/regexp/pip');

const beastSchema = require('./src/schemes/beast');
const locationSchema = require('./src/schemes/location');
const giantScheme = require('./src/schemes/giant');
const userSchema = require('./src/schemes/user');

const chartGeneration = require('./src/utils/chartGeneration');

const parsePip = require('./src/parsers/parsePip');
const beastParser = require('./src/parsers/parseBeast');
const parseLocation = require('./src/parsers/parseLocation');
const parseFlee = require('./src/parsers/parseFlee');
const parseDeathMessage = require('./src/parsers/parseDeathMessage');
const parseBeastFaced = require('./src/parsers/parseBeastFaced');
const parseGiantFaced = require('./src/parsers/parseGiantFaced');
const parseGiant = require('./src/parsers/parseGiant');
const parseGiantOnField = require('./src/parsers/parseGiantOnField');

const {
    matcher,
    regExpSetMatcher
} = require('./src/utils/matcher');
const calculateUpgrade = require('./src/calculateUpgrade');
const upgradeAmountValidation = require('./src/utils/upgradeAmountValidation');
const processForwards = require('./src/utils/processForwards');
const getRanges = require('./src/utils/getRanges');
const tinyHash = require('./src/utils/tinyHash');
const processMenu = require('./src/utils/processMenu');
const menuItemHandler = require('./src/utils/menuItemHandler');
const comparePips = require('./src/database/utils/comparePips');

const routedBeastView = require('./src/views/routedBeastView');

const equipmentMenu = require('./src/staticMenus/equipmentMenu');
const locationsMenu = require('./src/staticMenus/locationsMenu');
const suppliesMenu = require('./src/staticMenus/suppliesMenu');
const achievementsMenu = require('./src/staticMenus/achievementsMenu');
const dungeonMenu = require('./src/staticMenus/dungeonMenu');

const buttons = require('./src/ui/buttons');
const {
    commandsForLag
} = require('./src/strings/strings');

const UserManager = require('./src/database/userManager');

mongoose.connect(uristring);

const Beast = mongoose.model('Beast', beastSchema);
const Giant = mongoose.model('Giant', giantScheme);
const Location = mongoose.model('Location', locationSchema);
const User = mongoose.model('User', userSchema);

const userManager = UserManager(User);

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

const updateOrCreate = (msg, pip, cb) => {
    const telegramData = {
        first_name: msg.from.first_name,
        id: msg.from.id,
        username: msg.from.username
    }

    const pipData = {...pip, timeStamp: msg.forward_date};

    userManager.findByTelegramId(msg.from.id).then(result => {
        if (result.ok === false && result.reason === 'USER_NOT_FOUND') {
            userManager.create({telegramData,pipData}).then(result => {
                cb(result);
            });
        } else if (result.ok === true && result.reason === 'USER_FOUND') {
            userManager.update({telegramData,pipData}).then(result => {
                cb(result);
            });
        }
    });
};

const findPip = (msg, cb) => {
    userManager.findByTelegramId(msg.from.id).then(result => {
        cb(result);
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

    return msg.reply.text(`
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

            buttons['reachableKm56'].label,
            buttons['reachableKm65'].label,
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
    const { pip } = sessions[msg.from.id];



    console.log(`[SKILL UPGRADE]: ${pip.faction} | ${pip.name} | ${msg.from.username}`)

    bot.sendMessage(msg.from.id, effort, {
        replyMarkup: defaultKeyboard,
        parseMode: 'markdown'
    });

    createSession(msg.from.id);
}

const createSession = id => {
    sessions[id] = {
        pip: null,
        state: states.WAIT_FOR_START,
        data: [],
        processDataConfig: {
            usePip: true,
            useBeastFace: true,
            silent: false
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
        buttons['journeyForwardStart'].label,
        buttons['skillUpgrade'].label
    ],
    [
        buttons['showGiants'].label,
        buttons['showBeasts'].label,
        buttons['showEquipment'].label,
    ],
    [
        buttons['showLocations'].label,
        buttons['showSupplies'].label,
        buttons['showAchievments'].label
    ],
    [
        buttons['showDungeons'].label,
        buttons['showInGameCommands'].label
    ],
    [
        buttons['hallOfFame'].label,
        buttons['showHelp'].label
    ]
], {
    resize: true
});

const toGameKeyboard = bot.inlineKeyboard([
    [
        bot.inlineButton('📟 Перейти в игру.', {url: 'https://t.me/WastelandWarsBot'})
    ]
]);

const toSkillOMaticKeyboard = bot.inlineKeyboard([
    [
        bot.inlineButton('Запустить "🎓Скилокачатор"', {callback: 'initialize_skill_upgrade'})
    ]
]);


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
    createSession(msg.from.id);

    return bot.sendMessage(
        msg.from.id,
        `
Привет, меня зовут «*Wasteland Wars Assistant*», я - что-то на подобии "умной" энциклопедии.

⬦ Если хочешь посмотреть что я знаю о мобе которого ты встретил - скинь форвард встречи с ним.

⬦ Если хочешь что бы я помог тебе информацией о прокачке твоих скилов - жми кнопку \`[🎓Скилокачатор]\`

⬦ Если хочешь отправить боту новые данные про мобов - нажими \`[Скинуть лог 🏃]\`

КАНАЛ С НОВОСТЯМИ @wwAssistantBotNews
ЧАТ БЫСТРОГО РЕАГИРОВАНИЯ @wwAssistantChat

_Учти, что я ещё нахожусь в бета-режиме, и ты можешь наткнуться на большие и маленькие баги.
Не переживай - они будут пофикшены_
        `, {
            replyMarkup: defaultKeyboard,
            parseMode: 'markdown',
            webPreview: false
        }
    );
});

bot.on('forward', (msg) => {
    if(sessions[msg.from.id] === undefined) {
        createSession(msg.from.id);
    }

    if(msg.forward_from.id !== 430930191) {
        if (sessions[msg.from.id].state !== states.WAIT_FOR_FORWARD_END) {
            console.log(`[CULPRIT]: ${msg.from.id} | ${msg.from.first_name} | ${msg.from.username}`);

            // createSession(msg.from.id);

            return msg.reply.text(`
Форварды принимаються только от @WastelandWarsBot.
            `, {
                asReply: true,
                replyMarkup: defaultKeyboard
            })
        }
    }

    if (sessions[msg.from.id].state === states.WAIT_FOR_PIP_FORWARD) {
        const isClassicPip = regExpSetMatcher(msg.text, {
            regexpSet: PipRegexps.classicPip
        });

        const isSimplePip = regExpSetMatcher(msg.text, {
            regexpSet: PipRegexps.simplePip
        });

        if (isClassicPip || isSimplePip) {
            data = parsePip(msg, isClassicPip);
            dataType = 'pipboy';

            updateOrCreate(msg,data, result => {
                if(!result.ok && result.reason === 'PIP_VALIDATION_FAILED') {
                    reply = `Я не вижу что бы ты прокачал какие-то скилы :c
Скидывай пип-бой как только прокачаешься!`;
                }

                if(!result.ok && result.reason === 'PIP_OUTDATED') {
                    reply = 'У меня в базе есть более актуальная запись про твой пип-бой';
                }

                if(result.ok && result.reason === 'USER_CREATED') {
                    reply = `
Супер, я сохранил твой пип!
Не забывай скидывать мне свой пип-бой по мере того как будешь прокачивать скилы!`;
                }

                if(result.ok && result.reason === 'USER_UPDATED') {
reply = `Шикардос, я обновил твой пип!
Не забудь скинуть новый пип, когда качнешься!`;
                }

                if(result.ok) {
                    return msg.reply.text(`${reply}\nТеперь я займусь твоими форвардами`).then(res => {
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
                    return msg.reply.text(reply, {
                        asReply: true
                    })
                }
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
        // TODO: Validate forward date - should be greater that date of the first forward and less than date of last forward

        let data;
        let dataType;
        let beastName;

        const isLocation = regExpSetMatcher(msg.text, {
            regexpSet: regexps.location
        });

        const isDungeonBeastFaced = regExpSetMatcher(msg.text, {
            regexpSet: regexps.dungeonBeastFaced
        });

        if (isDungeonBeastFaced) {
            data = parseBeastFaced.parseDungeonBeastFaced(msg.text);
            dataType = 'dungeonBeastFaced';
            beastName = data.name;
        } else if (isLocation) {
            data = parseLocation(msg.text);
            dataType = 'location';
            beastName = data.beastFaced.name
        }

        if (beastName !== sessions[msg.from.id].beastToValidateName && sessions[msg.from.id].beastToValidateName !== '???') {
            return msg.reply.text(`
Этот моб не похож на того с которым ты дрался. Ты чё - наебать меня вздумал?!

Если ты передумал её кидать - жми /skipbeastforward
*Но тогда я проигнорирую битву с этим мобом*
            `, {
                asReply: true
            });
        } else if (isLocation || isDungeonBeastFaced) {
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

        const isClassicPip = regExpSetMatcher(msg.text, {
            regexpSet: PipRegexps.classicPip
        });

        const isSimplePip = regExpSetMatcher(msg.text, {
            regexpSet: PipRegexps.simplePip
        });

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
        } else if (isClassicPip || isSimplePip) {
            data = parsePip(msg, isClassicPip);
            dataType = 'pipboy';
        } else if (isDungeonBeast) {
            data = beastParser.parseDungeonBeast(msg.text);
            dataType = 'dungeonBeast';
        }


        // isDungeonBeast ||
        if (isRegularBeast || isLocation || isFlee || isDeathMessage || isDungeonBeastFaced || (isClassicPip || isSimplePip)) {
            sessions[msg.from.id].data.push({
                data,
                dataType,
                date: msg.forward_date,
                userId: msg.from.id
            });
        }
    } else if (
        sessions[msg.from.id].state !== states.WAIT_FOR_PIP_FORWARD &&
        sessions[msg.from.id].state !== states.WAIT_FOR_BEAST_FACE_FORWARD &&
        sessions[msg.from.id].state !== states.WAIT_FOR_FORWARD_END
    ) {
        const isClassicPip = regExpSetMatcher(msg.text, {
            regexpSet: PipRegexps.classicPip
        });

        const isSimplePip = regExpSetMatcher(msg.text, {
            regexpSet: PipRegexps.simplePip
        });

        const isRegularBeastFaced = regExpSetMatcher(msg.text, {
            regexpSet: regexps.regularBeastFaced
        });

        const isGiantFaced = regExpSetMatcher(msg.text, {
            regexpSet: regexps.giantFaced
        });

        const isGiantFought = regExpSetMatcher(msg.text, {
            regexpSet: regexps.giantFought
        });

        const isGiantOnField = regExpSetMatcher(msg.text, {
            regexpSet: regexps.giantFacedOnField
        })

        const isDungeonBeastFaced = regExpSetMatcher(msg.text, {
            regexpSet: regexps.dungeonBeastFaced
        });

        const isRegularBeast = regExpSetMatcher(msg.text, {
            regexpSet: regexps.regularBeast
        });

        const isFlee = regExpSetMatcher(msg.text, {
            regexpSet: regexps.flee
        });

        /* const isLocation = regExpSetMatcher(msg.text, {
            regexpSet: regexps.location
        });

        const isDungeonBeast = regExpSetMatcher(msg.text, {
            regexpSet: regexps.dungeonBeast
        });

        const isFlee = regExpSetMatcher(msg.text, {
            regexpSet: regexps.flee
        }); */

        if (isClassicPip || isSimplePip) {
            const pip = parsePip(msg, isClassicPip);
            let reply;
            updateOrCreate(msg,pip, result => {
                if(!result.ok && result.reason === 'PIP_VALIDATION_FAILED') {
                    reply = `Я не вижу что бы ты прокачал какие-то скилы :c
Скидывай пип-бой как только прокачаешься!`;
                }

                if(!result.ok && result.reason === 'PIP_OUTDATED') {
                    reply = 'У меня в базе есть более актуальная запись про твой пип-бой';
                }

                if(result.ok && result.reason === 'USER_CREATED') {
                    reply = `
Супер, я сохранил твой пип!
Не забывай скидывать мне свой пип-бой по мере того как будешь прокачивать скилы!`;
                }

                if(result.ok && result.reason === 'USER_UPDATED') {
reply = `Шикардос, я обновил твой пип!
Не забудь скинуть новый пип, когда качнешься!`;
                }

                return msg.reply.text(reply, {
                    asReply: true,
                    replyMarkup: toSkillOMaticKeyboard
                });
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
                        }).then(o => {
                            userManager.addPoints(msg.from.id, userForwardPoints.newGiantData).then(result => {
                                if(!result.ok) {
                                    if(result.reason === 'USER_NOT_FOUND') {
                                        msg.reply.text('Не могу начислить тебе шмепсели пока ты не скинешь мне свой пип-бой :с')
                                    }
                                    // console.log('userManager.addPoints: '+JSON.stringify(result));
                                }
                            });
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
                            }).then(o => {
                                userManager.addPoints(msg.from.id, userForwardPoints.newGiantData).then(result => {
                                    if(!result.ok) {
                                        if(result.reason === 'USER_NOT_FOUND') {
                                            msg.reply.text('Не могу начислить тебе шмепсели пока ты не скинешь мне свой пип-бой :с')
                                        }
                                        // console.log('userManager.addPoints: '+JSON.stringify(result));
                                    }
                                });
                            });
                        })
                    }
                }
            });
        } else if (isGiantOnField) {
            const giant = parseGiantOnField(msg.text);

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
        } else if (isRegularBeastFaced) {
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
        } else if (isRegularBeast || isFlee) {
            // || isLocation || isDungeonBeast || isFlee
            let data;
            let dataType;

            createSession(msg.from.id);

            if (isFlee) {
                data = parseFlee(msg.text);
                dataType = 'flee';
            } else if (isRegularBeast) {
                data = beastParser.parseRegularBeast(msg.text);
                dataType = 'regularBeast';
            }

            /* if (isDungeonBeast) {
                data = beastParser.parseDungeonBeast(msg.text);
                dataType = 'dungeonBeast';
            } else if (isFlee) {
                data = parseFlee(msg.text);
                dataType = 'flee';
            } else if (isRegularBeast) {
                data = beastParser.parseRegularBeast(msg.text);
                dataType = 'regularBeast';
            } else if (isLocation) {
                data = parseLocation(msg.text);
                dataType = 'location';
            } */

            sessions[msg.from.id].data.push({
                data,
                dataType,
                date: msg.forward_date,
                userId: msg.from.id
            });

            processUserData(msg, {
                usePip: sessions[msg.from.id].processDataConfig.usePip,
                useBeastFace: sessions[msg.from.id].processDataConfig.useBeastFace,
                silent: true
            });
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

    const inlineReplyMarkup = bot.inlineKeyboard([
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

const actualProcessUserData = (msg, reportData, updatesData, options) => {
    if(reportData.lastPip !== null) {
        updateOrCreate(msg, reportData.lastPip, result => {
            console.log(result);
        });
    }

    if (options.useBeastFace && !_.isEmpty(reportData.beastToValidate)) {
        sessions[msg.from.id].state = states.WAIT_FOR_BEAST_FACE_FORWARD;
        sessions[msg.from.id].beastToValidateName = reportData.beastToValidate[0].name;
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


    if(!options.silent) {
        msg.reply.text(`Перехожу в режим обработки данных, подожди пожалуйста немного :3`, {
            replyMarkup: 'hide'
        });
    }


    let amountOfData = updatesData.beasts.length + updatesData.locations.length;
    let userForwardPoints = 0;
    let dataProcessed = 0;
    const dupes = {
        battles: 0,
        flees: 0
    }

    const addUserPoints = amount => {
        userForwardPoints += amount;
    }

    /* console.log({
        reportData,
        updatesData,
        telegram: {
            id: msg.from.id,
            firstName: msg.from.first_name,
            userName: msg.from.username
        }
    }); */

    try {
        console.log(`[USAGE]: ${reportData.lastPip.faction} | ${reportData.lastPip.name} | ${msg.from.username}`)
    } catch(e) {

    }

    const isBeastUnderValidation = (name) => {
        return reportData.beastToValidate.filter(beast => {
            return beast.name === name;
        }).length > 0
    }

    if (options.usePip !== true) {
        amountOfData = updatesData.locations.length;
    }

    const processBeasts = () => {
        return new Promise((resolve, reject) => {
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

                                dataProcessed += 1;
                                userForwardPoints += forwardPoints.newMob;

                                newBeast.save().then(() => next());
                            } else {
                                let isSameFleeExists = true,
                                    isSameConcussionExists = true,
                                    isSameBattleExists = true,
                                    isBattleDupe = false,
                                    isFleeDupe = false;

                                if (iBeast.battles) {
                                    if (iBeast.battles.length > 0) {
                                        isSameBattleExists = fBeast.battles.map(battle => {
                                            if (iBeast.battles === undefined) {
                                                return true;
                                            }

                                            const existingBattle = _.clone(battle.toJSON());
                                            const sameStatsBattle = existingBattle.totalDamageReceived === iBeast.battles[0].totalDamageReceived &&
                                            existingBattle.totalDamageGiven === iBeast.battles[0].totalDamageGiven;
                                            const sameStamp = iBeast.battles[0].stamp === existingBattle.stamp;

                                            if(sameStamp) {
                                                isBattleDupe = true;
                                                dupes.battles += 1;
                                            }

                                            return sameStatsBattle || sameStamp;
                                        }).some(result => result === true);
                                    }
                                }


                                // TODO: Error logging for no stats object
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

                                            const sameStatsFlee = existingFlee.stats.agility === iBeast.flees[0].stats.agility &&
                                            existingFlee.outcome === iBeast.flees[0].outcome &&
                                            existingFlee.damageReceived === iBeast.flees[0].damageReceived;
                                            const sameStamp = iBeast.flees[0].stamp === flee.stamp;

                                            if(sameStamp) {
                                                isFleeDupe = true;
                                                dupes.flees += 1;
                                            }

                                            return sameStatsFlee || sameStamp;
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

                                if(!isBattleDupe) {
                                    if (!_.contains(fBeast.distanceRange, iBeast.distanceRange[0])) {
                                        userForwardPoints += forwardPoints.newDistance;

                                        fBeast.distanceRange.push(iBeast.distanceRange[0]);
                                    } else {
                                        userForwardPoints += forwardPoints.sameGiantData;
                                    }
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

                                if(!isBattleDupe) {
                                    if (!isSameBattleExists) {
                                        const battle = iBeast.battles[0];

                                        if (battle.damagesGiven.length === 1) {
                                            userForwardPoints += forwardPoints.oneShotBattle;
                                        } else {
                                            if(battle.outcome === 'win') {
                                                userForwardPoints += forwardPoints.newBattleWin;
                                            } else {
                                                userForwardPoints += forwardPoints.newBattleLose;
                                            }
                                        }

                                        fBeast.battles.push(iBeast.battles[0]);
                                    } else {
                                        if(iBeast.battles !== undefined) {
                                            const battle = iBeast.battles[0];

                                            if (battle.damagesGiven.length === 1) {
                                                userForwardPoints += forwardPoints.oneShotBattle;
                                            } else {
                                                if(battle.outcome === 'win') {
                                                    userForwardPoints += forwardPoints.sameBattleWin;
                                                } else {
                                                    userForwardPoints += forwardPoints.sameBattleLose;
                                                }
                                            }
                                        }
                                    }
                                }

                                if (!isSameConcussionExists && !isBattleDupe) {
                                    fBeast.concussions.push(iBeast.concussions[0]);
                                }

                                if (!isFleeDupe) {
                                    if (!isSameFleeExists) {
                                        const flee = iBeast.flees[0];

                                        if(flee.outcome === 'win') {
                                            userForwardPoints += forwardPoints.newFleeWin;
                                        } else {
                                            userForwardPoints += forwardPoints.newFleeLose;
                                        }

                                        fBeast.flees.push(iBeast.flees[0]);
                                    } else {
                                        if(iBeast.flees !== undefined) {
                                            const flee = iBeast.flees[0];

                                            if(flee.outcome === 'win') {
                                                userForwardPoints += forwardPoints.sameFleeWin;
                                            } else {
                                                userForwardPoints += forwardPoints.sameFleeLose;
                                            }
                                        }

                                    }
                                }

                                dataProcessed += 1;

                                // TODO: Concussion
                                // TODO: Received items

                                fBeast.save().then(() => next()).catch(e => console.log(e));
                            }
                        });
                    }
                }, function (err) {
                    resolve();
                });
            } else {
                resolve();
            }
        }, function (err) {
            // console.log('iterating done');
        });
    }

    const processLocations = () => {
        return new Promise((resolve, reject) => {
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

                            dataProcessed += 1;

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

                            if (!_.isEmpty(iLocation.receivedBonusItems)) {
                                Object.keys(iLocation.receivedBonusItems).map((item) => {
                                    const amount = iLocation.receivedBonusItems[item];

                                    if (!_.isEmpty(fLocation.receivedBonusItems)) {
                                        if (fLocation.receivedBonusItems[item]) {
                                            // FIXME: TypeError: fLocation.receivedBonusItems[item].push is not a function

                                            if (!_.contains(fLocation.receivedBonusItems[item], amount)) {
                                                // fLocation.receivedBonusItems[item].push(amount);
                                            }
                                        } else {
                                            fLocation.receivedBonusItems[item] = [amount];
                                        }
                                    }
                                })
                            }

                            dataProcessed += 1;

                            fLocation.save().then(() => next());
                        }
                    });
                }, function (err) {
                    resolve();
                });
            } else {
                resolve();
            }
        })
    };


    Promise.all([
        processBeasts(),
        processLocations()
    ]).then(o => {
        let errors = '';
        let dupesText = '';

        if (reportData.errors.length > 0) {
            errors = `
    *Также я заметил такие вещи*:
    ${reportData.errors.join('\n')}
            `;
        }

        if(dupes.battles > 0 || dupes.flees > 0) {
            dupesText = 'Похоже ты скидывал некоторые форварды по второму разу. Я не начислял тебе за них очки'
        }

        if (dataProcessed > 0) {
            // TODO: Move out shit to strings
            // TODO: Implement meaningfull report data regarding found usefull data
            setTimeout(() => {

                if(options.silent) {
                    reply = `
Спасибо за форвард. Я перевёл ${userForwardPoints.toFixed(1)} 💎*Шмепселей* на твой счёт.\n_${dupesText}_`;
                } else {
                    reply = `Фух, я со всём справился - спасибо тебе огромное за информацию!
Ты заработал ${userForwardPoints.toFixed(1)} 💎*Шмепселей* за свои форварды!
_${dupesText}_
Всего я насчитал ${dataProcessed} данных!

Если ты чего-то забыл докинуть - смело жми на \`[Скинуть лог 🏃]\` и _докидывай_
${errors}`;
                }

                msg.reply.text(reply, {
                    replyMarkup: defaultKeyboard,
                    parseMode: 'markdown',
                    asReply: options.silent
                }).then(res => {
                    userManager.addPoints(msg.from.id, userForwardPoints).then(result => {
                        if(!result.ok) {
                            if(result.reason === 'USER_NOT_FOUND') {
                                msg.reply.text('Не могу начислить тебе шмепсели пока ты не скинешь мне свой пип-бой :с')
                            }
                            console.log('userManager.addPoints: '+JSON.stringify(result));
                        }
                    });
                });
            }, 1500);
        } else {
            setTimeout(() => {
                msg.reply.text(`
К сожалению я ничего не смог узнать из твоих форвардов :с`, {
                    replyMarkup: defaultKeyboard,
                    parseMode: 'markdown'
                });
            }, 1500);
        }

        createSession(msg.from.id);
    });
}

const processUserData = (msg, options) => {
    sessions[msg.from.id].state = states.WAIT_FOR_DATA_TO_PROCESS;

    const {
        data
    } = sessions[msg.from.id];

    let {
        reportData,
        updatesData
    } = processForwards(data);

    if(updatesData.locations.length === 0 && updatesData.beasts.length === 0) {
        return msg.reply.text(`
К сожалению я ничего не смог узнать из твоих форвардов :с`, {
                replyMarkup: defaultKeyboard,
            parseMode: 'markdown'
        });
    }

    if (options.usePip && reportData.pipRequired) {
        userManager.findByTelegramId(msg.from.id).then(result => {
            if (result.ok && result.reason === 'USER_FOUND') {
                if(result.data.pip !== undefined) {
                    sessions[msg.from.id].data.push({
                        data: result.data.pip,
                        dataType: 'pipboy',
                        date: result.data.pip.timeStamp
                    });
                }


                const {
                    reportData: reportDataWithUserPip,
                    updatesData: updatesDataWithUserPip
                } = processForwards(data);

                if (reportDataWithUserPip.criticalError && reportDataWithUserPip.couldBeUpdated) {
                    sessions[msg.from.id].state = states.WAIT_FOR_PIP_FORWARD;
                    return msg.reply.text(`
Твой пип-бой, который я когда-то сохранил - устарел.
Пожалуйста скинь мне свой новый пип-бой.
Либо же это форвард с статами, отличными от твоих.

Если у тебя нет на это времени жми /skippipforward

*ВНИМАНИЕ: ПРИ НАЖАТИИ НА /skippipforward - БОТ ПРОИГНОРИРУЕТ ТВОИ БИТВЫ И ПОБЕГИ ОТ МОБОВ И НЕ ЗАПИШЕТ ИХ В БАЗУ*
`, {
                        parseMode: 'markdown',
                        replyMarkup: toGameKeyboard
                    });4
                } else if (reportDataWithUserPip.criticalError && !reportDataWithUserPip.couldBeUpdated) {
                    createSession(msg.from.id);
                    return msg.reply.text('Твой пип не соответсвуют твоим статам из форвардам!\nПрости, я вынужден отменить твои форварды.', {
                        replyMarkup: defaultKeyboard
                    });
                } else {
                    updatesData = updatesDataWithUserPip;
                    reportData = reportDataWithUserPip;

                    actualProcessUserData(msg, reportData, updatesData, options);
                }
            } else {
                sessions[msg.from.id].state = states.WAIT_FOR_PIP_FORWARD;
                return msg.reply.text(`
Похоже ты мне ещё не скидывал пип бой
Если у тебя нет на это времени жми /skippipforward

*ВНИМАНИЕ: ПРИ НАЖАТИИ НА /skippipforward - БОТ ПРОИГНОРИРУЕТ ТВОИ БИТВЫ И ПОБЕГИ ОТ МОБОВ И НЕ ЗАПИШЕТ ИХ В БАЗУ*
`, {
                    parseMode: 'markdown',
                    replyMarkup: toGameKeyboard
                });
            }
        });
    } else {
        userManager.findByTelegramId(msg.from.id).then(result => {
            // BOOK
            if(result.ok && result.reason === 'USER_FOUND') {
                    actualProcessUserData(msg, reportData, updatesData, options);
            } else {
                actualProcessUserData(msg, reportData, updatesData, options);
            }
        });
    }
}

bot.on('/journeyforwardend', msg => {
    if(sessions[msg.from.id] === undefined) {
        createSession(msg.from.id);

        return msg.reply.text(`Чёрт, похоже меня перезагрузил какой-то мудак и твои форварды не сохранились, прости пожалуйста :с`, {
            replyMarkup: defaultKeyboard
        });
    } else {
        sessions[msg.from.id].state = states.WAIT_FOR_DATA_TO_PROCESS;

        // console.log(JSON.stringify(sessions[msg.from.id].data));
        processUserData(msg, {
            usePip: sessions[msg.from.id].processDataConfig.usePip,
            useBeastFace: sessions[msg.from.id].processDataConfig.useBeastFace
        });
    }
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

bot.on('/eqp', msg => {
    // TODO: Inline button resize
    const buttons = processMenu(equipmentMenu).map(menuItem => {
        return bot.inlineButton(menuItem.title, {callback: `equipment_menu-${menuItem.name}`});
    });

    let inlineReplyMarkup = bot.inlineKeyboard(_.chunk(buttons, 3));

    return msg.reply.text(equipmentMenu.text, {
        parseMode: 'markdown',
        replyMarkup: inlineReplyMarkup
    });
})

bot.on('/locations', msg => {
    const buttons = processMenu(locationsMenu).map(menuItem => {
        return bot.inlineButton(menuItem.title, {callback: `locations_menu-${menuItem.name}`});
    });

    let inlineReplyMarkup = bot.inlineKeyboard(_.chunk(buttons, 3));

    return msg.reply.text(locationsMenu.text, {
        parseMode: 'html',
        replyMarkup: inlineReplyMarkup
    });
})

bot.on('/sppl', msg => {
    const buttons = processMenu(suppliesMenu).map(menuItem => {
        return bot.inlineButton(menuItem.title, {callback: `supplies_menu-${menuItem.name}`});
    });

    let inlineReplyMarkup = bot.inlineKeyboard(_.chunk(buttons, 3));

    return msg.reply.text(suppliesMenu.text, {
        parseMode: 'html',
        replyMarkup: inlineReplyMarkup
    });
})

bot.on('/achv', msg => {
    const buttons = processMenu(achievementsMenu).map(menuItem => {
        return bot.inlineButton(menuItem.title, {callback: `achievements_menu-${menuItem.name}`});
    });

    let inlineReplyMarkup = bot.inlineKeyboard(_.chunk(buttons, 3));

    return msg.reply.text(achievementsMenu.text, {
        parseMode: 'markdown',
        replyMarkup: inlineReplyMarkup
    });
})

bot.on('/dng', msg => {
    const buttons = processMenu(dungeonMenu).map(menuItem => {
        return bot.inlineButton(menuItem.title, {callback: `dungeons_menu-${menuItem.name}`});
    });

    let inlineReplyMarkup = bot.inlineKeyboard(_.chunk(buttons, 2));

    return msg.reply.text(dungeonMenu.text, {
        parseMode: 'html',
        replyMarkup: inlineReplyMarkup,
        webPreview: false
    });
})

bot.on('/cfl', msg => {
    return msg.reply.text(commandsForLag, {
        paresMode: 'html'
    });
})

bot.on('/skill_upgrade', msg => {
    const skillOMaticText = `
В «<b>🎓 Скилокачаторе</b>» я могу помочь тебе посчитать финансовые затраты на прокачку твоих скилов.`;

    findPip(msg, result => {
        if(result.ok && result.reason === 'USER_FOUND') {
            if(sessions[msg.from.id] === undefined) {
                createSession(msg.from.id);
            }

            sessions[msg.from.id].pip = result.data.pip;
            sessions[msg.from.id].state = states.WAIT_FOR_SKILL;

            const replyMarkup = bot.keyboard([
                [buttons.skillSelectStrength.label, buttons.skillSelectAccuracy.label, buttons.skillSelectAgility.label],
                [buttons.skillSelectHealth.label, buttons.skillSelectCharisma.label],
                [buttons.cancelAction.label]
            ], {
                resize: true
            });

            const skillMap = {
                "health": "❤ Живучесть",
                "strength": "💪 Сила",
                "precision": "🔫 Меткость",
                "charisma": "🗣 Харизма",
                "agility": "🤸‍♀️ Ловкость"
            };

            const userSkills = Object.keys(skillMap).map(key => {
                const skillName = skillMap[key];

                return `<b>${skillName}</b>: ${result.data.pip[key]}`;
            })

            return msg.reply.text(`
${skillOMaticText}

Вот что я знаю про твои скилы:
${userSkills.join('\n')}
<i>(Если они не актуальные - просто отправь мне свой новый пип-бой)</i>


<b>Выбери какой скил ты хочешь прокачать</b>

Что бы вернуться в меню - нажми кнопку <code>[↩️Назад]</code>.
Либо, в любой момент напиши /cancel.
            `, {
                replyMarkup,
                parseMode: 'html'
            });
        }

        return msg.reply.text(`
${skillOMaticText}

Оу, похоже я ещё ничего не знаю про твой пип :с
Перейди в игру по кнопке внизу и перешли мне его пожалуйста!
        `, {
            replyMarkup: toGameKeyboard,
            parseMode: 'html'
        });
    });
})

bot.on(['/leaderboard','/top'], msg => {
    userManager.leaderboard(msg.from.id).then(result => {
        if (result.ok && result.reason === 'LEADERBOARD_GENERATED') {
            return msg.reply.text(`<i>Топ игроков отпраляющих форварды:</i> \n\n`+result.data, {
                parseMode: 'html'
            });
        } else {
            if(result.reason === 'NO_USERS_FOUND') {
                return msg.reply.text('В базе пока что нет юзеров :с');
            }

            return msg.reply.text(JSON.stringify(result))
        }
    });
});

bot.on("/mypipstats", msg => {
    User.findOne({ "telegram.id": msg.from.id }, function(err, person) {
      if (err) {
        console.log(err);
        return;
      }

      if (person === null) {
        return msg.reply.text('Я не могу показать тебе твой график прогресса - ты мне ещё не скидывал своего пип-боя')
      }

      let pips = person.history.pip.toObject();
      var pipsSize = pips.length;
      var limit = 10;

      if (pips.length <= 1) {
        return msg.reply.text(
          "Я не видел что бы прокачивался в скилах. Скинь свой пип-бой когда прокачаешь какой-то скил",
          { asReply: true }
        );
      }

      if (pipsSize > limit) {
        pips = pips.slice(pipsSize-limit, pipsSize)
      }

      const whiteListKeys = [
        "health",
        "strength",
        "precision",
        "charisma",
        "agility"
      ];

      const systemToHumanKeysMap = {
        health: "Живучесть",
        strength: "Сила",
        precision: "Меткость",
        charisma: "Харизма",
        agility: "Ловкость"
      };

      const history = {};

      whiteListKeys.forEach(key => {
        history[key] = [];
      });

      pips.forEach(pip => {
        Object.keys(pip).forEach(key => {
          if (_.contains(whiteListKeys, key)) {
            const value = pip[key];

            history[key].push(value);
          }
        });
      });

      const flattify = arr => {
        const maxIndex = arr.length - 1;

        return arr.map((v, i) => {
          if (i !== maxIndex && i !== 0) {
            const prevValue = arr[i - 1];
            const nextValue = arr[i + 1];

            if (prevValue < v && nextValue < v) {
              return prevValue;
            }

            return v;
          } else if (i === 0 || i === maxIndex) {
            return v;
          }
        });
      };

      Object.keys(history).forEach(key => {
        const arrayOfValues = history[key];
        history[key] = flattify(arrayOfValues);
      });

      const colors = {
        health: "rgba(231, 76, 60,1.0)",
        strength: "rgba(241, 196, 15,1.0)",
        precision: "rgba(39, 174, 96,1.0)",
        charisma: "rgba(52, 73, 94,1.0)",
        agility: "rgba(189, 195, 199,1.0)"
      };

      const createDataSets = history => {
        return whiteListKeys.map(key => {
          return {
            label: systemToHumanKeysMap[key],
            backgroundColor: colors[key],
            borderColor: colors[key],
            data: history[key],
            fill: false,
            lineTension: 0
          };
        });
      };

      const getDateLabels = pips => {
        return pips.map(pip => moment(pip.timeStamp * 1000).format("DD/MM"));
      };

      var config = {
        type: "line",
        data: {
          labels: getDateLabels(pips),
          datasets: createDataSets(history)
        },
        options: {
          scales: {
            xAxes: [
              {
                display: true,
                scaleLabel: {
                  display: true,
                  labelString: "Дата"
                }
              }
            ],
            yAxes: [
              {
                display: true,
                scaleLabel: {
                  display: true,
                  labelString: "Уровень"
                }
              }
            ]
          },
          legend: {
            position: 'bottom'
          },
          title: {
            display: true,
            text: 'Прогрес по Пип-Бою'
          }
        }
      };

      chartGeneration(config, buffer => {
        msg.reply.photo(buffer, {
          asReply: true,
          caption: `Получи и распишись!`
        }).catch(e => console.log(e));
      })
    });
  });

bot.on('/debug', msg => {
    return msg.reply.text(`Форварды принимаються только от @WastelandWarsBot.
Отменяю твои фоварды - нехуй выебываться.`, {
        asReply: false
    });
});

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

            if (upgradeAmountValidation(pip, skillToUpgrade, upgradeAmount, 1300)) {
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

    return `${giant.distance || '??'}км - *${giant.name}*\n${time} - ${isDead ? '💫 повержен' : `❤️${giant.health.current}`}`;
});

        const reply = `
Текущее состояние по гигантам (МСК):

${_.isEmpty(giantsReply) ? 'Пока что данных нет' : giantsReply.join('\n\n')}

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
            return msg.reply.text(`Прости, я никогда не слышал про этого моба :c`, {
                asReply: true
            })
        }
    });
});

bot.on('/cancel', msg => {
    if(sessions[msg.from.id] === undefined) {
        createSession(msg.from.id);

        return msg.reply.text('Ты вернусля в главное меню', {
            replyMarkup: defaultKeyboard
        });
    }
    if(sessions[msg.from.id].state === states.WAIT_FOR_DATA_TO_PROCESS) {
        return msg.reply.text('Дождись результатов обработки форвардов', {
            asReply: true
        });
    } else {
        createSession(msg.from.id);

        return msg.reply.text('Ты вернусля в главное меню', {
            replyMarkup: defaultKeyboard
        });
    }

})

bot.on('/delete_accaunt', msg => {
    if(process.env.ENV === 'STAGING') {
        userManager.delete(msg.from.id).then(result => {
            if(!result.ok && result.reason === 'USER_NOT_FOUND') {
                return msg.reply.text('Я не смог найти твою запись в базе', {
                    asReply: true
                })
            }

            if(result.ok && result.reason === 'USER_DELETED') {
                return msg.reply.text('Я удалил твою запись в базе', {
                    asReply: true
                })
            }
        })
    }
});

bot.on('/delete_beasts', msg => {
    if(process.env.ENV === 'STAGING') {
        Beast.find({'battles.stamp': {$regex: `.+${msg.from.id}`}}).then(beasts => {
            if(beasts.length === 0) {
                return msg.reply.text('Я не нашёл твоих битв', {
                    asReply: true
                });
            } else {
                async.forEach(beasts, function (databaseBeast, next) {
                    const stampRegexp = new RegExp(`.+${msg.from.id}`);
                    databaseBeast.battles = databaseBeast.battles.filter(battle => {
                        return !stampRegexp.test(battle.stamp);
                    });

                    databaseBeast.save().then(res => {
                        next();
                    });
                }, function (err) {
                    return msg.reply.text('Я удалил твои битвы', {
                        asReply: true
                    });
                });
            }
        });
    }
});

bot.on('callbackQuery', msg => {
    const chatId = msg.from.id;
    const messageId = msg.message.message_id;
    const showMobRegExp = /show_beast_(\d+)-(\d+)/;
    const showEquipmentKeyboardRegExp = /equipment_menu-(.+)/;
    const showLocationsKeyboardRegExp = /locations_menu-(.+)/;
    const showSuppliesKeyboardRegExp = /supplies_menu-(.+)/;
    const showAchievementsKeyboardRegExp = /achievements_menu-(.+)/;
    const showDungeonsKeyboardRegExp = /dungeons_menu-(.+)/;
    const showMobRouteRegExp = /show_beast_page_(.+)-(.+)/;

    if(msg.data === 'update_giants') {
        Giant.find({}).then(giants => {
            bot.answerCallbackQuery(msg.id);

            const giantsReply = _.sortBy(giants, 'distance').map(giant => {
            const isDead = giant.health.current <= 0;
            const time = moment(giant.forwardStamp, 'X').add(3, 'hour').format('DD.MM HH:mm');

            return `${giant.distance || '??'}км - *${giant.name}*\n${time} - ${isDead ? '💫 повержен' : `❤️${giant.health.current}`}`;
        });

                const reply = `
Текущее состояние по гигантам (МСК):

${_.isEmpty(giantsReply) ? 'Пока что данных нет' : giantsReply.join('\n\n')}

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


        Beast.find({isDungeon: false, distanceRange: {$gte: Number(from), $lte: Number(to)}}, 'battles.totalDamageReceived name id').then(beasts => {
            bot.answerCallbackQuery(msg.id);

            const jsonBeasts = beasts.map(b => {
                const jsoned = b.toJSON();

                return {
                    id: b.id,
                    ...jsoned
                }
            });

            const beastsByDamage = _.sortBy(jsonBeasts, v => v.battles.totalDamageReceived);

            const beastsList = beastsByDamage.map(beast => {
                return `
${beast.name}
/mob_${beast.id}`;
            }).join('\n');

            const reply = `
<b>Мобы на ${from}-${to}км</b>
<i>Отсортированы от слабым к сильным</i>
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
    } else if (showEquipmentKeyboardRegExp.test(msg.data)) {
        bot.answerCallbackQuery(msg.id);
        const submenuRegExp = /equipment_menu-(.+)_.+/;

        const [, menu_route] = showEquipmentKeyboardRegExp.exec(msg.data);

        const chosenMenu = objectDeepSearch.findFirst(equipmentMenu, {name: menu_route});

        let buttonsMenu = chosenMenu;

        if(submenuRegExp.test(msg.data)) {
            const [, parentMenuName] = submenuRegExp.exec(msg.data);
            buttonsMenu = objectDeepSearch.findFirst(equipmentMenu, {name: parentMenuName});
        }

        let chosenMenuButtons = processMenu(buttonsMenu).map(menuItem => {
            return bot.inlineButton(menuItem.title, {callback: `equipment_menu-${menuItem.name}`});
        });

        let inlineReplyMarkup = bot.inlineKeyboard(_.chunk(chosenMenuButtons, 3));

        return bot.editMessageText({chatId, messageId}, chosenMenu.text, {
            parseMode: 'markdown',
            replyMarkup: inlineReplyMarkup
        });
    } else if (showLocationsKeyboardRegExp.test(msg.data)) {
        bot.answerCallbackQuery(msg.id);
        const submenuRegExp = /locations_menu-(.+)+/;
        const [, menu_route] = showLocationsKeyboardRegExp.exec(msg.data);
        const chosenMenu = objectDeepSearch.findFirst(locationsMenu, {name: menu_route});
        let buttonsMenu = chosenMenu;

        if(submenuRegExp.test(msg.data)) {
            const [, parentMenuName] = submenuRegExp.exec(msg.data);
            buttonsMenu = objectDeepSearch.findFirst(locationsMenu, {name: parentMenuName});
        }

        let chosenMenuButtons = processMenu(buttonsMenu).map(menuItem => {
            return bot.inlineButton(menuItem.title, {callback: `locations_menu-${menuItem.name}`});
        });

        if (_.isEmpty(chosenMenuButtons)) {
            chosenMenuButtons = processMenu(locationsMenu).map(menuItem => {
                return bot.inlineButton(menuItem.title, {callback: `locations_menu-${menuItem.name}`});
            });
        }

        let inlineReplyMarkup = bot.inlineKeyboard(_.chunk(chosenMenuButtons, 3));

        return bot.editMessageText({chatId, messageId}, chosenMenu.text, {
            parseMode: locationsMenu.config.parseMode,
            replyMarkup: inlineReplyMarkup
        });
    } else if (showSuppliesKeyboardRegExp.test(msg.data)) {
        bot.answerCallbackQuery(msg.id);


        const submenuRegExp = /supplies_menu-(.+)+/;
        const [, menu_route] = showSuppliesKeyboardRegExp.exec(msg.data);
        const chosenMenu = objectDeepSearch.findFirst(suppliesMenu, {name: menu_route});
        let buttonsMenu = chosenMenu;

        if(submenuRegExp.test(msg.data)) {
            const [, parentMenuName] = submenuRegExp.exec(msg.data);
            buttonsMenu = objectDeepSearch.findFirst(suppliesMenu, {name: parentMenuName});
        }

        let chosenMenuButtons = processMenu(buttonsMenu).map(menuItem => {
            return bot.inlineButton(menuItem.title, {callback: `supplies_menu-${menuItem.name}`});
        });

        if (_.isEmpty(chosenMenuButtons)) {
            chosenMenuButtons = processMenu(suppliesMenu).map(menuItem => {
                return bot.inlineButton(menuItem.title, {callback: `supplies_menu-${menuItem.name}`});
            });
        }

        let inlineReplyMarkup = bot.inlineKeyboard(_.chunk(chosenMenuButtons, 3));

        return bot.editMessageText({chatId, messageId}, chosenMenu.text, {
            parseMode: suppliesMenu.config.parseMode,
            replyMarkup: inlineReplyMarkup
        });
    } else if (showAchievementsKeyboardRegExp.test(msg.data)) {
        bot.answerCallbackQuery(msg.id);
        showAchievementsKeyboardRegExp


        const submenuRegExp = /achievements_menu-(.+)+/;
        const [, menu_route] = showAchievementsKeyboardRegExp.exec(msg.data);
        const chosenMenu = objectDeepSearch.findFirst(achievementsMenu, {name: menu_route});
        let buttonsMenu = chosenMenu;

        if(submenuRegExp.test(msg.data)) {
            const [, parentMenuName] = submenuRegExp.exec(msg.data);
            buttonsMenu = objectDeepSearch.findFirst(achievementsMenu, {name: parentMenuName});
        }

        let chosenMenuButtons = processMenu(buttonsMenu).map(menuItem => {
            return bot.inlineButton(menuItem.title, {callback: `achievements_menu-${menuItem.name}`});
        });

        if (_.isEmpty(chosenMenuButtons)) {
            chosenMenuButtons = processMenu(achievementsMenu).map(menuItem => {
                return bot.inlineButton(menuItem.title, {callback: `achievements_menu-${menuItem.name}`});
            });
        }

        let inlineReplyMarkup = bot.inlineKeyboard(_.chunk(chosenMenuButtons, 3));

        return bot.editMessageText({chatId, messageId}, chosenMenu.text, {
            parseMode: achievementsMenu.config.parseMode,
            replyMarkup: inlineReplyMarkup
        });
    } else if (showDungeonsKeyboardRegExp.test(msg.data)) {

        const handler =  _.throttle(() => {
            bot.answerCallbackQuery(msg.id);

            const submenuRegExp = /dungeons_menu-(.+)+/;
            const [, menu_route] = showDungeonsKeyboardRegExp.exec(msg.data);
            const chosenMenu = objectDeepSearch.findFirst(dungeonMenu, {name: menu_route});
            let buttonsMenu = chosenMenu;

            if(submenuRegExp.test(msg.data)) {
                const [, parentMenuName] = submenuRegExp.exec(msg.data);
                buttonsMenu = objectDeepSearch.findFirst(dungeonMenu, {name: parentMenuName});
            }

            let chosenMenuButtons = processMenu(buttonsMenu).map(menuItem => {
                return bot.inlineButton(menuItem.title, {callback: `dungeons_menu-${menuItem.name}`});
            });

            if (_.isEmpty(chosenMenuButtons)) {
                chosenMenuButtons = processMenu(dungeonMenu).map(menuItem => {
                    return bot.inlineButton(menuItem.title, {callback: `dungeons_menu-${menuItem.name}`});
                });
            }

            let inlineReplyMarkup = bot.inlineKeyboard(_.chunk(chosenMenuButtons, 2));

            return bot.editMessageText({chatId, messageId}, chosenMenu.text, {
                parseMode: dungeonMenu.config.parseMode,
                replyMarkup: inlineReplyMarkup
            });
        }, 2500);

        handler();
    } else if (msg.data === 'initialize_skill_upgrade') {
        const skillOMaticText = `
В «<b>🎓 Скилокачаторе</b>» я могу помочь тебе посчитать финансовые затраты на прокачку твоих скилов.`;

    findPip(msg, result => {
        bot.answerCallbackQuery(msg.id);
        if(result.ok && result.reason === 'USER_FOUND') {
            if(sessions[msg.from.id] === undefined) {
                createSession(msg.from.id);
            }

            sessions[msg.from.id].pip = result.data.pip;
            sessions[msg.from.id].state = states.WAIT_FOR_SKILL;

            const replyMarkup = bot.keyboard([
                [buttons.skillSelectStrength.label, buttons.skillSelectAccuracy.label, buttons.skillSelectAgility.label],
                [buttons.skillSelectHealth.label, buttons.skillSelectCharisma.label],
                [buttons.cancelAction.label]
            ], {
                resize: true
            });

            const skillMap = {
                "health": "❤ Живучесть",
                "strength": "💪 Сила",
                "precision": "🔫 Меткость",
                "charisma": "🗣 Харизма",
                "agility": "🤸‍♀️ Ловкость"
            };

            const userSkills = Object.keys(skillMap).map(key => {
                const skillName = skillMap[key];

                return `<b>${skillName}</b>: ${result.data.pip[key]}`;
            })

            return bot.sendMessage(msg.from.id, `
${skillOMaticText}

Вот что я знаю про твои скилы:
${userSkills.join('\n')}
<i>(Если они не акутальные - просто отправь мне свой новый пип-бой)</i>


<b>Выбери какой скил ты хочешь прокачать</b>

Что бы вернуться в меню - нажми кнопку <code>[↩️Назад]</code>.
Либо, в любой момент напиши /cancel.
            `, {
                replyMarkup,
                parseMode: 'html'
            });
        }

        return bot.sendMessage(msg.from.id, `
${skillOMaticText}

Оу, похоже я ещё ничего не знаю про твой пип :с
Перейди в игру по кнопке внизу и перешли мне его пожалуйста!
        `, {
            replyMarkup: toGameKeyboard,
            parseMode: 'html'
        });
    });
    }
});



bot.start();