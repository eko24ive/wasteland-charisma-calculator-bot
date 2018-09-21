// TODO: Supply it with pip from database (with appropriate validation just like from the processForwards)

process.on('unhandledRejection', (reason) => {
  console.log('Unhandled Rejection at:', reason.stack || reason);
});

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
  regExpSetMatcher,
} = require('./src/utils/matcher');
const calculateUpgrade = require('./src/calculateUpgrade');
const upgradeAmountValidation = require('./src/utils/upgradeAmountValidation');
const processForwards = require('./src/utils/processForwards');
const { ranges, dzRanges } = require('./src/utils/getRanges');
const processMenu = require('./src/utils/processMenu');

const routedBeastView = require('./src/views/routedBeastView');
const routedBattleView = require('./src/views/routedBattleView');

const equipmentMenu = require('./src/staticMenus/equipmentMenu');
const locationsMenu = require('./src/staticMenus/locationsMenu');
const suppliesMenu = require('./src/staticMenus/suppliesMenu');
const achievementsMenu = require('./src/staticMenus/achievementsMenu');
const dungeonMenu = require('./src/staticMenus/dungeonMenu');

const buttons = require('./src/ui/buttons');
const {
  commandsForLag,
} = require('./src/strings/strings');
const withBackButton = require('./src/utils/withBackButton');

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
  WAIT_FOR_DATA_TO_PROCESS,
};

const createSession = (id) => {
  sessions[id] = {
    pip: null,
    state: states.WAIT_FOR_START,
    data: [],
    processDataConfig: {
      usePip: true,
      useBeastFace: true,
      silent: false,
    },
  };
};

const getToken = () => {
  if (program.dev) {
    console.log('RUNNING IN TEST MODE');
    return process.env.BOT_TOKEN_TEST;
  } if (program.prod) {
    console.log('RUNNING IN PRODUCTION MODE');
    return process.env.BOT_TOKEN;
  }

  throw new Error('Please, specify bot token mode "--dev" for development and "--prod" production');
};

const bot = new TeleBot({
  token: getToken(),
  usePlugins: ['namedButtons'],
  polling: {
    interval: 100, // How often check updates (in ms).
    limit: 500, // Limits the number of updates to be retrieved.
    retryTimeout: 1000, // Reconne   cting timeout (in ms).
  },
  pluginConfig: {
    namedButtons: {
      buttons,
    },
  },
});

const updateOrCreate = (msg, pip, cb) => {
  const telegramData = {
    first_name: msg.from.first_name,
    id: msg.from.id,
    username: msg.from.username,
  };

  const pipData = { ...pip, timeStamp: pip.date };

  userManager.findByTelegramId(msg.from.id).then((result) => {
    if (result.ok === false && result.reason === 'USER_NOT_FOUND') {
      userManager.create({ telegramData, pipData }).then((createResult) => {
        cb(createResult);
      });
    } else if (result.ok === true && result.reason === 'USER_FOUND') {
      userManager.update({ telegramData, pipData }).then((updateResult) => {
        cb(updateResult);
      });
    }
  });
};

const findPip = (msg, cb) => {
  userManager.findByTelegramId(msg.from.id).then((result) => {
    cb(result);
  });
};

const askAmountOfLevels = (msg) => {
  const replyMarkup = bot.keyboard([
    [
      buttons.amountOfLevelsTen.label,
      buttons.amountOfLevelsTwenty.label,
      buttons.amountOfLevelsThirty.label,
    ],
    [
      buttons.amountOfLevelsFourty.label,
      buttons.amountOfLevelsFifty.label,
      buttons.amountOfLevelsSixty.label,
    ],
    [
      buttons.amountOfLevelsMAX.label,
    ],
  ], {
    resize: true,
  });

  return msg.reply.text(`
Выбери на сколько уровней ты хочешь прокачать *${sessions[msg.from.id].upgradeSkill}*
\`Либо напиши своё количество (например: 17)\`
`, {
    replyMarkup,
    parseMode: 'markdown',
  });
};

const askReachableKm = (msg) => {
  const replyMarkup = bot.keyboard([
    [
      buttons.reachableKm20.label,
      buttons.reachableKm30.label,
      buttons.reachableKm40.label,
    ],
    [

      buttons.reachableKm56.label,
      buttons.reachableKm65.label,
      buttons.reachableKm70.label,
    ],
  ], {
    resize: true,
  });

  return bot.sendMessage(msg.from.id, 'Выбери до какого километра ты ходишь (при этом оставаясь в живих)?\n'
        + '`Либо напиши своё количество (например: 28)`', {
    replyMarkup,
    parseMode: 'markdown',
  });
};


const defaultKeyboard = bot.keyboard([
  [
    buttons.journeyForwardStart.label,
    buttons.skillUpgrade.label,
    buttons.showEncyclopedia.label,
  ],
  [
    buttons.showRegularBeasts.label,
    buttons.showDarkZoneBeasts.label,
    buttons.showGiants.label,
  ],
  [
    buttons.hallOfFame.label,
    buttons.showHelp.label,
  ],
], {
  resize: true,
});

const getEffort = (msg, toMax = false) => {
  if (sessions[msg.from.id].state === states.WAIT_FOR_START) {
    return false;
  }

  sessions[msg.from.id].state = states.WAIT_FOR_RESPONSE;

  sessions[msg.from.id].amountToUpgrade = toMax || msg.text;

  const effort = calculateUpgrade(sessions[msg.from.id], { toMax });
  const { pip } = sessions[msg.from.id];


  console.log(`[SKILL UPGRADE]: ${pip.faction} | ${pip.name} | ${msg.from.username}`);

  createSession(msg.from.id);

  return msg.reply.text(effort, {
    replyMarkup: defaultKeyboard,
    parseMode: 'markdown',
  });
};

const encyclopediaKeyboard = [
  [

    buttons.showEquipment.label,
    buttons.showSupplies.label,
    buttons.showDrones.label,
  ],
  [
    buttons.showDungeons.label,
    buttons.showLocations.label,
    buttons.showAchievments.label,
  ],
];

const toGameKeyboard = bot.inlineKeyboard([
  [
    bot.inlineButton('📟 Перейти в игру.', { url: 'https://t.me/WastelandWarsBot' }),
  ],
]);

const toSkillOMaticKeyboard = bot.inlineKeyboard([
  [
    bot.inlineButton('Запустить "🎓Скилокачатор"', { callback: 'initialize_skill_upgrade' }),
  ],
]);


const getBeastKeyboard = beastId => bot.inlineKeyboard([
  [
    bot.inlineButton('Инфо', { callback: `show_beast_page_info-${beastId}` }),
    bot.inlineButton('Лут', { callback: `show_beast_page_loot-${beastId}` }),
    bot.inlineButton('Бой', { callback: `show_beast_page_battles-${beastId}` }),
    bot.inlineButton('Оглушения', { callback: `show_beast_page_concussions-${beastId}` }),
  ],
]);


bot.on(['/start', '/help'], (msg) => {
  createSession(msg.from.id);

  return msg.reply.text(
    `
Привет, меня зовут «<b>Wasteland Wars Assistant</b>», я - что-то на подобии "умной" энциклопедии.

⬦ Если хочешь посмотреть что я знаю о мобе которого ты встретил - скинь форвард встречи с ним.

<code>[Скинуть лог 🏃]</code> - Запуск режима "ЛОГ". В этом режиме ты можешь переслать сюда сообщения от игрового бота.

<code>[🎓Скилокачатор]</code> - Запуск «<b>Скилокачатора</b>» - анализатора в прокачке твоих скилов 

<code>[💀Мобы]</code> - Информация об <b>обычных</b> мобах

<code>[🚷Мобы ТЗ]</code> - Информация о мобах из <b>Тёмной Зоны</b>

<code>[🦂Гиганты]</code> - Состояние гигантов

<code>[🏆 Зал Славы]</code> - Благодарности всем тем кто когда-либо оказалась поддержку в работе над ботом


КАНАЛ С НОВОСТЯМИ @wwAssistantBotNews
ЧАТ БЫСТРОГО РЕАГИРОВАНИЯ @wwAssistantChat

<i>Учти, что я ещё нахожусь в бета-режиме, и иногда ты можешь наткнуться на большие и маленькие баги.</i>
        `, {
      replyMarkup: defaultKeyboard,
      parseMode: 'html',
      webPreview: false,
    },
  );
});

const actualProcessUserData = (msg, reportData, updatesData, options) => {
  if (reportData.lastPip !== null) {
    updateOrCreate(msg, reportData.lastPip, (result) => {
      console.log(result);
    });
  }

  if (options.useBeastFace && !_.isEmpty(reportData.beastToValidate)) {
    sessions[msg.from.id].state = states.WAIT_FOR_BEAST_FACE_FORWARD;
    sessions[msg.from.id].beastToValidateName = reportData.beastToValidate[0].name;
    sessions[msg.from.id].beastToValidateType = reportData.beastToValidate[0].type;
    return msg.reply.text(`
Слушай, я не могу понять с кем это были у тебя рамсы.
Пожалуйста скинь форвард встречи с ${reportData.beastToValidate[0].type === 'DarkZone' ? '🚷' : ''}${reportData.beastToValidate[0].name}

Пожалуйста скинь форвард встречи с этим мобом:
\`Во время вылазки на тебя напал...\`
_или_
\`...перегородил тебе путь.\`
_или_
\`устрашающе начал приближаться\`

Если у тебя нет на это времени жми /skipbeastforward

*ВНИМАНИЕ: ПРИ НАЖАТИИ НА /skipbeastforward - БОТ ПРОИГНОРИРУЕТ ТОЛЬКО РЕЗУЛЬТАТ ТВОЕЙ БИТВЫ С ${reportData.beastToValidate[0].name} НЕ ЗАПИШЕТ ИХ В БАЗУ*
  `, {
      parseMode: 'markdown',
    }).catch(e => console.log(e));
  }


  if (!options.silent) {
    msg.reply.text('Перехожу в режим обработки данных, подожди пожалуйста немного :3', {
      replyMarkup: 'hide',
    }).catch(e => console.log(e));
  }


  let userForwardPoints = 0;
  let dataProcessed = 0;
  const dupes = {
    battles: 0,
    flees: 0,
  };

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
    console.log(`[USAGE]: ${reportData.lastPip.faction} | ${reportData.lastPip.name} | ${msg.from.username}`);
  } catch (e) {
    return false;
  }

  const isBeastUnderValidation = name => reportData.beastToValidate.filter(beast => beast.name === name).length > 0;

  const processBeasts = () => new Promise((resolve) => {
    if (updatesData.beasts.length > 0 && options.usePip === true) {
      async.forEach(updatesData.beasts, (iBeast, next) => {
        if (!options.useBeastFace) {
          if (isBeastUnderValidation(iBeast.name)) {
            next();
          }
        } else {
          Beast.findOne({
            name: iBeast.name,
            isDungeon: iBeast.isDungeon,
            type: iBeast.type,
          }).then((fBeast) => {
            const databaseBeast = fBeast;
            if (databaseBeast === null) {
              const newBeast = new Beast(iBeast);

              dataProcessed += 1;

              if (iBeast.type === 'DarkZone') {
                userForwardPoints += forwardPoints.newMob * forwardPoints.darkZoneBattle;
              } else {
                userForwardPoints += forwardPoints.newMob * forwardPoints.regularZoneBattle;
              }

              newBeast.save().then(() => next());
            } else {
              let isSameFleeExists = true;
              let isSameConcussionExists = true;
              let isSameBattleExists = true;
              let isBattleDupe = false;
              let isFleeDupe = false;
              let beastPoints = 0;

              if (iBeast.battles) {
                if (iBeast.battles.length > 0) {
                  isSameBattleExists = databaseBeast.battles.map((battle) => {
                    if (iBeast.battles === undefined) {
                      return true;
                    }

                    const existingBattle = _.clone(battle.toJSON());
                    const sameStatsBattle = existingBattle.totalDamageReceived === iBeast.battles[0].totalDamageReceived
                                              && existingBattle.totalDamageGiven === iBeast.battles[0].totalDamageGiven;
                    const sameStamp = iBeast.battles[0].stamp === existingBattle.stamp;

                    if (sameStamp) {
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
                  isSameConcussionExists = databaseBeast.concussions.map((concussion) => {
                    const existingConcussion = _.clone(concussion.toJSON());

                    return existingConcussion.stats.agility === iBeast.concussions[0].stats.agility
                                                  && existingConcussion.amount === iBeast.concussions[0].amount;
                  }).some(result => result === true);
                }
              }

              if (iBeast.flees) {
                if (iBeast.flees.length === 1) {
                  isSameFleeExists = databaseBeast.flees.map((flee) => {
                    const existingFlee = _.clone(flee.toJSON());

                    if (iBeast.flees[0].outcome === 'win') {
                      return existingFlee.stats.agility === iBeast.flees[0].stats.agility
                                                      && existingFlee.outcome === iBeast.flees[0].outcome;
                    }

                    const sameStatsFlee = existingFlee.stats.agility === iBeast.flees[0].stats.agility
                                              && existingFlee.outcome === iBeast.flees[0].outcome
                                              && existingFlee.damageReceived === iBeast.flees[0].damageReceived;
                    const sameStamp = iBeast.flees[0].stamp === flee.stamp;

                    if (sameStamp) {
                      isFleeDupe = true;
                      dupes.flees += 1;
                    }

                    return sameStatsFlee || sameStamp;
                  }).some(result => result === true);
                }
              }

              if (!_.isEmpty(iBeast.receivedItems)) {
                if (_.isEmpty(databaseBeast.receivedItems)) {
                  databaseBeast.receivedItems = {};
                }

                Object.keys(iBeast.receivedItems).forEach((item) => {
                  const amount = iBeast.receivedItems[item];

                  if (databaseBeast.receivedItems[item]) {
                    if (!_.contains(databaseBeast.receivedItems[item], amount)) {
                      databaseBeast.receivedItems[item].push(amount);
                    }
                    // TODO: Apply to similar
                    databaseBeast.markModified('receivedItems');
                  } else {
                    databaseBeast.markModified('receivedItems');
                    databaseBeast.receivedItems[item] = [amount];
                  }
                });
              }

              if (!isBattleDupe) {
                if (!_.contains(databaseBeast.distanceRange, iBeast.distanceRange[0])) {
                  beastPoints += forwardPoints.newDistance;

                  databaseBeast.distanceRange.push(iBeast.distanceRange[0]);
                } else {
                  beastPoints += forwardPoints.sameGiantData;
                }
              }

              if (iBeast.capsReceived !== undefined) {
                if (!_.contains(databaseBeast.capsReceived, iBeast.capsReceived)) {
                  databaseBeast.capsReceived.push(iBeast.capsReceived);
                }
              }

              if (iBeast.materialsReceived !== undefined) {
                if (!_.contains(databaseBeast.materialsReceived, iBeast.materialsReceived)) {
                  databaseBeast.materialsReceived.push(iBeast.materialsReceived);
                }
              }

              if (!isBattleDupe) {
                if (!isSameBattleExists) {
                  const battle = iBeast.battles[0];

                  if (battle.damagesGiven.length === 1) {
                    beastPoints += forwardPoints.oneShotBattle;
                  } else if (battle.outcome === 'win') {
                    beastPoints += forwardPoints.newBattleWin;
                  } else {
                    beastPoints += forwardPoints.newBattleLose;
                  }

                  databaseBeast.battles.push(iBeast.battles[0]);
                } else if (iBeast.battles !== undefined) {
                  const battle = iBeast.battles[0];

                  if (battle.damagesGiven.length === 1) {
                    beastPoints += forwardPoints.oneShotBattle;
                  } else if (battle.outcome === 'win') {
                    beastPoints += forwardPoints.sameBattleWin;
                  } else {
                    beastPoints += forwardPoints.sameBattleLose;
                  }
                }
              }

              if (!isSameConcussionExists && !isBattleDupe) {
                databaseBeast.concussions.push(iBeast.concussions[0]);
              }

              if (!isFleeDupe) {
                if (!isSameFleeExists) {
                  const flee = iBeast.flees[0];

                  if (flee.outcome === 'win') {
                    beastPoints += forwardPoints.newFleeWin;
                  } else {
                    beastPoints += forwardPoints.newFleeLose;
                  }

                  databaseBeast.flees.push(iBeast.flees[0]);
                } else if (iBeast.flees !== undefined) {
                  const flee = iBeast.flees[0];

                  if (flee.outcome === 'win') {
                    beastPoints += forwardPoints.sameFleeWin;
                  } else {
                    beastPoints += forwardPoints.sameFleeLose;
                  }
                }
              }

              dataProcessed += 1;

              // TODO: Concussion
              // TODO: Received items

              if (iBeast.type === 'DarkZone') {
                userForwardPoints += beastPoints * forwardPoints.darkZoneBattle;
              } else {
                userForwardPoints += beastPoints * forwardPoints.regularZoneBattle;
              }

              databaseBeast.save().then(() => next()).catch(e => console.log(e));
            }
          });
        }
      }, () => {
        resolve();
      });
    } else {
      resolve();
    }
  }, (() => {
    // console.log('iterating done');
  }));

  const processLocations = () => new Promise((resolve) => {
    if (updatesData.locations.length > 0) {
      async.forEach(updatesData.locations, (iLocation, next) => {
        Location.findOne({
          distance: iLocation.distance,
        }).then((databaseLocation) => {
          if (databaseLocation === null) {
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
              healthInjuries: [iLocation.healthInjuries],
            });

            dataProcessed += 1;

            newLocation.save().then(() => next());
          } else {
            if (!_.contains(databaseLocation.effects, iLocation.effect)) {
              databaseLocation.effects.push(iLocation.effect);
            }

            if (!_.contains(databaseLocation.capsReceived, iLocation.capsReceived)) {
              databaseLocation.capsReceived.push(iLocation.capsReceived);
            }

            if (!_.contains(databaseLocation.materialsReceived, iLocation.materialsReceived)) {
              databaseLocation.materialsReceived.push(iLocation.materialsReceived);
            }

            if (!_.contains(databaseLocation.capsLost, iLocation.capsLost)) {
              databaseLocation.capsLost.push(iLocation.capsLost);
            }

            if (!_.contains(databaseLocation.materialsLost, iLocation.materialsLost)) {
              databaseLocation.materialsLost.push(iLocation.materialsLost);
            }

            if (!_.contains(databaseLocation.healthInjuries, iLocation.healthInjuries)) {
              databaseLocation.healthInjuries.push(iLocation.healthInjuries);
            }

            if (!_.isEmpty(iLocation.receivedBonusItems)) {
              Object.keys(iLocation.receivedBonusItems).forEach((item) => {
                const amount = iLocation.receivedBonusItems[item];

                if (!_.isEmpty(databaseLocation.receivedBonusItems)) {
                  if (databaseLocation.receivedBonusItems[item]) {
                    // FIXME: TypeError: databaseLocation.receivedBonusItems[item].push is not a function

                    if (!_.contains(databaseLocation.receivedBonusItems[item], amount)) {
                      // databaseLocation.receivedBonusItems[item].push(amount);
                    }
                  } else {
                    databaseLocation.receivedBonusItems[item] = [amount];
                  }
                }
              });
            }

            dataProcessed += 1;

            databaseLocation.save().then(() => next());
          }
        });
      }, () => {
        resolve();
      });
    } else {
      resolve();
    }
  });


  Promise.all([
    processBeasts(),
    processLocations(),
  ]).then(() => {
    let errors = '';
    let dupesText = '';
    let reply;

    if (reportData.errors.length > 0) {
      errors = `
      *Также я заметил такие вещи*:
      ${reportData.errors.join('\n')}
              `;
    }

    if (dupes.battles > 0 || dupes.flees > 0) {
      dupesText = 'Похоже ты скидывал некоторые форварды по второму разу. Я не начислял тебе за них очки';
    }

    if (dataProcessed > 0) {
      // TODO: Move out shit to strings
      // TODO: Implement meaningfull report data regarding found usefull data
      setTimeout(() => {
        if (options.silent) {
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
          asReply: options.silent,
        }).then(() => {
          userManager.addPoints(msg.from.id, userForwardPoints).then((result) => {
            if (!result.ok) {
              if (result.reason === 'USER_NOT_FOUND') {
                msg.reply.text('Не могу начислить тебе шмепсели пока ты не скинешь мне свой пип-бой :с');
              }
              console.log(`userManager.addPoints: ${JSON.stringify(result)}`);
            }
          });
        }).catch(e => console.log(e));
      }, 1500);
    } else {
      setTimeout(() => {
        msg.reply.text(`
  К сожалению я ничего не смог узнать из твоих форвардов :с`, {
          replyMarkup: defaultKeyboard,
          parseMode: 'markdown',
        });
      }, 1500);
    }

    createSession(msg.from.id);
  }).catch(e => console.log(e));

  return false;
};

const processUserData = (msg, options) => {
  sessions[msg.from.id].state = states.WAIT_FOR_DATA_TO_PROCESS;

  const {
    data,
  } = sessions[msg.from.id];

  let {
    reportData,
    updatesData,
  } = processForwards(data);

  if (reportData.criticalError) {
    return msg.reply.text(`<b>❌ЗАМЕЧЕНА КРИТИЧЕСКАЯ ОШИБКА❌</b>\n\n${reportData.criticalError}\n\n<i>Форварды были отменены.</i>`, {
      replyMarkup: defaultKeyboard,
      parseMode: 'html',
    });
  }


  if (updatesData.locations.length === 0 && updatesData.beasts.length === 0) {
    return msg.reply.text(`
  К сожалению я ничего не смог узнать из твоих форвардов :с`, {
      replyMarkup: defaultKeyboard,
      parseMode: 'markdown',
    });
  }

  if (options.usePip && reportData.pipRequired) {
    userManager.findByTelegramId(msg.from.id).then((result) => {
      if (result.ok && result.reason === 'USER_FOUND') {
        if (result.data.pip !== undefined) {
          sessions[msg.from.id].data.push({
            data: result.data.pip,
            dataType: 'pipboy',
            date: result.data.pip.timeStamp,
          });
        }


        const {
          reportData: reportDataWithUserPip,
          updatesData: updatesDataWithUserPip,
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
            replyMarkup: toGameKeyboard,
          });
        } if (reportDataWithUserPip.criticalError && !reportDataWithUserPip.couldBeUpdated) {
          createSession(msg.from.id);
          return msg.reply.text('Твой пип не соответсвуют твоим статам из форвардам!\nПрости, я вынужден отменить твои форварды.', {
            replyMarkup: defaultKeyboard,
          });
        }
        updatesData = updatesDataWithUserPip;
        reportData = reportDataWithUserPip;

        actualProcessUserData(msg, reportData, updatesData, options);
      } else {
        sessions[msg.from.id].state = states.WAIT_FOR_PIP_FORWARD;
        return msg.reply.text(`
  Похоже ты мне ещё не скидывал пип бой
  Если у тебя нет на это времени жми /skippipforward
  
  *ВНИМАНИЕ: ПРИ НАЖАТИИ НА /skippipforward - БОТ ПРОИГНОРИРУЕТ ТВОИ БИТВЫ И ПОБЕГИ ОТ МОБОВ И НЕ ЗАПИШЕТ ИХ В БАЗУ*
  `, {
          parseMode: 'markdown',
          replyMarkup: toGameKeyboard,
        });
      }

      return false;
    }).catch(e => console.log(e));
  } else {
    userManager.findByTelegramId(msg.from.id).then((result) => {
      // BOOK
      if (result.ok && result.reason === 'USER_FOUND') {
        actualProcessUserData(msg, reportData, updatesData, options);
      } else {
        actualProcessUserData(msg, reportData, updatesData, options);
      }
    });
  }

  return false;
};

bot.on('forward', (msg) => {
  if (sessions[msg.from.id] === undefined) {
    createSession(msg.from.id);
  }

  if (msg.forward_from.id !== 430930191) {
    if (sessions[msg.from.id].state !== states.WAIT_FOR_FORWARD_END) {
      console.log(`[CULPRIT]: ${msg.from.id} | ${msg.from.first_name} | ${msg.from.username}`);

      // createSession(msg.from.id);

      return msg.reply.text(`
Форварды принимаються только от @WastelandWarsBot.
            `, {
        asReply: true,
        replyMarkup: defaultKeyboard,
      });
    }
  }

  if (sessions[msg.from.id].state === states.WAIT_FOR_PIP_FORWARD) {
    const isClassicPip = regExpSetMatcher(msg.text, {
      regexpSet: PipRegexps.classicPip,
    });

    const isSimplePip = regExpSetMatcher(msg.text, {
      regexpSet: PipRegexps.simplePip,
    });

    if (isClassicPip || isSimplePip) {
      const data = parsePip(msg, isClassicPip);
      const dataType = 'pipboy';
      let reply;

      updateOrCreate(msg, data, (result) => {
        if (!result.ok && result.reason === 'PIP_VALIDATION_FAILED') {
          reply = `Я не вижу что бы ты прокачал какие-то скилы :c
Скидывай пип-бой как только прокачаешься!`;
        }

        if (!result.ok && result.reason === 'PIP_OUTDATED') {
          reply = 'У меня в базе есть более актуальная запись про твой пип-бой';
        }

        if (result.ok && result.reason === 'USER_CREATED') {
          reply = `
Супер, я сохранил твой пип!
Не забывай скидывать мне свой пип-бой по мере того как будешь прокачивать скилы!`;
        }

        if (result.ok && result.reason === 'USER_UPDATED') {
          reply = `Шикардос, я обновил твой пип!
Не забудь скинуть новый пип, когда качнешься!`;
        }

        if (result.ok) {
          return msg.reply.text(`${reply}\nТеперь я займусь твоими форвардами`).then(() => {
            sessions[msg.from.id].data.push({
              data,
              dataType,
              date: msg.forward_date,
            });

            processUserData(msg, {
              usePip: sessions[msg.from.id].processDataConfig.usePip,
              useBeastFace: sessions[msg.from.id].processDataConfig.useBeastFace,
            });
          });
        }
        return msg.reply.text(reply, {
          asReply: true,
        });
      });
    } else {
      return msg.reply.text(`
Это не похоже на пип-бой. Если ты передумал его кидать - жми /skippipforward

*Но тогда я проигнорирую битвы и побеги от мобов*
            `, {
        asReply: true,
      });
    }
  } if (sessions[msg.from.id].state === states.WAIT_FOR_BEAST_FACE_FORWARD) {
    // TODO: Validate forward date - should be greater that date of the first forward and less than date of last forward

    let data;
    let dataType;
    let beastName;
    let beastType;

    const isLocation = regExpSetMatcher(msg.text, {
      regexpSet: regexps.location,
    });

    const isDungeonBeastFaced = regExpSetMatcher(msg.text, {
      regexpSet: regexps.dungeonBeastFaced,
    });

    if (isDungeonBeastFaced) {
      data = parseBeastFaced.parseDungeonBeastFaced(msg.text);
      dataType = 'dungeonBeastFaced';
      beastName = data.name;
    } else if (isLocation) {
      data = parseLocation(msg.text);
      dataType = 'location';
      beastName = data.beastFaced.name;
      beastType = data.beastFaced.type;
    }

    if (beastName !== sessions[msg.from.id].beastToValidateName || sessions[msg.from.id].beastToValidateName !== '???' || sessions[msg.from.id].beastToValidateType !== beastType) {
      return msg.reply.text(`
Этот моб не похож на того с которым ты дрался. Ты чё - наебать меня вздумал?!

Если ты передумал её кидать - жми /skipbeastforward
<b>Но тогда я проигнорирую битву с этим мобом</b>
            `, {
        asReply: true,
        parseMode: 'html',
      });
    } if (isLocation || isDungeonBeastFaced) {
      sessions[msg.from.id].data.push({
        data,
        dataType,
        date: msg.forward_date,
      });

      msg.reply.text('Супер, я вижу встречу с мобом - сейчас обработаю её вместе с твоими форвардами').then(() => processUserData(msg, {
        usePip: sessions[msg.from.id].processDataConfig.usePip,
        useBeastFace: sessions[msg.from.id].processDataConfig.useBeastFace,
      }));
    } else {
      return msg.reply.text(`
Это не похоже на встречу моба. Если ты передумал её кидать - жми /skipbeastforward

*Но тогда я проигнорирую битву с этим мобом*
            `, {
        asReply: true,
      });
    }
  } else if (sessions[msg.from.id].state === states.WAIT_FOR_FORWARD_END) {
    let data;
    let dataType;

    const isLocation = regExpSetMatcher(msg.text, {
      regexpSet: regexps.location,
    });

    const isRegularBeast = regExpSetMatcher(msg.text, {
      regexpSet: regexps.regularBeast,
    });

    const isDungeonBeast = regExpSetMatcher(msg.text, {
      regexpSet: regexps.dungeonBeast,
    });

    const isFlee = regExpSetMatcher(msg.text, {
      regexpSet: regexps.flee,
    });

    const isDeathMessage = regExpSetMatcher(msg.text, {
      regexpSet: regexps.deathMessage,
    });

    const isDungeonBeastFaced = regExpSetMatcher(msg.text, {
      regexpSet: regexps.dungeonBeastFaced,
    });

    const isClassicPip = regExpSetMatcher(msg.text, {
      regexpSet: PipRegexps.classicPip,
    });

    const isSimplePip = regExpSetMatcher(msg.text, {
      regexpSet: PipRegexps.simplePip,
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
      data = { ...parsePip(msg, isClassicPip) };
      dataType = 'pipboy';
    } else if (isDungeonBeast) {
      data = beastParser.parseDungeonBeast(msg.text);
      dataType = 'dungeonBeast';
    }

    if (isRegularBeast || isLocation || isFlee || isDeathMessage || isDungeonBeastFaced || (isClassicPip || isSimplePip) || isDungeonBeast) {
      sessions[msg.from.id].data.push({
        data,
        dataType,
        date: msg.forward_date,
        userId: msg.from.id,
      });
    }
  } else if (
    sessions[msg.from.id].state !== states.WAIT_FOR_PIP_FORWARD
        && sessions[msg.from.id].state !== states.WAIT_FOR_BEAST_FACE_FORWARD
        && sessions[msg.from.id].state !== states.WAIT_FOR_FORWARD_END
  ) {
    const isClassicPip = regExpSetMatcher(msg.text, {
      regexpSet: PipRegexps.classicPip,
    });

    const isSimplePip = regExpSetMatcher(msg.text, {
      regexpSet: PipRegexps.simplePip,
    });

    const isRegularBeastFaced = regExpSetMatcher(msg.text, {
      regexpSet: regexps.regularBeastFaced,
    });

    const isGiantFaced = regExpSetMatcher(msg.text, {
      regexpSet: regexps.giantFaced,
    });

    const isGiantFought = regExpSetMatcher(msg.text, {
      regexpSet: regexps.giantFought,
    });

    const isGiantOnField = regExpSetMatcher(msg.text, {
      regexpSet: regexps.giantFacedOnField,
    });

    const isDungeonBeastFaced = regExpSetMatcher(msg.text, {
      regexpSet: regexps.dungeonBeastFaced,
    });

    const isRegularBeast = regExpSetMatcher(msg.text, {
      regexpSet: regexps.regularBeast,
    });

    const isFlee = regExpSetMatcher(msg.text, {
      regexpSet: regexps.flee,
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
      updateOrCreate(msg, pip, (result) => {
        if (!result.ok && result.reason === 'PIP_VALIDATION_FAILED') {
          reply = `Я не вижу что бы ты прокачал какие-то скилы :c
Скидывай пип-бой как только прокачаешься!`;
        }

        if (!result.ok && result.reason === 'PIP_OUTDATED') {
          reply = 'У меня в базе есть более актуальная запись про твой пип-бой';
        }

        if (result.ok && result.reason === 'USER_CREATED') {
          reply = `
Супер, я сохранил твой пип!
Не забывай скидывать мне свой пип-бой по мере того как будешь прокачивать скилы!`;
        }

        if (result.ok && result.reason === 'USER_UPDATED') {
          reply = `Шикардос, я обновил твой пип!
Не забудь скинуть новый пип, когда качнешься!`;
        }

        return msg.reply.text(reply, {
          asReply: true,
          replyMarkup: toSkillOMaticKeyboard,
        }).catch(e => console.log(e));
      });
    } else if (isGiantFaced) {
      const giant = parseGiantFaced(msg.text);

      Giant.findOne({
        name: giant.name,
        distance: giant.distance,
      }).then((fGiant) => {
        const databaseGiant = fGiant;
        if (databaseGiant === null) {
          const newGiant = new Giant({
            distance: giant.distance,
            name: giant.name,
            health: {
              current: giant.healthCurrent,
              cap: giant.healthCap,
            },
            forwardStamp: msg.forward_date,
          });

          newGiant.save().then(() => msg.reply.text('Спасибо за форвард! Я добавил его в базу!', {
            asReply: true,
          })).catch(e => console.log(e));
        } else {
          const time = Number(moment.tz(moment().valueOf(), 'Europe/Moscow').format('X'));

          if (databaseGiant.forwardStamp >= time) {
            return msg.reply.text(`Прости, у меня есть более свежая иформация про *${giant.name}*`, {
              asReply: true,
              parseMode: 'markdown',
            });
          }
          databaseGiant.health.current = giant.healthCurrent;
          databaseGiant.health.cap = giant.healthCap;
          databaseGiant.forwardStamp = time;

          databaseGiant.save().then(() => msg.reply.text(`Спасибо за форвард! Я обновил ${giant.name} в базе!`, {
            asReply: true,
          })).catch(e => console.log(e));
        }

        return false;
      });
    } else if (isGiantFought) {
      const giant = parseGiant(msg.text);

      Giant.findOne({
        name: giant.name,
      }).then((fGiant) => {
        const databaseGiant = fGiant;
        if (databaseGiant === null) {
          const newGiant = new Giant({
            name: giant.name,
            health: {
              current: giant.healthCurrent,
              cap: giant.healthCap,
            },
            forwardStamp: msg.forward_date,
          });

          newGiant.save().then(() => msg.reply.text('Спасибо за форвард! Я добавил его в базу!', {
            asReply: true,
          }).then(() => {
            userManager.addPoints(msg.from.id, forwardPoints.newGiantData).then((result) => {
              if (!result.ok) {
                if (result.reason === 'USER_NOT_FOUND') {
                  msg.reply.text('Не могу начислить тебе шмепсели пока ты не скинешь мне свой пип-бой :с');
                }
                // console.log('userManager.addPoints: '+JSON.stringify(result));
              }
            });
          })).catch(e => console.log(e));
        } else if (databaseGiant.forwardStamp >= msg.forward_date) {
          return msg.reply.text(`Прости, у меня есть более свежая иформация про *${giant.name}*`, {
            asReply: true,
            parseMode: 'markdown',
          });
        } else {
          databaseGiant.health.current = giant.healthCurrent;
          databaseGiant.health.cap = giant.healthCap;
          databaseGiant.forwardStamp = msg.forward_date;

          databaseGiant.save().then(() => msg.reply.text(`Спасибо за форвард! Я обновил ${giant.name} в базе!`, {
            asReply: true,
          }).then(() => {
            userManager.addPoints(msg.from.id, forwardPoints.newGiantData).then((result) => {
              if (!result.ok) {
                if (result.reason === 'USER_NOT_FOUND') {
                  msg.reply.text('Не могу начислить тебе шмепсели пока ты не скинешь мне свой пип-бой :с');
                }
                // console.log('userManager.addPoints: '+JSON.stringify(result));
              }
            });
          })).catch(e => console.log(e));
        }

        return false;
      });
    } else if (isGiantOnField) {
      const giant = parseGiantOnField(msg.text);

      Giant.findOne({
        name: giant.name,
      }).then((fGiant) => {
        const databaseGiant = fGiant;
        if (fGiant === null) {
          const newGiant = new Giant({
            name: giant.name,
            health: {
              current: giant.healthCurrent,
              cap: giant.healthCap,
            },
            forwardStamp: msg.forward_date,
          });

          newGiant.save().then(() => msg.reply.text('Спасибо за форвард! Я добавил его в базу!', {
            asReply: true,
          })).catch(e => console.log(e));
        } else if (fGiant.forwardStamp >= msg.forward_date) {
          return msg.reply.text(`Прости, у меня есть более свежая иформация про *${giant.name}*`, {
            asReply: true,
            parseMode: 'markdown',
          });
        } else {
          databaseGiant.health.current = giant.healthCurrent;
          databaseGiant.health.cap = giant.healthCap;
          databaseGiant.forwardStamp = msg.forward_date;

          databaseGiant.save().then(() => msg.reply.text(`Спасибо за форвард! Я обновил ${giant.name} в базе!`, {
            asReply: true,
          })).catch(e => console.log(e));
        }

        return false;
      });
    } else if (isRegularBeastFaced) {
      const beast = parseBeastFaced.parseRegularBeastFaced(msg.text);

      routedBeastView(Beast, {
        name: beast.name,
        type: beast.type,
        isDungeon: false,
      }, null, {
        env: process.env.ENV,
      }).then(({ reply, rotedBeast }) => {
        if (reply !== false) {
          const beastReplyMarkup = getBeastKeyboard(rotedBeast._id.toJSON());

          return msg.reply.text(reply, {
            replyMarkup: beastReplyMarkup,
            parseMode: 'html',
          }).catch(e => console.log(e));
        }
        return msg.reply.text('Прости, я никогда не слышал про этого моба :c', {
          asReply: true,
        }).catch(e => console.log(e));
      }).catch(e => console.log(e));
    } else if (isDungeonBeastFaced) {
      const oBeast = parseBeastFaced.parseDungeonBeastFaced(msg.text);

      routedBeastView(Beast, {
        name: oBeast.name,
        isDungeon: true,
      }, {
        env: process.env.ENV,
      }).then(({ reply }) => {
        if (reply !== false) {
          /* const beastReplyMarkup = getBeastKeyboard(beast._id.toJSON());

                    return msg.reply.text(reply,{
                        replyMarkup: beastReplyMarkup,
                        parseMode: 'html'
                    }).catch(e => console.log(e)); */
          msg.reply.text(`Хей, у меня есть данные про *${oBeast.name}*, но я пока что не умею их выводить, прости :с`, {
            asReply: true,
            parseMode: 'markdown',
          }).catch(e => console.log(e));
        } else {
          return msg.reply.text(`Чёрт, я никогда не слышал про *${oBeast.name}*, прости :с`, {
            asReply: true,
            parseMode: 'markdown',
          }).catch(e => console.log(e));
        }

        return false;
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
        userId: msg.from.id,
      });

      processUserData(msg, {
        usePip: sessions[msg.from.id].processDataConfig.usePip,
        useBeastFace: sessions[msg.from.id].processDataConfig.useBeastFace,
        silent: true,
      });
    }
  }

  return false;
});

bot.on([
  '/levelUpHealth',
  '/levelUpStrength',
  '/levelUpAccuracy',
  '/levelUpCharisma',
  '/levelUpAgility',
], (msg) => {
  sessions[msg.from.id].upgradeSkill = msg.text;
  sessions[msg.from.id].state = states.WAIT_FOR_DISTANCE;

  askReachableKm(msg);
});

bot.on('/reachableKm', (msg) => {
  sessions[msg.from.id].reachableKm = msg.text;
  sessions[msg.from.id].state = states.WAIT_FOR_LEVELS;

  askAmountOfLevels(msg);
});

bot.on('/locs_text', msg => msg.reply.text(`
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
  webPreview: false,
}));

bot.on('/raids_text', msg => msg.reply.text(`
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
  parseMode: 'html',
}));

bot.on('/upgradeSkill', (msg) => {
  if (msg.text === 'МАКСИМАЛОЧКА') {
    getEffort(msg, true);
  } else {
    getEffort(msg);
  }
});

bot.on('/journeyforwardstart', (msg) => {
  createSession(msg.from.id);

  const inlineReplyMarkup = bot.inlineKeyboard([
    [
      bot.inlineButton('📟 Перейти в игру.', { url: 'https://t.me/WastelandWarsBot' }),
    ],
  ]);

  sessions[msg.from.id].state = states.WAIT_FOR_FORWARD_END;
  const replyMarkup = bot.keyboard([
    [
      buttons.journeyForwardEnd.label,
      buttons.journeyForwardCancel.label,
    ],
  ], {
    resize: true,
  });

  msg.reply.text(`
Хей, вижу ты хочешь поделиться со мной ценной информацией с пустоши - отлично!
*Я принимаю следующую информацию*:
 - Бой с мобом
 - Побег от моба
 - Информацию о локации(километре)

Обработаную информацию я занесу в базу, которая обязательно поможет другим игрокам а тебе в награду отсыплю пару 💎*Шмепселей* 
    `, {
    replyMarkup,
    parseMode: 'markdown',
  }).then(() => msg.reply.text(`
*Я умею работать с данными только за один круг/вылазку - больше одной вылазки я пока обработать не смогу :с*

Пожалуйста убедись, что ты перешлёшь _все_ сообщения - Телеграм может немного притормаживать.
Ну а как закончишь - смело жми кнопку \`[Стоп 🙅‍♂️]\`!
            `, {
    replyMarkup: inlineReplyMarkup,
    parseMode: 'markdown',
  })).catch(e => console.log(e));
});


bot.on('/journeyforwardend', (msg) => {
  if (sessions[msg.from.id] === undefined) {
    createSession(msg.from.id);

    return msg.reply.text('Чёрт, похоже меня перезагрузил какой-то мудак и твои форварды не сохранились, прости пожалуйста :с', {
      replyMarkup: defaultKeyboard,
    });
  }
  sessions[msg.from.id].state = states.WAIT_FOR_DATA_TO_PROCESS;

  // console.log(JSON.stringify(sessions[msg.from.id].data));
  return processUserData(msg, {
    usePip: sessions[msg.from.id].processDataConfig.usePip,
    useBeastFace: sessions[msg.from.id].processDataConfig.useBeastFace,
  });
});

bot.on('/skippipforward', (msg) => {
  msg.reply.text('Окей, сейчас попробую обработать что смогу');

  sessions[msg.from.id].processDataConfig.usePip = false;

  processUserData(msg, {
    usePip: sessions[msg.from.id].processDataConfig.usePip,
    useBeastFace: sessions[msg.from.id].processDataConfig.useBeastFace,
  });
});

bot.on('/skipbeastforward', (msg) => {
  msg.reply.text('Окей, сейчас попробую обработать что смогу');

  sessions[msg.from.id].processDataConfig.useBeastFace = false;

  processUserData(msg, {
    usePip: sessions[msg.from.id].processDataConfig.usePip,
    useBeastFace: sessions[msg.from.id].processDataConfig.useBeastFace,
  });
});


bot.on('/version', (msg) => {
  msg.reply.text(`Текущая версия бота - <b>${config.version}</b> [β]`, {
    asReply: true,
    parseMode: 'html',
  });
});

bot.on('/eqp', (msg) => {
  // TODO: Inline button resize
  const processMenuButtons = processMenu(equipmentMenu).map(menuItem => bot.inlineButton(menuItem.title, { callback: `equipment_menu-${menuItem.name}` }));

  const inlineReplyMarkup = bot.inlineKeyboard(_.chunk(processMenuButtons, 3));

  return msg.reply.text(equipmentMenu.text, {
    parseMode: 'markdown',
    replyMarkup: inlineReplyMarkup,
  }).catch(e => console.log(e));
});

bot.on('/locations', (msg) => {
  const processMenuButtons = processMenu(locationsMenu).map(menuItem => bot.inlineButton(menuItem.title, { callback: `locations_menu-${menuItem.name}` }));

  const inlineReplyMarkup = bot.inlineKeyboard(_.chunk(processMenuButtons, 3));

  return msg.reply.text(locationsMenu.text, {
    parseMode: 'html',
    replyMarkup: inlineReplyMarkup,
  }).catch(e => console.log(e));
});

bot.on('/sppl', (msg) => {
  const processMenuButtons = processMenu(suppliesMenu).map(menuItem => bot.inlineButton(menuItem.title, { callback: `supplies_menu-${menuItem.name}` }));

  const inlineReplyMarkup = bot.inlineKeyboard(_.chunk(processMenuButtons, 3));

  return msg.reply.text(suppliesMenu.text, {
    parseMode: 'html',
    replyMarkup: inlineReplyMarkup,
  }).catch(e => console.log(e));
});

bot.on('/achv', (msg) => {
  const processMenuButtons = processMenu(achievementsMenu).map(menuItem => bot.inlineButton(menuItem.title, { callback: `achievements_menu-${menuItem.name}` }));

  const inlineReplyMarkup = bot.inlineKeyboard(_.chunk(processMenuButtons, 3));

  return msg.reply.text(achievementsMenu.text, {
    parseMode: 'markdown',
    replyMarkup: inlineReplyMarkup,
  }).catch(e => console.log(e));
});

bot.on('/dng', (msg) => {
  const processMenuButtons = processMenu(dungeonMenu).map(menuItem => bot.inlineButton(menuItem.title, { callback: `dungeons_menu-${menuItem.name}` }));

  const inlineReplyMarkup = bot.inlineKeyboard(_.chunk(processMenuButtons, 2));

  return msg.reply.text(dungeonMenu.text, {
    parseMode: 'html',
    replyMarkup: inlineReplyMarkup,
    webPreview: false,
  }).catch(e => console.log(e));
});

bot.on('/commands_for_lag', msg => msg.reply.text(commandsForLag, {
  parseMode: 'html',
}).catch(e => console.log(e)));

bot.on('/skill_upgrade', (msg) => {
  const skillOMaticText = `
В «<b>🎓 Скилокачаторе</b>» я могу помочь тебе посчитать финансовые затраты на прокачку твоих скилов.`;

  findPip(msg, (result) => {
    if (result.ok && result.reason === 'USER_FOUND') {
      if (sessions[msg.from.id] === undefined) {
        createSession(msg.from.id);
      }

      sessions[msg.from.id].pip = result.data.pip;
      sessions[msg.from.id].state = states.WAIT_FOR_SKILL;

      const replyMarkup = bot.keyboard([
        [buttons.skillSelectStrength.label, buttons.skillSelectAccuracy.label, buttons.skillSelectAgility.label],
        [buttons.skillSelectHealth.label, buttons.skillSelectCharisma.label],
        [buttons.cancelAction.label],
      ], {
        resize: true,
      });

      const skillMap = {
        health: '❤ Живучесть',
        strength: '💪 Сила',
        precision: '🔫 Меткость',
        charisma: '🗣 Харизма',
        agility: '🤸‍♀️ Ловкость',
      };

      const userSkills = Object.keys(skillMap).map((key) => {
        const skillName = skillMap[key];

        return `<b>${skillName}</b>: ${result.data.pip[key]}`;
      });

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
        parseMode: 'html',
      });
    }

    return msg.reply.text(`
${skillOMaticText}

Оу, похоже я ещё ничего не знаю про твой пип :с
Перейди в игру по кнопке внизу и перешли мне его пожалуйста!
        `, {
      replyMarkup: toGameKeyboard,
      parseMode: 'html',
    });
  });
});

bot.on(['/leaderboard', '/top'], (msg) => {
  userManager.leaderboard(msg.from.id).then((result) => {
    if (result.ok && result.reason === 'LEADERBOARD_GENERATED') {
      return msg.reply.text(`<i>Топ игроков отпраляющих форварды:</i> \n\n${result.data}`, {
        parseMode: 'html',
      });
    }
    if (result.reason === 'NO_USERS_FOUND') {
      return msg.reply.text('В базе пока что нет юзеров :с');
    }

    return msg.reply.text(JSON.stringify(result));
  });
});

bot.on('/mypipstats', (msg) => {
  User.findOne({ 'telegram.id': msg.from.id }, (err, person) => {
    if (err) {
      console.log(err);
      return;
    }

    if (person === null) {
      msg.reply.text('Я не могу показать тебе твой график прогресса - ты мне ещё не скидывал своего пип-боя');
    }

    let pips = person.history.pip.toObject();
    const pipsSize = pips.length;
    const limit = 10;

    if (pips.length <= 1) {
      msg.reply.text(
        'Я не видел что бы прокачивался в скилах. Скинь свой пип-бой когда прокачаешь какой-то скил',
        { asReply: true },
      );
    }

    if (pipsSize > limit) {
      pips = pips.slice(pipsSize - limit, pipsSize);
    }

    const whiteListKeys = [
      'health',
      'strength',
      'precision',
      'charisma',
      'agility',
    ];

    const systemToHumanKeysMap = {
      health: 'Живучесть',
      strength: 'Сила',
      precision: 'Меткость',
      charisma: 'Харизма',
      agility: 'Ловкость',
    };

    const history = {};

    whiteListKeys.forEach((key) => {
      history[key] = [];
    });

    pips.forEach((pip) => {
      Object.keys(pip).forEach((key) => {
        if (_.contains(whiteListKeys, key)) {
          const value = pip[key];

          history[key].push(value);
        }
      });
    });

    const flattify = (arr) => {
      const maxIndex = arr.length - 1;

      return arr.map((v, i) => {
        if (i !== maxIndex && i !== 0) {
          const prevValue = arr[i - 1];
          const nextValue = arr[i + 1];

          if (prevValue < v && nextValue < v) {
            return prevValue;
          }

          return v;
        } if (i === 0 || i === maxIndex) {
          return v;
        }

        return false;
      });
    };

    Object.keys(history).forEach((key) => {
      const arrayOfValues = history[key];
      history[key] = flattify(arrayOfValues);
    });

    const colors = {
      health: 'rgba(231, 76, 60,1.0)',
      strength: 'rgba(241, 196, 15,1.0)',
      precision: 'rgba(39, 174, 96,1.0)',
      charisma: 'rgba(52, 73, 94,1.0)',
      agility: 'rgba(189, 195, 199,1.0)',
    };

    const createDataSets = inputHistory => whiteListKeys.map(key => ({
      label: systemToHumanKeysMap[key],
      backgroundColor: colors[key],
      borderColor: colors[key],
      data: inputHistory[key],
      fill: false,
      lineTension: 0,
    }));

    const getDateLabels = inputPips => inputPips.map(pip => moment(pip.timeStamp * 1000).format('DD/MM'));

    const chartConfig = {
      type: 'line',
      data: {
        labels: getDateLabels(pips),
        datasets: createDataSets(history),
      },
      options: {
        scales: {
          xAxes: [
            {
              display: true,
              scaleLabel: {
                display: true,
                labelString: 'Дата',
              },
            },
          ],
          yAxes: [
            {
              display: true,
              scaleLabel: {
                display: true,
                labelString: 'Уровень',
              },
            },
          ],
        },
        legend: {
          position: 'bottom',
        },
        title: {
          display: true,
          text: 'Прогрес по Пип-Бою',
        },
      },
    };

    chartGeneration(chartConfig, (buffer) => {
      msg.reply.photo(buffer, {
        asReply: true,
        caption: 'Получи и распишись!',
      }).catch(e => console.log(e));
    });
  });
});

bot.on('/debug', msg => msg.reply.text(`Форварды принимаються только от @WastelandWarsBot.
Отменяю твои фоварды - нехуй выебываться.`, {
  asReply: false,
}));

bot.on(/^\d+$/, (msg) => {
  switch (sessions[msg.from.id].state) {
    case states.WAIT_FOR_DISTANCE: {
      const reachableKm = Number(msg.text);

      if (reachableKm > 100) {
        msg.reply.text('Бля, ну не гони - давай чуть более реалистичней, окей ?)');
      } else if (reachableKm <= 100) {
        sessions[msg.from.id].reachableKm = reachableKm;
        sessions[msg.from.id].state = states.WAIT_FOR_LEVELS;

        askAmountOfLevels(msg);
      }

      break;
    }
    case states.WAIT_FOR_LEVELS: {
      const upgradeAmount = Number(msg.text);
      const { pip } = sessions[msg.from.id];
      const skillToUpgrade = sessions[msg.from.id].upgradeSkill;

      if (upgradeAmountValidation(pip, skillToUpgrade, upgradeAmount, 1300)) {
        getEffort(msg);
      } else {
        msg.reply.text('Чёто дохуя получилось, попробуй число поменьше.');
      }

      break;
    }
    default:
      return false;
  }

  return false;
});

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
  webPreview: false,
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

Отдельная благодарнасть товарищу @MohanMC за многократную помощь в форматировании текстов

<code>🏅 Медаль с отличием х3</code> и <code>ОГРОМНОЕ спасибо х7</code> @K3nny2k за обнаружение ужасного бага в сохранении побегов,
помощь в создании каталога мобов, обнаружении нескольких багов с гигантами, и хуй знает что ещё.

<code>Необычная благодарность х1</code> @x59x75x72x79 за многочисленые багрепорты о выводе инфы

<code>🏅 Медаль с отличием х5</code> и <code>ОГРОМНОЕ спасибо х4</code> @kato_on за обнаружение многих страшных багов,
помощь в их устранении, неоднократные контрибьюшены.

Список дополняется...
`, {
  parseMode: 'html',
  webPreview: false,
}));

const giantsKeyboard = bot.inlineKeyboard([
  [
    bot.inlineButton('🔄 Обновить', { callback: 'update_giants' }),
    bot.inlineButton('ℹ️ Информация', { callback: 'show_info' }),
  ],
]);

const beastRangesKeyboard = withBackButton(bot.keyboard, _.chunk(ranges.map((range) => {
  const first = _.min(range);
  const last = _.max(range);

  if (first !== last) {
    return `${first}-${last}`;
  }

  return `${first}-${last}`;
}), 5));

const beastRangesDarkZoneKeyboard = withBackButton(bot.keyboard, _.chunk(dzRanges.map((range) => {
  const first = _.min(range);
  const last = _.max(range);

  if (first !== last) {
    return `${first}—${last}`;
  }

  return `${first}—${last}`;
}), 5));


bot.on('/show_giants', (msg) => {
  Giant.find({}).then((giants) => {
    const giantsReply = _.sortBy(giants, 'distance').map((giant) => {
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
      replyMarkup: giantsKeyboard,
    });
  }).catch(e => console.log(e));
});

bot.on(['/show_beasts(regular)', '/show_beasts(darkzone)'], (msg) => {
  const reply = `
Это каталог всех ${msg.text === '💀Мобы' ? 'обычных' : ''} мобов в Пустоши ${msg.text !== '💀Мобы' ? 'из 🚷Тёмной Зоны' : ''} <i>(не данжевых)</i>
Каталог наполняется посредством форвардов от игроков (бои, побеги и оглушения)

Выбери интересующий диапазон километров, после вам будет доступен список мобов, которые были замечены на этом километре.

Жмякай по <b>/mob_1234qwerty...</b> под нужным вам мобом, после вам будет доступна "карточка" простомтра моба с вкладками:
[<code>Инфо</code>], [<code>Лут</code>], [<code>Бой</code>] и [<code>Оглушения</code>]

Гайд тут: https://teletype.in/@eko24/Sy4pCyiRM
`;
  msg.reply.text(reply, {
    replyMarkup: msg.text === '💀Мобы' ? beastRangesKeyboard : beastRangesDarkZoneKeyboard,
    parseMode: 'html',
    webPreview: false,
  }).catch(e => console.log(e));
});

bot.on(/mob_(.+)/, (msg) => {
  const [, id] = /mob_(.+)/.exec(msg.text);

  const searchParams = process.env.ENV === 'PRODUCTION' ? {
    _id: id,
    isDungeon: false,
  } : {
    _id: id,
  };

  routedBeastView(Beast, searchParams, null, {
    env: process.env.ENV,
  }).then(({ reply, beast }) => {
    if (reply !== false) {
      const beastReplyMarkup = getBeastKeyboard(beast._id.toJSON());

      return msg.reply.text(reply, {
        asReply: true,
        parseMode: 'html',
        replyMarkup: beastReplyMarkup,
      }).catch(e => console.log(e));
    }
    return msg.reply.text('Прости, я никогда не слышал про этого моба :c', {
      asReply: true,
    }).catch(e => console.log(e));
  });
});


bot.on(['/cancel', '/journeyforwardcancel', '/force_cancel'], (msg) => {
  const backMessage = _.random(0, 100) >= 90 ? 'Ты вернусля в главное меню\n<i>Вернусля - почётный член этого сообщения, не обижайте её</i>' : 'Ты вернусля в главное меню';

  if (sessions[msg.from.id] === undefined) {
    createSession(msg.from.id);

    return msg.reply.text(backMessage, {
      replyMarkup: defaultKeyboard,
      parseMode: 'html',
    }).catch(e => console.log(e));
  }

  if (sessions[msg.from.id].state === states.WAIT_FOR_DATA_TO_PROCESS && msg.text !== '/force_cancel') {
    return msg.reply.text('Дождись результатов обработки форвардов\nЕсли ты хочешь отменить эту операцию - жми /force_cancel', {
      asReply: true,
    }).catch(e => console.log(e));
  }

  createSession(msg.from.id);

  return msg.reply.text(backMessage, {
    replyMarkup: defaultKeyboard,
    parseMode: 'html',
  }).catch(e => console.log(e));
});

bot.on('/delete_accaunt', (msg) => {
  if (process.env.ENV === 'STAGING') {
    userManager.delete(msg.from.id).then((result) => {
      if (!result.ok && result.reason === 'USER_NOT_FOUND') {
        return msg.reply.text('Я не смог найти твою запись в базе', {
          asReply: true,
        }).catch(e => console.log(e));
      }

      if (result.ok && result.reason === 'USER_DELETED') {
        return msg.reply.text('Я удалил твою запись в базе', {
          asReply: true,
        }).catch(e => console.log(e));
      }

      return false;
    });
  }
});

bot.on('/delete_beasts', (msg) => {
  if (process.env.ENV === 'STAGING') {
    Beast.find({ 'battles.stamp': { $regex: `.+${msg.from.id}` } }).then((beasts) => {
      if (beasts.length === 0) {
        return msg.reply.text('Я не нашёл твоих битв', {
          asReply: true,
        }).catch(e => console.log(e));
      }
      async.forEach(beasts, (dBeast, next) => {
        const stampRegexp = new RegExp(`.+${msg.from.id}`);
        const databaseBeast = dBeast;
        databaseBeast.battles = databaseBeast.battles.filter(battle => !stampRegexp.test(battle.stamp));

        databaseBeast.save().then(() => {
          next();
        });
      }, () => msg.reply.text('Я удалил твои битвы', {
        asReply: true,
      }).catch(e => console.log(e)));

      return false;
    });
  }
});

bot.on('callbackQuery', (msg) => {
  const chatId = msg.from.id;
  const messageId = msg.message.message_id;
  const showMobRegExp = /show_beast_(\d+)-(\d+)\+(.+)/;
  const showEquipmentKeyboardRegExp = /equipment_menu-(.+)/;
  const showLocationsKeyboardRegExp = /locations_menu-(.+)/;
  const showSuppliesKeyboardRegExp = /supplies_menu-(.+)/;
  const showAchievementsKeyboardRegExp = /achievements_menu-(.+)/;
  const showDungeonsKeyboardRegExp = /dungeons_menu-(.+)/;
  const showMobRouteRegExp = /show_beast_page_(.+)-(.+)/;

  if (msg.data === 'update_giants') {
    Giant.find({}).then((giants) => {
      bot.answerCallbackQuery(msg.id);

      const giantsReply = _.sortBy(giants, 'distance').map((giant) => {
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


      return bot.editMessageText({ chatId, messageId }, reply, { replyMarkup: giantsKeyboard, parseMode: 'markdown' });
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

    return bot.editMessageText({ chatId, messageId }, reply, {
      replyMarkup: giantsKeyboard,
      parseMode: 'markdown',
    }).catch(e => console.log(e));
  } else if (showMobRegExp.test(msg.data)) {
    const [, from, to, type] = showMobRegExp.exec(msg.data);
    const beastType = type === 'regular' ? 'Regular' : 'DarkZone';

    Beast.find({ isDungeon: false, distanceRange: { $gte: Number(from), $lte: Number(to) }, type: beastType }, 'battles.totalDamageReceived name id').then((beasts) => {
      bot.answerCallbackQuery(msg.id);

      const jsonBeasts = beasts.map((b) => {
        const jsoned = b.toJSON();

        return {
          id: b.id,
          ...jsoned,
        };
      });

      const beastsByDamage = _.sortBy(jsonBeasts, v => v.battles.totalDamageReceived);

      const beastsList = beastsByDamage.map(beast => `
${beast.name}
/mob_${beast.id}`).join('\n');

      const reply = `
<b>Мобы(${type === 'regular' ? '💀' : '🚷'}) на ${from}-${to}км</b>
<i>Отсортированы от слабым к сильным</i>
${beastsList}
`;

      return bot.editMessageText({ chatId, messageId }, reply, {
        replyMarkup: type === 'regular' ? beastRangesKeyboard : beastRangesDarkZoneKeyboard,
        parseMode: 'html',
      }).catch(e => console.log(e));
    }).catch(e => console.log(e));
  } else if (showMobRouteRegExp.test(msg.data)) {
    bot.answerCallbackQuery(msg.id);

    const [, route, beastId] = showMobRouteRegExp.exec(msg.data);

    routedBeastView(Beast, {
      _id: beastId,
      isDungeon: false,
    }, route, {
      env: process.env.ENV,
    }).then(({ reply, beast }) => {
      // TODO: Fix keyboard for dungeon beasts
      const beastReplyMarkup = getBeastKeyboard(beast._id.toJSON());

      return bot.editMessageText({ chatId, messageId }, reply, {
        replyMarkup: beastReplyMarkup,
        parseMode: 'html',
      }).catch(e => console.log(e));
    });
  } else if (showEquipmentKeyboardRegExp.test(msg.data)) {
    bot.answerCallbackQuery(msg.id);
    const submenuRegExp = /equipment_menu-(.+)_.+/;

    const [, menuRoute] = showEquipmentKeyboardRegExp.exec(msg.data);

    const chosenMenu = objectDeepSearch.findFirst(equipmentMenu, { name: menuRoute });

    let buttonsMenu = chosenMenu;

    if (submenuRegExp.test(msg.data)) {
      const [, parentMenuName] = submenuRegExp.exec(msg.data);
      buttonsMenu = objectDeepSearch.findFirst(equipmentMenu, { name: parentMenuName });
    }

    const chosenMenuButtons = processMenu(buttonsMenu).map(menuItem => bot.inlineButton(menuItem.title, { callback: `equipment_menu-${menuItem.name}` }));

    const inlineReplyMarkup = bot.inlineKeyboard(_.chunk(chosenMenuButtons, 3));

    return bot.editMessageText({ chatId, messageId }, chosenMenu.text, {
      parseMode: 'markdown',
      replyMarkup: inlineReplyMarkup,
    }).catch(e => console.log(e));
  } else if (showLocationsKeyboardRegExp.test(msg.data)) {
    bot.answerCallbackQuery(msg.id);
    const submenuRegExp = /locations_menu-(.+)+/;
    const [, menuRoute] = showLocationsKeyboardRegExp.exec(msg.data);
    const chosenMenu = objectDeepSearch.findFirst(locationsMenu, { name: menuRoute });
    let buttonsMenu = chosenMenu;

    if (submenuRegExp.test(msg.data)) {
      const [, parentMenuName] = submenuRegExp.exec(msg.data);
      buttonsMenu = objectDeepSearch.findFirst(locationsMenu, { name: parentMenuName });
    }

    let chosenMenuButtons = processMenu(buttonsMenu).map(menuItem => bot.inlineButton(menuItem.title, { callback: `locations_menu-${menuItem.name}` }));

    if (_.isEmpty(chosenMenuButtons)) {
      chosenMenuButtons = processMenu(locationsMenu).map(menuItem => bot.inlineButton(menuItem.title, { callback: `locations_menu-${menuItem.name}` }));
    }

    const inlineReplyMarkup = bot.inlineKeyboard(_.chunk(chosenMenuButtons, 3));

    return bot.editMessageText({ chatId, messageId }, chosenMenu.text, {
      parseMode: locationsMenu.config.parseMode,
      replyMarkup: inlineReplyMarkup,
    }).catch(e => console.log(e));
  } else if (showSuppliesKeyboardRegExp.test(msg.data)) {
    bot.answerCallbackQuery(msg.id);


    const submenuRegExp = /supplies_menu-(.+)+/;
    const [, menuRoute] = showSuppliesKeyboardRegExp.exec(msg.data);
    const chosenMenu = objectDeepSearch.findFirst(suppliesMenu, { name: menuRoute });
    let buttonsMenu = chosenMenu;

    if (submenuRegExp.test(msg.data)) {
      const [, parentMenuName] = submenuRegExp.exec(msg.data);
      buttonsMenu = objectDeepSearch.findFirst(suppliesMenu, { name: parentMenuName });
    }

    let chosenMenuButtons = processMenu(buttonsMenu).map(menuItem => bot.inlineButton(menuItem.title, { callback: `supplies_menu-${menuItem.name}` }));

    if (_.isEmpty(chosenMenuButtons)) {
      chosenMenuButtons = processMenu(suppliesMenu).map(menuItem => bot.inlineButton(menuItem.title, { callback: `supplies_menu-${menuItem.name}` }));
    }

    const inlineReplyMarkup = bot.inlineKeyboard(_.chunk(chosenMenuButtons, 3));

    return bot.editMessageText({ chatId, messageId }, chosenMenu.text, {
      parseMode: suppliesMenu.config.parseMode,
      replyMarkup: inlineReplyMarkup,
    }).catch(e => console.log(e));
  } else if (showAchievementsKeyboardRegExp.test(msg.data)) {
    bot.answerCallbackQuery(msg.id);


    const submenuRegExp = /achievements_menu-(.+)+/;
    const [, menuRoute] = showAchievementsKeyboardRegExp.exec(msg.data);
    const chosenMenu = objectDeepSearch.findFirst(achievementsMenu, { name: menuRoute });
    let buttonsMenu = chosenMenu;

    if (submenuRegExp.test(msg.data)) {
      const [, parentMenuName] = submenuRegExp.exec(msg.data);
      buttonsMenu = objectDeepSearch.findFirst(achievementsMenu, { name: parentMenuName });
    }

    let chosenMenuButtons = processMenu(buttonsMenu).map(menuItem => bot.inlineButton(menuItem.title, { callback: `achievements_menu-${menuItem.name}` }));

    if (_.isEmpty(chosenMenuButtons)) {
      chosenMenuButtons = processMenu(achievementsMenu).map(menuItem => bot.inlineButton(menuItem.title, { callback: `achievements_menu-${menuItem.name}` }));
    }

    const inlineReplyMarkup = bot.inlineKeyboard(_.chunk(chosenMenuButtons, 3));

    return bot.editMessageText({ chatId, messageId }, chosenMenu.text, {
      parseMode: achievementsMenu.config.parseMode,
      replyMarkup: inlineReplyMarkup,
    }).catch(e => console.log(e));
  } else if (showDungeonsKeyboardRegExp.test(msg.data)) {
    bot.answerCallbackQuery(msg.id);

    const submenuRegExp = /dungeons_menu-(.+)+/;
    const [, menuRoute] = showDungeonsKeyboardRegExp.exec(msg.data);
    const chosenMenu = objectDeepSearch.findFirst(dungeonMenu, { name: menuRoute });
    let buttonsMenu = chosenMenu;

    if (submenuRegExp.test(msg.data)) {
      const [, parentMenuName] = submenuRegExp.exec(msg.data);
      buttonsMenu = objectDeepSearch.findFirst(dungeonMenu, { name: parentMenuName });
    }

    let chosenMenuButtons = processMenu(buttonsMenu).map(menuItem => bot.inlineButton(menuItem.title, { callback: `dungeons_menu-${menuItem.name}` }));

    if (_.isEmpty(chosenMenuButtons)) {
      chosenMenuButtons = processMenu(dungeonMenu).map(menuItem => bot.inlineButton(menuItem.title, { callback: `dungeons_menu-${menuItem.name}` }));
    }

    const inlineReplyMarkup = bot.inlineKeyboard(_.chunk(chosenMenuButtons, 2));

    return bot.editMessageText({ chatId, messageId }, chosenMenu.text, {
      parseMode: dungeonMenu.config.parseMode,
      replyMarkup: inlineReplyMarkup,
    }).catch(e => console.log(e));
  } else if (msg.data === 'initialize_skill_upgrade') {
    const skillOMaticText = `
В «<b>🎓 Скилокачаторе</b>» я могу помочь тебе посчитать финансовые затраты на прокачку твоих скилов.`;

    findPip(msg, (result) => {
      bot.answerCallbackQuery(msg.id);
      if (result.ok && result.reason === 'USER_FOUND') {
        if (sessions[msg.from.id] === undefined) {
          createSession(msg.from.id);
        }

        sessions[msg.from.id].pip = result.data.pip;
        sessions[msg.from.id].state = states.WAIT_FOR_SKILL;

        const replyMarkup = bot.keyboard([
          [buttons.skillSelectStrength.label, buttons.skillSelectAccuracy.label, buttons.skillSelectAgility.label],
          [buttons.skillSelectHealth.label, buttons.skillSelectCharisma.label],
          [buttons.cancelAction.label],
        ], {
          resize: true,
        });

        const skillMap = {
          health: '❤ Живучесть',
          strength: '💪 Сила',
          precision: '🔫 Меткость',
          charisma: '🗣 Харизма',
          agility: '🤸‍♀️ Ловкость',
        };

        const userSkills = Object.keys(skillMap).map((key) => {
          const skillName = skillMap[key];

          return `<b>${skillName}</b>: ${result.data.pip[key]}`;
        });

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
          parseMode: 'html',
        }).catch(e => console.log(e));
      }

      return bot.sendMessage(msg.from.id, `
${skillOMaticText}

Оу, похоже я ещё ничего не знаю про твой пип :с
Перейди в игру по кнопке внизу и перешли мне его пожалуйста!
        `, {
        replyMarkup: toGameKeyboard,
        parseMode: 'html',
      }).catch(e => console.log(e));
    });
  }

  return false;
});

const validateRange = (rangeToValidate, _from, _to) => {
  const from = Number(_from);
  const to = Number(_to);
  return rangeToValidate.filter(range => range[0] === from && range[1] === to).length === 1;
};

bot.on('text', (msg) => {
  const regularZoneBeastsRequestRegExp = /(\d+)-(\d+)/;
  const rangeRegExp = /(\d+)(-|—|--)(\d+)/;


  if (!rangeRegExp.test(msg.text)) {
    return;
  }

  const range = regularZoneBeastsRequestRegExp.test(msg.text) ? ranges : dzRanges;


  const [, from,, to] = rangeRegExp.exec(msg.text);

  if (!validateRange(range, from, to)) {
    msg.reply.text('Да, очень умно с твоей стороны. Начислил тебе <i>нихуя</i> 💎<b>Шмепселей</b> за смекалочку, а теперь иди нахуй и используй кнопки внизу.', {
      parseMode: 'html',
    });
  }

  const beastType = regularZoneBeastsRequestRegExp.test(msg.text) ? 'Regular' : 'DarkZone';

  Beast.find({
    isDungeon: false,
    distanceRange: {
      $gte: Number(from),
      $lte: Number(to),
    },
    type: beastType,
  }, 'battles.totalDamageReceived name id').then((beasts) => {
    const jsonBeasts = beasts.map((b) => {
      const jsoned = b.toJSON();

      return {
        id: b.id,
        ...jsoned,
      };
    });

    const beastsByDamage = _.sortBy(jsonBeasts, v => v.battles.totalDamageReceived);

    const beastsList = beastsByDamage.map(beast => `
${beast.name}
/mob_${beast.id}`).join('\n');

    const reply = `
<b>Мобы(${beastType === 'DarkZone' ? '🚷' : '💀'}) на ${from}-${to}км</b>
<i>Отсортированы от слабым к сильным</i>
${beastsList}
`;

    return msg.reply.text(reply, {
      replyMarkup: beastType === 'DarkZone' ? beastRangesDarkZoneKeyboard : beastRangesKeyboard,
      parseMode: 'html',
    }).catch(e => console.log(e));
  }).catch(e => console.log(e));
});

bot.on('/d', (msg) => {
  if (process.env.ENV === 'STAGING') {
    Beast.find({
      isDungeon: true,
    }, 'battles.totalDamageReceived name id').then((beasts) => {
      const jsonBeasts = beasts.map((b) => {
        const jsoned = b.toJSON();

        return {
          id: b.id,
          ...jsoned,
        };
      });

      const beastsByDamage = _.sortBy(jsonBeasts, v => v.battles.totalDamageReceived);

      const beastsList = beastsByDamage.map(beast => `
${beast.name}
/mob_${beast.id}`).join('\n');

      const reply = `
<b>Данжевые мобы</b>
<i>Отсортированы от слабым к сильным</i>
${beastsList}
`;

      return msg.reply.text(reply, {
        parseMode: 'html',
      }).catch(e => console.log(e));
    }).catch(e => console.log(e));
  }
});

bot.on('/show_encyclopedia', (msg) => {
  msg.reply.text(`В <b>📔Энциклопедии</b> вы можете просмотреть информацию о мире Wasteland Wars
<b>🎒Экипировка</b> - Оружие, броня и тому подобное.
<b>🗃Припасы</b> - Еда, баффы и медицина
<b>🛰Дроны</b> - Характеристики ваших верных спутников
<b>⚠️Подземелья</b> - Рекомендации к прохождению, инфа о луте и мобах
<b>🏜️Локации</b> - Рейдовые и обычные локации
<b>✅Достижения</b> - За что выдают награды
`, {
    replyMarkup: withBackButton(bot.keyboard, encyclopediaKeyboard, {
      resize: true,
      position: 'bottom',
    }),
    parseMode: 'html',
  });
});

bot.on(/\/battle_(.+)/, (msg) => {
  if (process.env.ENV === 'PRODUCTION') {
    return msg.reply.text('Ну и хули ты сюда лезешь?)', {
      asReply: true,
    }).catch(e => console.log(e));
  }

  const [, battleId] = /\/battle_(.+)/.exec(msg.text);
  // msg.reply.text('neat!');

  routedBattleView(Beast, {
    battleId: mongoose.Types.ObjectId(battleId),
  }).then(({ reply }) => {
    if (reply !== false) {
      return msg.reply.text(reply, {
        parseMode: 'html',
      }).catch(e => console.log(e));
    }
    return msg.reply.text('Прости, я ничего не знаю про эту битву :c', {
      asReply: true,
    }).catch(e => console.log(e));
  }).catch(e => console.log(e));

  return false;
});

bot.start();
