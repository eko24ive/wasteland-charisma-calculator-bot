// TODO: Supply it with pip from database (with appropriate validation just like from the processForwards)

process.on('unhandledRejection', (reason) => {
  console.log('Unhandled Rejection at:', reason.stack || reason);
});

require('dotenv').config();

const uristring = process.env.MONGODB_URI;
const DATA_THRESHOLD = Number(process.env.DATA_THRESHOLD);
const { VERSION } = process.env;

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
const journeySchema = require('./src/schemes/journey');

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
const validateForwardDate = require('./src/utils/validateForwardDate');
const comparePips = require('./src/utils/comparePips');

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

const signedBeasts = require('./src/database/beasts_signed.json');

mongoose.connect(uristring);

const Beast = mongoose.model('Beast', beastSchema);
const Giant = mongoose.model('Giant', giantScheme);
const Location = mongoose.model('Location', locationSchema);
const User = mongoose.model('User', userSchema);
const Journey = mongoose.model('Journey', journeySchema);

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
const WAIT_FOR_DATA_VALIDATION = 'WAIT_FOR_DATA_VALIDATION';
const WAIT_FOR_DATA_TO_PROCESS = 'WAIT_FOR_DATA_TO_PROCESS';

const states = {
  WAIT_FOR_SKILL,
  WAIT_FOR_DISTANCE,
  WAIT_FOR_LEVELS,
  WAIT_FOR_RESPONSE,
  WAIT_FOR_START,
  WAIT_FOR_FORWARD_END,
  WAIT_FOR_PIP_FORWARD,
  WAIT_FOR_DATA_VALIDATION,
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
    beastsToValidate: [],
    initialForwardDate: null,
    lastForwardDate: null,
    firstForwardDate: null,
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

const getUrl = () => {
  process.env.ENV === 'PRODUCTION' ? process.env.URL_PRODUCTION : process.env.URL_STAGING;

  if (process.env.ENV === 'PRODUCTION') {
    return process.env.URL_PRODUCTION;
  } if (process.env.ENV === 'STAGING') {
    return process.env.URL_STAGING;
  }

  throw new Error('Please, specify bot token mode "--dev" for development and "--prod" production');
};

let bot;

if (process.env.ENV === 'LOCAL') {
  bot = new TeleBot({
    token: getToken(),
    usePlugins: ['namedButtons'],
    polling: {
      interval: 1, // How often check updates (in ms).
    },
    pluginConfig: {
      namedButtons: {
        buttons,
      },
    },
  });
} else {
  const token = getToken();
  const host = '0.0.0.0';
  const port = process.env.PORT;
  const url = getUrl();

  bot = new TeleBot({
    token,
    usePlugins: ['namedButtons'],
    webhook: { url, host, port },
    pluginConfig: {
      namedButtons: {
        buttons,
      },
    },
  });
}

const updateOrCreate = (msg, pip, cb = (() => {})) => {
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
      buttons.reachableKm60.label,
      buttons.reachableKm78.label,
    ],
    [
      buttons.reachableKm85.label,
      buttons.reachableKm95.label,
      buttons.reachableKm100.label,
    ],
  ], {
    resize: true,
  });

  return bot.sendMessage(msg.from.id, 'Выбери до какого километра ты ходишь (при этом оставаясь в живых)?\n'
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

bot.on(['/start', '/help'], async (msg) => {
  createSession(msg.from.id);

  return msg.reply.text(
    `
Привет, меня зовут «<b>Wasteland Wars Assistant</b>», я - что-то наподобие "умной" энциклопедии.

⬦ Если хочешь посмотреть что я знаю о мобе которого ты встретил - скинь форвард встречи с ним.

<code>[🏃СкинутьЛог]</code> - Запуск режима "ЛОГ". В этом режиме ты можешь переслать сюда сообщения от игрового бота. Также этот режим ты можешь запустить если отправишь боту комманду <b>/go</b>

<code>[🎓Скилокчтр]</code> - Запуск «<b>Скилокачатора</b>» - анализатора в прокачке твоих скилов

<code>[📔Энциклпдия]</code> - Полезная информация о мире пустоши, и что в нём можно сделать/получить

<code>[💀Мобы]</code> - Информация об <b>обычных</b> мобах

<code>[🚷Мобы ТЗ]</code> - Информация о мобах из <b>Тёмной Зоны</b>

<code>[🦂Гиганты]</code> - Состояние гигантов

<code>[🏆Зал Славы]</code> - Благодарности всем тем кто когда-либо оказалась поддержку в работе над ботом


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

const getBeastToValidateMessage = (beastsToValidate, beastRequest = false, firstTime = true, failing = false) => {
  const indexedBeasts = beastsToValidate.length > 10 ? _.first(_.sortBy(beastsToValidate, 'date'), 10) : _.sortBy(beastsToValidate, 'date');

  const isThereMoreBeasts = beastsToValidate.length > 10;

  const getHeader = () => {
    const failingMessage = 'Ты скинул мне какую-то хуйню, вот список того что мне нужно:';
    const beastRequestFirstTime = 'Слушай, я первый раз слышу про этих мобов, скинь пожалуйста их форварды.';
    const beastRequestValidate = 'Слушай, у меня тут есть пару вопросиков по поводу правдивости твоей инфы - давай-ка их обкашляем.';
    const success = 'Отлично, продолжай в том же духе';

    if (firstTime) {
      if (beastRequest) {
        return beastRequestFirstTime;
      }
      return beastRequestValidate;
    } if (failing) {
      return failingMessage;
    }

    return success;
  };

  const battlesToValidate = indexedBeasts.filter(({ reason }) => reason === 'battle')
    .map(({
      type,
      name,
      distance,
      date,
      isDungeon,
    }) => `• ${distance}км - <b>${name}</b> в ${type === 'DarkZone' ? '🚷ТЗ' : '💀Безопасной Зоне'}${isDungeon ? ' в подземелье' : ''}\n<i>Битва произошла в ${moment(date * 1000).add(3, 'hour').format('DD.MM.YYYY HH:mm')} (МСК)</i>\nПроигнорировать: /ignore_${date}`);

  const fleesToValidate = indexedBeasts.filter(({ reason }) => reason === 'flee')
    .map(({
      type,
      distance,
      date,
    }) => `• ${distance}км -Неизвестный моб в ${type === 'DarkZone' ? '🚷ТЗ' : '💀Безопасной Зоне'}\n<i>Побег произошел в ${moment(date * 1000).add(3, 'hour').format('DD.MM.YYYY HH:mm')} (МСК)</i>\nПроигнорировать: /ignore_${date}`);

  return `${getHeader(beastRequest, firstTime, failing)}

${battlesToValidate.length > 0 ? '<b>[БИТВЫ]</b>' : ''}
${`${battlesToValidate.join('\n')}\n`}
${fleesToValidate.length > 0 ? '<b>[ПОБЕГИ]</b>' : ''}
${`${fleesToValidate.join('\n')}\n`}
${isThereMoreBeasts ? '<b>Там ещё есть мобы на проверку, но ты сначала с этими разберись</b>\n' : ''}
${firstTime ? `Пожалуйста, скинь <b>ОТДЕЛЬНО</b> (по одному за раз) форвард встречи с этими красавцами, они выглядят как-то так:
<code>Во время вылазки на тебя напал...</code>
<i>или</i>
<code>...перегородил тебе путь.</code>
<i>или</i>
<code>устрашающе начал приближаться...</code>\n` : ''}
Если у тебя нет на это времени жми /skipbeastforwards
<i>ВНИМАНИЕ: ПРИ НАЖАТИИ НА /skipbeastforwards - БОТ ПРОИГНОРИРУЕТ ДАННЫЕ, КОТОРЫЕ ЗАВИСЯТ ОТ УКАЗАНЫХ ВЫШЕ ФОРВАРДОВ, И НЕ ЗАПИШЕТ ИХ В БАЗУ</i>`;
};

const actualActualProcessUserData = (msg, reportData, updatesData, options) => {
  if (process.env.ENV === 'STAGING' || process.env.ENV === 'LOCAL') {
    console.log('======= DATA PROCESSING =======');
    console.log(
      JSON.stringify({
        reportData,
        updatesData,
        options,
      }),
    );
  }

  if (reportData.lastPip !== null && reportData.lastPip !== undefined) {
    updateOrCreate(msg, reportData.lastPip);
  }

  if (options.useBeastFace && !_.isEmpty(reportData.beastsToValidate)) {
    sessions[msg.from.id].state = states.WAIT_FOR_DATA_VALIDATION;
    sessions[msg.from.id].initialForwardDate = reportData.initialForwardDate;
    sessions[msg.from.id].lastForwardDate = reportData.lastForwardDate;
    sessions[msg.from.id].firstForwardDate = reportData.firstForwardDate;
    sessions[msg.from.id].beastsToValidate = reportData.beastsToValidate;
    sessions[msg.from.id].beastRequest = false;

    return msg.reply.text(getBeastToValidateMessage(sessions[msg.from.id].beastsToValidate, sessions[msg.from.id].beastRequest), {
      parseMode: 'html',
      replyMarkup: 'hide',
    }).catch(e => console.log(e));
  }

  let userForwardPoints = 0;
  const beastsToValidate = [];
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
    // return false;
  }

  const isBeastUnderValidation = name => reportData.beastsToValidate.filter(beast => beast.name === name).length > 0;

  const signEntryWithVersion = entry => ({
    ...entry,
    version: VERSION,
    epoch: reportData.epoch,
  });

  const signSetWithVersion = (data) => {
    if (data) {
      return data.map(entry => ({
        ...entry,
        version: VERSION,
        epoch: reportData.epoch,
      }));
    }

    return [];
  };

  const createNewBeast = (beast) => {
    const {
      materialsReceived: unflattenedMaterialsReceived,
      capsReceived: unflattenedCapsReceived,
      ...rest
    } = beast;

    const {
      distanceRange,
      capsReceived,
      materialsReceived,
      battles,
      flees,
      concussions,
      ...flattenedBeast
    } = {
      materialsReceived: _.flatten(unflattenedMaterialsReceived),
      capsReceived: _.flatten(unflattenedCapsReceived),
      version: VERSION,
      ...rest,
    };

    return {
      distanceRange: signSetWithVersion(distanceRange),
      capsReceived: signSetWithVersion(capsReceived),
      materialsReceived: signSetWithVersion(materialsReceived),
      battles: signSetWithVersion(battles),
      flees: signSetWithVersion(flees),
      concussions: signSetWithVersion(concussions),
      ...flattenedBeast,
    };
  };

  const detectBeastForValidation = () => new Promise((resolve, reject) => {
    if (updatesData.beasts.length > 0) {
      async.forEach(updatesData.beasts, (iBeast, next) => {
        if (!options.useBeastFace) {
          next();
        } else if (iBeast.proofedByForward) {
          next();
        } else {
          const searchQuery = iBeast.subType ? {
            name: iBeast.name,
            isDungeon: iBeast.isDungeon,
            type: iBeast.type,
            subType: iBeast.subType,
          } : {
            name: iBeast.name,
            isDungeon: iBeast.isDungeon,
            type: iBeast.type,
          };

          Beast.findOne(searchQuery).then((fBeast) => {
            const databaseBeast = fBeast;
            if (databaseBeast === null) {
              iBeast.distanceRange.forEach(({ value }) => {
                beastsToValidate.push({
                  name: iBeast.name, distance: value, type: iBeast.type, isDungeon: iBeast.isDungeon, reason: 'battle', date: iBeast.date,
                });
              });
              next();
            } else {
              const actualRanges = databaseBeast.distanceRange
                .filter(({ version }) => version === VERSION)
                .map(({ value }) => value);

              iBeast.distanceRange.forEach(({ value }) => {
                if (!actualRanges.includes(value)) {
                  beastsToValidate.push({
                    name: iBeast.name, distance: value, type: iBeast.type, isDungeon: iBeast.isDungeon, reason: 'battle', date: iBeast.date,
                  });
                }
              });
              next();
            }
          });
        }
      }, () => {
        if (beastsToValidate.length > 0) {
          reject();
        } else {
          resolve();
        }
      });
    } else {
      resolve();
    }
  });

  const saveJourney = () => new Promise((resolve) => {
    const newJourney = new Journey({
      epoch: reportData.epoch,
      user: {
        id: msg.from.id,
        username: msg.from.username,
      },
      reportData,
      updatesData,
      session: sessions[msg.from.id],
    });

    newJourney.save().then(() => {
      resolve();
    });
  });

  const processBeasts = () => new Promise((resolve) => {
    if (updatesData.beasts.length > 0 && options.usePip === true) {
      async.forEach(updatesData.beasts, (iBeast, next) => {
        const searchQuery = iBeast.subType ? {
          name: iBeast.name,
          isDungeon: iBeast.isDungeon,
          type: iBeast.type,
          subType: iBeast.subType,
        } : {
          name: iBeast.name,
          isDungeon: iBeast.isDungeon,
          type: iBeast.type,
        };

        Beast.findOne(searchQuery).then((fBeast) => {
          const databaseBeast = fBeast;
          if (databaseBeast === null) {
            if (iBeast.proofedByForward) {
              const newBeast = new Beast(createNewBeast(iBeast));

              dataProcessed += 1;

              if (iBeast.type === 'DarkZone') {
                userForwardPoints += forwardPoints.newMob * forwardPoints.darkZoneBattle;
              } else {
                userForwardPoints += forwardPoints.newMob * forwardPoints.regularZoneBattle;
              }

              newBeast.save().then(() => next());
            } else {
              beastsToValidate.push({
                name: iBeast.name, distance: iBeast.distanceRange[0], type: iBeast.type, isDungeon: iBeast.isDungeon, reason: 'battle', date: iBeast.date,
              });
              next();
            }
          } else {
            let beastPoints = 0;
            const uniqueBattles = [];
            const uniqueConcussions = [];
            const uniqueFlees = [];

            if (iBeast.battles) {
              if (iBeast.battles.length > 0) {
                iBeast.battles.forEach((battle) => {
                  if (databaseBeast.battles === undefined) {
                    uniqueBattles.push(battle);
                  } else {
                    const battlesForValidation = databaseBeast.battles.filter(({ version }) => version === VERSION);

                    const sameStamp = battlesForValidation.some(newBattle => newBattle.stamp === battle.stamp);

                    if (sameStamp) {
                      dupes.battles += 1;
                    }

                    if (!sameStamp) {
                      uniqueBattles.push(battle);
                    }
                  }
                });
              }
            }


            if (iBeast.concussions) {
              if (iBeast.concussions.length > 0) {
                iBeast.concussions.forEach((concussion) => {
                  if (databaseBeast.battles === undefined) {
                    uniqueConcussions.push(concussion);
                  } else {
                    const concussionsForValidation = databaseBeast.concussions.filter(({ version }) => version === VERSION);

                    const sameConcussion = concussionsForValidation.some(newConcussion => concussion.stats.agility === newConcussion.stats.agility
                        && concussion.amount === newConcussion.amount);

                    if (!sameConcussion) {
                      uniqueConcussions.push(concussion);
                    }
                  }
                });
              }
            }

            if (iBeast.flees) {
              if (iBeast.flees.length === 1) {
                iBeast.flees.forEach((flee) => {
                  if (databaseBeast.flees === undefined) {
                    uniqueFlees.push(flee);
                  } else {
                    const fleesForValidation = databaseBeast.flees.filter(({ version }) => version === VERSION);

                    const sameStamp = fleesForValidation.some(newFlee => newFlee.stamp === flee.stamp);

                    if (sameStamp) {
                      dupes.flees += 1;
                    }

                    if (!sameStamp) {
                      uniqueFlees.push(flee);
                    }
                  }
                });
              }
            }

            if (!_.isEmpty(iBeast.receivedItems)) {
              // FIXME: Implement cross-validation and cross-updation of receivedItems

              /* if (_.isEmpty(databaseBeast.receivedItems)) {
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
                }); */
            }

            if (iBeast.distanceRange.length > 0) {
              const distanceRangesForValidation = databaseBeast.distanceRange
                .filter(({ version }) => (version === VERSION))
                .map(({ value }) => value);

              const newRanges = iBeast.distanceRange.filter(range => distanceRangesForValidation.indexOf(range.value) === -1);
              const sameRanges = iBeast.distanceRange.filter(range => distanceRangesForValidation.indexOf(range.value) !== -1);

              if (!_.isEmpty(newRanges)) {
                beastPoints += forwardPoints.newDistance * newRanges.length;

                databaseBeast.distanceRange = [...databaseBeast.distanceRange, ...signSetWithVersion(newRanges)];
              } else if (!_.isEmpty(sameRanges)) {
                // beastPoints += forwardPoints.sameDistance * sameRanges.length;
              }
            }


            if (uniqueBattles.length > 0) {
              uniqueBattles.forEach((newBattle) => {
                if (newBattle.outcome === 'win') {
                  beastPoints += forwardPoints.newBattleWin;

                  if (iBeast.capsReceived.length > 0) {
                    const capsReceivedForValidation = databaseBeast.capsReceived
                      .filter(({ version }) => (version === VERSION))
                      .map(({ value }) => value);

                    const newCaps = iBeast.capsReceived.filter(caps => capsReceivedForValidation.indexOf(caps.value) === -1);

                    if (!_.isEmpty(newCaps)) {
                      databaseBeast.capsReceived = [...databaseBeast.capsReceived, ...signSetWithVersion(newCaps)];
                    }
                  }

                  if (iBeast.materialsReceived.length > 0) {
                    const materialsReceivedForValidation = databaseBeast.materialsReceived
                      .filter(({ version }) => (version === VERSION))
                      .map(({ value }) => value);

                    const newMaterials = iBeast.materialsReceived.filter(materials => materialsReceivedForValidation.indexOf(materials.value) === -1);

                    if (!_.isEmpty(newMaterials)) {
                      databaseBeast.materialsReceived = [...databaseBeast.materialsReceived, ...signSetWithVersion(newMaterials)];
                    }
                  }
                } else {
                  beastPoints += forwardPoints.newBattleLose;
                }

                databaseBeast.battles.push(signEntryWithVersion(newBattle));
              });
            }

            if (uniqueConcussions.length > 0) {
              databaseBeast.concussions.push(signEntryWithVersion(uniqueConcussions));
            }

            if (uniqueFlees.length > 0) {
              uniqueFlees.forEach((newFlee) => {
                if (newFlee.outcome === 'win') {
                  beastPoints += forwardPoints.newFleeWin;
                } else {
                  beastPoints += forwardPoints.newFleeLose;
                }

                databaseBeast.flees.push(signEntryWithVersion(newFlee));
              });
            }


            if (
              !_.isEmpty(uniqueBattles)
                || !_.isEmpty(uniqueConcussions)
                || !_.isEmpty(uniqueFlees)
            ) {
              dataProcessed += 1;

              if (iBeast.type === 'DarkZone') {
                userForwardPoints += beastPoints * forwardPoints.darkZoneBattle;
              } else {
                userForwardPoints += beastPoints * forwardPoints.regularZoneBattle;
              }
            }

            delete databaseBeast.__v;

            databaseBeast.save().then(() => next()).catch((e) => {
              console.log(`Tried to save:\n${JSON.stringify(iBeast)}\n===================\nUserId: ${msg.from.id}\n`);
              console.log(`Error:\n${e}\n===================\n===================\n===================`);
              next();
            });
          }
        });
      }, () => {
        resolve();
      });
    } else {
      resolve();
    }
  });

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
              // TODO: Implement correct loot processing

              /* Object.keys(iLocation.receivedBonusItems).forEach((item) => {
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
              }); */
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

  detectBeastForValidation().then(
    () => {
      Promise.all([
        processBeasts(),
        processLocations(),
        saveJourney(),
      ]).then(() => {
        let errors = '';
        let dupesText = '';
        let reply;

        if (reportData.errors.length > 0) {
          errors = `*Также я заметил такие вещи*:
    ${reportData.errors.join('\n')}`;
        }

        if (dupes.battles > 0 || dupes.flees > 0) {
          dupesText = 'Похоже ты скидывал некоторые форварды по второму разу. Я не начислял тебе за них очки';
        }

        if (dataProcessed > 0 && userForwardPoints > 0) {
          // TODO: Move out shit to strings
          // TODO: Implement meaningfull report data regarding found usefull data
          createSession(msg.from.id);

          // setTimeout(() => {
          if (options.silent) {
            reply = `
        Спасибо за форвард. Я перевёл ${userForwardPoints.toFixed(1)} 💎*Шмепселей* на твой счёт.\n_${dupesText}_`;
          } else {
            // Всего я насчитал ${dataProcessed} данных!

            reply = `Фух, я со всём справился - спасибо тебе огромное за информацию!

Ты заработал ${userForwardPoints.toFixed(1)} 💎*Шмепселей* за свои форварды!
_${dupesText}_

${errors}
Если ты чего-то забыл докинуть - смело жми на \`[Скинуть лог 🏃]\` и _докидывай_`;
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
          // }, 1500);
        } else {
          // setTimeout(() => {
          createSession(msg.from.id);
          return msg.reply.text(`
        К сожалению я не смог узнать ничего нового из твоих форвардов :с${dupesText ? `\n\n_${dupesText}_` : ''}`, {
            replyMarkup: defaultKeyboard,
            parseMode: 'markdown',
          });
          // }, 1500);
        }

        // FIXME: COULD BE AN ISSUE
        // sessions[msg.from.id].state = states.WAIT_FOR_DATA_VALIDATION;
      }).catch(e => console.log(e));
    },
    () => {
      sessions[msg.from.id].state = states.WAIT_FOR_DATA_VALIDATION;
      sessions[msg.from.id].initialForwardDate = reportData.initialForwardDate;
      sessions[msg.from.id].lastForwardDate = reportData.lastForwardDate;
      sessions[msg.from.id].firstForwardDate = reportData.firstForwardDate;
      sessions[msg.from.id].beastsToValidate = beastsToValidate;
      sessions[msg.from.id].beastRequest = true;

      return msg.reply.text(getBeastToValidateMessage(sessions[msg.from.id].beastsToValidate, sessions[msg.from.id].beastRequest), {
        parseMode: 'html',
        replyMarkup: 'hide',
      }).catch(e => console.log(e));
    },
  );


  return false;
};

const actualProcessUserData = (msg, reportData, updatesData, options) => {
  if (!options.silent) {
    msg.reply.text('Перехожу в режим обработки данных, подожди пожалуйста немного :3', {
      replyMarkup: 'hide',
    }).then(() => {
      actualActualProcessUserData(msg, reportData, updatesData, options);
    }).catch(e => console.log(e));
  } else {
    actualActualProcessUserData(msg, reportData, updatesData, options);
  }
};

const databasePipCheck = async (msg, pips) => Promise((resolve) => {
  findPip(msg, (result) => {
    if (result.ok) {
      const { pip } = result.data;

      resolve(comparePips([...pips, pip]));
    } else {
      resolve(true);
    }
  });
});

const processUserData = async (msg, options, processConfig = {
  omitPipError: false,
}) => {
  sessions[msg.from.id].state = states.WAIT_FOR_DATA_TO_PROCESS;

  const {
    data,
  } = sessions[msg.from.id];

  const isPipsFraudless = await databasePipCheck(msg, data.filter(entry => entry.dataType === 'pipboy'));

  if (!isPipsFraudless) {
    return msg.reply.text('<b>❌ЗАМЕЧЕНА КРИТИЧЕСКАЯ ОШИБКА❌</b>\n\nПохоже что ты скидывал пип-бой, который тебе не пренадлежит\n\n<i>Форварды были отменены.</i>', {
      replyMarkup: defaultKeyboard,
      parseMode: 'html',
    });
  }

  let {
    reportData,
    updatesData,
  } = processForwards(data, msg.from.id || moment.now(), processConfig);

  if (reportData.criticalError) {
    return msg.reply.text(`<b>❌ЗАМЕЧЕНА КРИТИЧЕСКАЯ ОШИБКА❌</b>\n\n${reportData.criticalError}\n\n<i>Форварды были отменены.</i>`, {
      replyMarkup: defaultKeyboard,
      parseMode: 'html',
    });
  }

  if (options.useBeastFace && !_.isEmpty(reportData.beastsToValidate)) {
    sessions[msg.from.id].state = states.WAIT_FOR_DATA_VALIDATION;
    sessions[msg.from.id].initialForwardDate = reportData.initialForwardDate;
    sessions[msg.from.id].lastForwardDate = reportData.lastForwardDate;
    sessions[msg.from.id].firstForwardDate = reportData.firstForwardDate;
    sessions[msg.from.id].beastsToValidate = reportData.beastsToValidate;
    sessions[msg.from.id].beastRequest = false;

    return msg.reply.text(getBeastToValidateMessage(sessions[msg.from.id].beastsToValidate, sessions[msg.from.id].beastRequest), {
      parseMode: 'html',
      replyMarkup: 'hide',
    }).catch(e => console.log(e));
  }


  if (updatesData.locations.length === 0 && updatesData.beasts.length === 0) {
    createSession(msg.from.id);
    return msg.reply.text(`
  К сожалению я не смог узнать ничего нового из твоих форвардов :с`, {
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
        } = processForwards(data, msg.from.id || moment.now());

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
          return msg.reply.text('Твой пип не соответсвуют твоим статам из форвардов!\nПрости, я вынужден отменить твои форварды.', {
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

  if (!validateForwardDate(msg.forward_date)) {
    return msg.reply.text('❌<b>ЗАМЕЧЕНА КРИТИЧЕСКАЯ ОШИБКА</b>❌\n\nБыл замечен форвард, время которого меньше, чем время последнего обновления Wasteland Wars (19.09.2018)', {
      asReply: true,
      parseMode: 'html',
    });
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
            }, {
              omitPipError: true,
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
  } if (sessions[msg.from.id].state === states.WAIT_FOR_DATA_VALIDATION) {
    const { beastsToValidate, lastForwardDate, firstForwardDate } = sessions[msg.from.id];

    if (msg.forward_date > lastForwardDate || msg.forward_date < (firstForwardDate - (3 * 60 * 60))) {
      return msg.reply.text('Дата этого форврада за пределами форвардов из твоего круга - наебать меня вздумал?', {
        asReply: true,
      });
    }

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

    const isWalkingBeastFaced = regExpSetMatcher(msg.text, {
      regexpSet: regexps.walkingBeastFaced,
    });

    const isAltInBattle = regExpSetMatcher(msg.text, {
      regexpSet: regexps.altInBattle,
    });

    const isHaloDungeonBeastFaced = regExpSetMatcher(msg.text, {
      regexpSet: regexps.haloDungeonBeastFaced,
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
    } else if (isWalkingBeastFaced) {
      data = parseBeastFaced.parseWalkingBeastFaced(msg.text);
      dataType = 'walkingBeastFaced';
      beastName = data.name;
    } else if (isHaloDungeonBeastFaced) {
      data = parseBeastFaced.parseHaloDungeonBeastFaced(msg.text);
      dataType = 'dungeonBeastFaced';
      beastName = data.name;
    }

    const isForwardValid = ({ dataType, beastName, beastType }) => {
      let beastValidationTimeScope = beastsToValidate.map((beast, index) => ({ ...beast, index }));
      const beastIndexToRemove = date => beastValidationTimeScope.sort((a, b) => Math.abs(date - a.date) - Math.abs(date - b.date))[0].index;

      beastValidationTimeScope = beastValidationTimeScope.filter(({ date }) => {
        let timeOffset;

        if (isDungeonBeastFaced || isHaloDungeonBeastFaced) {
          timeOffset = date - (20 * 60);
        } else if (isLocation) {
          timeOffset = date - (3 * 60 * 60);
        } else if (isWalkingBeastFaced) {
          timeOffset = date - (60 * 60);
        }

        return msg.forward_date > timeOffset;
      });

      if (beastValidationTimeScope.length === 0) {
        return false;
      }

      if (dataType === 'walkingBeastFaced') {
        if (beastValidationTimeScope.some(beast => (beast.name.indexOf(beastName) !== -1))) {
          const beastIndex = beastIndexToRemove(msg.forward_date);
          sessions[msg.from.id].beastsToValidate = sessions[msg.from.id].beastsToValidate.filter((beast, index) => index !== beastIndex);

          return true;
        }

        return null;
      }

      if (dataType === 'dungeonBeastFaced') {
        if (beastValidationTimeScope.every(beast => beast.name !== beastName && beast.name !== '???')) {
          return false;
        }

        const beastIndex = beastIndexToRemove(msg.forward_date);
        sessions[msg.from.id].beastsToValidate = sessions[msg.from.id].beastsToValidate.filter((beast, index) => index !== beastIndex);

        return true;
      }

      if (beastValidationTimeScope.every(beast => (beast.name !== beastName && beast.name !== '???') || beast.type !== beastType)) {
        return false;
      }

      const beastIndex = beastIndexToRemove(msg.forward_date);
      sessions[msg.from.id].beastsToValidate = sessions[msg.from.id].beastsToValidate.filter((beast, index) => index !== beastIndex);

      return true;
    };

    if (isAltInBattle) {
      return msg.reply.text(`Это конечно форвард с мобом, но это не форвард встречи.
Форвар встречи они выглядит как-то так:
<code>Во время вылазки на тебя напал...</code>
или
<code>...перегородил тебе путь.</code>
или
<code>устрашающе начал приближаться...</code>

Если у тебя нет на это времени жми /skipbeastforwards
<i>ВНИМАНИЕ: ПРИ НАЖАТИИ НА /skipbeastforwards - БОТ ПРОИГНОРИРУЕТ ДАННЫЕ, КОТОРЫЕ ЗАВИСЯТ ОТ УКАЗАНЫХ ВЫШЕ ФОРВАРДОВ, И НЕ ЗАПИШЕТ ИХ В БАЗУ</i>`, {
        asReply: true,
        parseMode: 'html',
      });
    } if (isForwardValid({ dataType, beastName, beastType }) === false) {
      return msg.reply.text(`Этот моб не похож на того с которым ты дрался в это время. Ты чё - наебать меня вздумал?!
Забыл кто мне нужен? Жми /showBeastsToValidate


Если ты передумал её кидать - жми /skipbeastforward
<b>Но тогда я проигнорирую всю ту информацию которая требует форвардов</b>`, {
        asReply: true,
        parseMode: 'html',
      });
    } if (isForwardValid({ dataType, beastName, beastType }) === null) {
      return msg.reply.text(`Возможно ты и на самом деле убегал от этого моба, но к сожалению форвард мне это никак не докажет :с
Рекомендую "проигнорировать" этого моба используя комманду <b>/ignore_</b>, что находиться под мобом.

Список форвардов встреч, которые мне нужны - /showBeastsToValidate`, {
        asReply: true,
        parseMode: 'html',
      });
    }

    if (isLocation || isDungeonBeastFaced || isWalkingBeastFaced || isHaloDungeonBeastFaced) {
      sessions[msg.from.id].data.push({
        data,
        dataType,
        date: msg.forward_date,
      });

      if (sessions[msg.from.id].beastsToValidate.length === 0) {
        return msg.reply.text('Супер, я вижу встречу с мобом - сейчас обработаю её вместе с твоими форвардами').then(() => processUserData(msg, {
          usePip: sessions[msg.from.id].processDataConfig.usePip,
          useBeastFace: sessions[msg.from.id].processDataConfig.useBeastFace,
        }));
      }

      return msg.reply.text(getBeastToValidateMessage(sessions[msg.from.id].beastsToValidate, sessions[msg.from.id].beastRequest, false, false), {
        asReply: true,
        parseMode: 'html',
      });
    }
    return msg.reply.text(`
Это не похоже на встречу моба. Если ты передумал её кидать - жми /skipbeastforward

*Но тогда я проигнорирую эту "неподтверждённую"*
            `, {
      asReply: true,
    });
  } if (sessions[msg.from.id].state === states.WAIT_FOR_FORWARD_END) {
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

    const isWalkingBeastFaced = regExpSetMatcher(msg.text, {
      regexpSet: regexps.walkingBeastFaced,
    });

    const isHaloDungeonBeastFaced = regExpSetMatcher(msg.text, {
      regexpSet: regexps.haloDungeonBeastFaced,
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
    } else if (isHaloDungeonBeastFaced) {
      data = parseBeastFaced.parseHaloDungeonBeastFaced(msg.text);
      dataType = 'dungeonBeastFaced';
    } else if (isWalkingBeastFaced) {
      data = parseBeastFaced.parseWalkingBeastFaced(msg.text);
      dataType = 'walkingBeastFaced';
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

    if (isRegularBeast || isLocation || isFlee || isDeathMessage || isDungeonBeastFaced || (isClassicPip || isSimplePip) || isDungeonBeast || isWalkingBeastFaced || isHaloDungeonBeastFaced) {
      sessions[msg.from.id].data.push({
        data,
        dataType,
        date: msg.forward_date,
        userId: msg.from.id,
      });
    }
  } else if (
    sessions[msg.from.id].state !== states.WAIT_FOR_PIP_FORWARD
        && sessions[msg.from.id].state !== states.WAIT_FOR_DATA_VALIDATION
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

    const isWalkingBeastFaced = regExpSetMatcher(msg.text, {
      regexpSet: regexps.walkingBeastFaced,
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

    const isHaloDungeonBeastFaced = regExpSetMatcher(msg.text, {
      regexpSet: regexps.haloDungeonBeastFaced,
    });

    const isRegularBeast = regExpSetMatcher(msg.text, {
      regexpSet: regexps.regularBeast,
    });

    const isFlee = regExpSetMatcher(msg.text, {
      regexpSet: regexps.flee,
    });

    const isLocation = regExpSetMatcher(msg.text, {
      regexpSet: regexps.location,
    });

    const isDungeonBeast = regExpSetMatcher(msg.text, {
      regexpSet: regexps.dungeonBeast,
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

          newGiant.save().then(() => {
            userManager.addPoints(msg.from.id, forwardPoints.discoveryGiantData).then((result) => {
              if (!result.ok) {
                if (result.reason === 'USER_NOT_FOUND') {
                  return msg.reply.text('Не могу начислить тебе шмепсели пока ты не скинешь мне свой пип-бой :с');
                }
              }

              return msg.reply.text(`Спасибо за форвард! Я добавил <b>${giant.name}</b> в базу!\nНачислил тебе ${forwardPoints.discoveryGiantData} 💎<b>Шмепселей</b>`, {
                asReply: true,
                parseMode: 'html',
              });
            });
          }).catch(e => console.log(e));
        } else {
          if (databaseGiant.forwardStamp >= msg.forward_date) {
            return msg.reply.text(`Прости, у меня есть более свежая иформация про *${giant.name}*`, {
              asReply: true,
              parseMode: 'markdown',
            });
          }
          databaseGiant.health.current = giant.healthCurrent;
          databaseGiant.health.cap = giant.healthCap;
          databaseGiant.forwardStamp = msg.forward_date;

          if (!databaseGiant.distance) {
            databaseGiant.distance = giant.distance;
          }

          const wasDead = databaseGiant.health.current <= 0;
          const isDead = giant.healthCurrent <= 0;

          const pointsToAdd = ((!wasDead && isDead) || (wasDead && !isDead)) ? forwardPoints.newGiantData : forwardPoints.sameGiantData;

          databaseGiant.save().then(() => {
            userManager.addPoints(msg.from.id, pointsToAdd).then((result) => {
              if (!result.ok) {
                if (result.reason === 'USER_NOT_FOUND') {
                  return msg.reply.text('Не могу начислить тебе шмепсели пока ты не скинешь мне свой пип-бой :с');
                }
              }

              return msg.reply.text(`Спасибо за форвард! Я обновил <b>${giant.name}</b> в базе!\nНачислил тебе ${pointsToAdd} 💎<b>Шмепселей</b>`, {
                asReply: true,
                parseMode: 'html',
              });
            });
          }).catch(e => console.log(e));
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

          newGiant.save().then(() => {
            userManager.addPoints(msg.from.id, forwardPoints.discoveryGiantData).then((result) => {
              if (!result.ok) {
                if (result.reason === 'USER_NOT_FOUND') {
                  return msg.reply.text('Не могу начислить тебе шмепсели пока ты не скинешь мне свой пип-бой :с');
                }
              }

              return msg.reply.text(`Спасибо за форвард! Я добавил <b>${giant.name}</b> в базу!\nНачислил тебе ${forwardPoints.discoveryGiantData} 💎<b>Шмепселей</b>`, {
                asReply: true,
                parseMode: 'html',
              });
            });
          }).catch(e => console.log(e));
        } else if (databaseGiant.forwardStamp >= msg.forward_date) {
          return msg.reply.text(`Прости, у меня есть более свежая иформация про *${giant.name}*`, {
            asReply: true,
            parseMode: 'markdown',
          });
        } else {
          databaseGiant.health.current = giant.healthCurrent;
          databaseGiant.health.cap = giant.healthCap;
          databaseGiant.forwardStamp = msg.forward_date;

          const wasDead = databaseGiant.health.current <= 0;
          const isDead = giant.healthCurrent <= 0;

          const pointsToAdd = ((!wasDead && isDead) || (wasDead && !isDead)) ? forwardPoints.newGiantData : forwardPoints.sameGiantData;

          databaseGiant.save().then(() => {
            userManager.addPoints(msg.from.id, pointsToAdd).then((result) => {
              if (!result.ok) {
                if (result.reason === 'USER_NOT_FOUND') {
                  return msg.reply.text('Не могу начислить тебе шмепсели пока ты не скинешь мне свой пип-бой :с');
                }
              }

              return msg.reply.text(`Спасибо за форвард! Я обновил <b>${giant.name}</b> в базе!\nНачислил тебе ${pointsToAdd} 💎<b>Шмепселей</b>`, {
                asReply: true,
                parseMode: 'html',
              });
            });
          }).catch(e => console.log(e));
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
          return msg.reply.text(`Прости, я не знаю на каком километре живёт <b>${giant.name}</b>. Ты можешь сначала скинуть локацию с этим боссом, а потом свою битву.`, {
            asReply: true,
            parseMode: 'html',
          });
        } if (fGiant.forwardStamp >= msg.forward_date) {
          return msg.reply.text(`Прости, у меня есть более свежая иформация про *${giant.name}*`, {
            asReply: true,
            parseMode: 'markdown',
          });
        }

        databaseGiant.health.current = giant.healthCurrent;
        databaseGiant.health.cap = giant.healthCap;
        databaseGiant.forwardStamp = msg.forward_date;

        const wasDead = databaseGiant.health.current <= 0;
        const isDead = giant.healthCurrent <= 0;

        const pointsToAdd = ((!wasDead && isDead) || (wasDead && !isDead)) ? forwardPoints.newGiantData : forwardPoints.sameGiantData;

        databaseGiant.save().then(() => {
          userManager.addPoints(msg.from.id, pointsToAdd).then((result) => {
            if (!result.ok) {
              if (result.reason === 'USER_NOT_FOUND') {
                return msg.reply.text('Не могу начислить тебе шмепсели пока ты не скинешь мне свой пип-бой :с');
              }
            }

            return msg.reply.text(`Спасибо за форвард! Я обновил <b>${giant.name}</b> в базе!\nНачислил тебе ${pointsToAdd} 💎<b>Шмепселей</b>`, {
              asReply: true,
              parseMode: 'html',
            });
          });
        }).catch(e => console.log(e));

        return false;
      });
    } else if (isRegularBeastFaced) {
      const beast = parseBeastFaced.parseRegularBeastFaced(msg.text);

      routedBeastView(Beast, {
        name: beast.name,
        type: beast.type,
        isDungeon: false,
        subType: 'regular',
      }, null, {
        env: process.env.ENV,
        VERSION,
      }).then(({ reply, beast }) => {
        if (reply !== false) {
          const beastReplyMarkup = getBeastKeyboard(beast._id.toJSON());

          return msg.reply.text(reply, {
            replyMarkup: beastReplyMarkup,
            parseMode: 'html',
          }).catch(e => console.log(e));
        }
        return msg.reply.text('Прости, я никогда не слышал про этого моба :c', {
          asReply: true,
        }).catch(e => console.log(e));
      }).catch(e => console.log(e));
    } else if (isWalkingBeastFaced) {
      const beast = parseBeastFaced.parseWalkingBeastFaced(msg.text);

      Beast.findOne({
        name: new RegExp(beast.name, 'i'),
        subType: 'walking',
      }).then((fBeast) => {
        if (fBeast !== null) {
          return msg.reply.text(`Хей, у меня есть данные про гуляющего *${beast.name}*, но я пока что не умею их выводить, прости :с`, {
            asReply: true,
            parseMode: 'markdown',
          }).catch(e => console.log(e));
        }

        return msg.reply.text(`Чёрт, я никогда не слышал про гуляющего *${beast.name}*, прости :с`, {
          asReply: true,
          parseMode: 'markdown',
        });
      }).catch(e => console.log(e));
    } else if (isDungeonBeastFaced) {
      const oBeast = parseBeastFaced.parseDungeonBeastFaced(msg.text);

      routedBeastView(Beast, {
        name: oBeast.name,
        isDungeon: true,
      }, null, {
        env: process.env.ENV,
        VERSION,
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
    } else if (isHaloDungeonBeastFaced) {
      const oBeast = parseBeastFaced.parseHaloDungeonBeastFaced(msg.text);

      routedBeastView(Beast, {
        name: oBeast.name,
        isDungeon: true,
      }, null, {
        env: process.env.ENV,
        VERSION,
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
    } else if (isRegularBeast || isFlee || isDungeonBeast) {
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
      } else if (isDungeonBeast) {
        data = beastParser.parseRegularBeast(msg.text);
        dataType = 'dungeonBeast';
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
    } else if (isLocation && !isGiantFaced) {
      const location = parseLocation(msg.text);

      Giant.findOne({
        distance: location.distance,
      }).then((databaseGiant) => {
        if (databaseGiant !== null) {
          if (databaseGiant.forwardStamp >= msg.forward_date) {
            return msg.reply.text('Прости, ничего не могу с этим сделать 🤷‍♂️', {
              asReply: true,
              parseMode: 'markdown',
            });
          }

          const wasDead = databaseGiant.health.current <= 0;
          const isDead = 0;

          if (wasDead !== isDead) {
            databaseGiant.health.current = 0;
            databaseGiant.forwardStamp = msg.forward_date;

            databaseGiant.save().then(() => {
              userManager.addPoints(msg.from.id, forwardPoints.newGiantData).then((result) => {
                if (!result.ok) {
                  if (result.reason === 'USER_NOT_FOUND') {
                    msg.reply.text('Не могу начислить тебе шмепсели пока ты не скинешь мне свой пип-бой :с');
                  }
                }

                return msg.reply.text(`Спасибо за форвард! Я обновил состояние <b>${databaseGiant.name}</b> в базе!\nНачислил тебе ${forwardPoints.newGiantData} 💎<b>Шмепселей</b>`, {
                  asReply: true,
                  parseMode: 'html',
                });
              });
            }).catch(e => console.log(e));
          }
        } else {
          return msg.reply.text('Прости, ничего не могу с этим сделать 🤷‍♂️', {
            asReply: true,
            parseMode: 'markdown',
          });
        }

        return false;
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

bot.on(['/journeyforwardstart', '/go'], (msg) => {
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
Ну а как закончишь - смело жми кнопку \`[🙅‍♂️ Стоп]\`!
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

bot.on(['/skipbeastforward', '/skipbeastforwards'], (msg) => {
  if (_.isEmpty(sessions)) {
    return msg.reply.text('Слушай, а мне собственно нечего игнорировать. Может меня опять какой-то пидор перезагрузил, не знаешь?', {
      asReply: true,
      replyMarkup: defaultKeyboard,
    });
  }

  sessions[msg.from.id].beastsToValidate.forEach((beast) => {
    sessions[msg.from.id].data = sessions[msg.from.id].data.map((entry) => {
      if (entry.date === beast.date) {
        return {
          ...entry,
          ignore: true,
        };
      }

      return entry;
    });
  });


  msg.reply.text('Окей, обработаю что смогу').then(() => {
    sessions[msg.from.id].state = states.WAIT_FOR_DATA_TO_PROCESS;
    sessions[msg.from.id].processDataConfig.useBeastFace = false;
    sessions[msg.from.id].beastsToValidate = [];

    processUserData(msg, {
      usePip: sessions[msg.from.id].processDataConfig.usePip,
      useBeastFace: sessions[msg.from.id].processDataConfig.useBeastFace,
    });
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

Оу, похоже я ещё ничего не знаю про твой пип - без него я не смогу тебе помочь :с
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

bot.on('/debug', (msg) => {
  createSession(msg.from.id);

  const updatesData = {
    locations: [],
    beasts: [{
      isDungeon: false,
      subType: null,
      name: '👤Майкл Майерс (Виновник этого торжества)',
      type: 'DarkZone',
      date: 1541030493,
      proofedByForward: false,
      distanceRange: [{ value: 64 }],
      battles: [
        {
          outcome: 'win',
          stats: { armor: 322, damage: 1384 },
          totalDamageGiven: 2599,
          totalDamageReceived: 0,
          damagesGiven: [1321, 1278],
          damagesReceived: [0],
          healthOnStart: 411,
          stamp: '154103049356019931',
          distance: 64,
        },
      ],
      receivedItems: { Микрочип: [1] },
      capsReceived: [{ value: 7609 }],
      materialsReceived: [{ value: 11370 }],
    }],
  };

  const { processDataConfig: options } = sessions[msg.from.id];

  actualProcessUserData(msg, {
    errors: [],
  }, updatesData, options);
});

bot.on(/^\d+$/, (msg) => {
  switch (sessions[msg.from.id].state) {
    case states.WAIT_FOR_DISTANCE: {
      const reachableKm = Number(msg.text);

      if (reachableKm > 104) {
        msg.reply.text('Бля, ну не гони - давай чуть более реалистичней, окей ?)');
      } else if (reachableKm <= 104) {
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

      if (upgradeAmountValidation(pip, skillToUpgrade, upgradeAmount)) {
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
🛡- прочность, уменьшается при попадании монстров или игроков по дрону.
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
      const time = moment(giant.forwardStamp * 1000).add(3, 'hour').format('DD.MM.YYYY HH:mm');

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

  routedBeastView(Beast, {
    ...searchParams,
  }, null, {
    env: process.env.ENV,
    VERSION,
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

bot.on('/delete_giants', (msg) => {
  if (process.env.ENV === 'STAGING') {
    Giant.collection.drop().then(() => msg.reply.text('Я удалил всех гигантов', {
      asReply: true,
    }));
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
        const time = moment(giant.forwardStamp * 1000).add(3, 'hour').format('DD.MM.YYYY HH:mm');

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

*Если Гигант вас ударит в ответ и у вас не менее 25% здоровья, то у вас останется 1 хп. Если у вас остается менее 25% здоровья и вы получаете удар, то вы умираете.*

Если вы в числе последних добиваете гиганта - получите награду.

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

    Beast.find({
      isDungeon: false, subType: 'regular', distanceRange: { $gte: Number(from), $lte: Number(to) }, type: beastType,
    }, 'battles.totalDamageReceived name id').then((beasts) => {
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

    const searchParams = process.env.ENV === 'PRODUCTION' ? {
      _id: beastId,
      isDungeon: false,
    } : {
      _id: beastId,
    };

    routedBeastView(Beast, searchParams, route, {
      env: process.env.ENV,
      VERSION,
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
    subType: 'regular',
    'distanceRange.value': {
      $gte: Number(from),
      $lte: Number(to),
    },
    type: beastType,
  }, 'battles.totalDamageReceived name id distanceRange').then((beasts) => {
    const jsonBeasts = beasts.map((b) => {
      const jsoned = b.toJSON();

      return {
        id: b.id,
        ...jsoned,
      };
    });

    const beastsByDamage = _.sortBy(jsonBeasts, v => v.battles.totalDamageReceived);

    const actualBeasts = beastsByDamage.filter(({ distanceRange }) => {
      const actualRanges = distanceRange.filter(({ version }) => version === VERSION);
      const deprecatedRanges = distanceRange.filter(({ version }) => version !== VERSION);

      const actualRangesFulfillGiven = actualRanges.every(({ value }) => value >= from && value <= to);

      if (actualRanges.length >= DATA_THRESHOLD) {
        return actualRangesFulfillGiven;
      } if (actualRanges.length <= DATA_THRESHOLD && deprecatedRanges.length > 0) {
        return true;
      }

      return false;
    });

    const beastsList = actualBeasts.map(beast => `
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
  if (process.env.ENV === 'STAGING' || process.env.ENV === 'LOCAL') {
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

bot.on(/\/ignore_(.+)/, (msg) => {
  if (_.isEmpty(sessions)) {
    return msg.reply.text('Слушай, а мне собственно нечего игнорировать. Может меня опять какой-то пидор перезагрузил, не знаешь?', {
      asReply: true,
      replyMarkup: defaultKeyboard,
    });
  }

  const [, date] = /\/ignore_(.+)/.exec(msg.text);
  const { beastsToValidate } = sessions[msg.from.id];
  const index = _.findIndex(beastsToValidate, beast => beast.date === Number(date));

  if (Number.isInteger(index) || !date) {
    if (beastsToValidate !== undefined && beastsToValidate.length > 0) {
      if (beastsToValidate[index] !== undefined) {
        const { data } = sessions[msg.from.id];

        sessions[msg.from.id].beastsToValidate = sessions[msg.from.id].beastsToValidate.filter((entry, key) => key !== index);
        sessions[msg.from.id].data = data.map((entry) => {
          if (entry.date === Number(date)) {
            return {
              ...entry,
              ignore: true,
            };
          }

          return entry;
        });

        if (beastsToValidate.length === 1) {
          sessions[msg.from.id].state = states.WAIT_FOR_DATA_TO_PROCESS;

          processUserData(msg, {
            usePip: sessions[msg.from.id].processDataConfig.usePip,
            useBeastFace: sessions[msg.from.id].processDataConfig.useBeastFace,
          });

          return;
        }
        return msg.reply.text(getBeastToValidateMessage(sessions[msg.from.id].beastsToValidate, sessions[msg.from.id].beastRequest), {
          parseMode: 'html',
          replyMarkup: 'hide',
        });
      }

      return msg.reply.text('Эм, я такой команды тебе не давал, а туда ли ты воюешь?', {
        asReply: true,
      });
    }

    return msg.reply.text('Слушай, а мне собственно нечего игнорировать. Может меня опять какой-то пидор перезагрузил, не знаешь?', {
      asReply: true,
      replyMarkup: defaultKeyboard,
    });
  }

  return msg.reply.text('Ты какую-то хуйню сделал. Моя твоя не понимать.', {
    asReply: true,
  });
});

bot.on('/delete_all_beasts', (msg) => {
  if (process.env.ENV === 'STAGING' || process.env.ENV === 'LOCAL') {
    mongoose.connection.db.dropCollection('beasts', (err, result) => msg.reply.text('Все мобы удалёны'));
  }
});

bot.on('/state', (msg) => {
  if (process.env.ENV === 'STAGING' || process.env.ENV === 'LOCAL') {
    return msg.reply.text(sessions ? (sessions[msg.from.id] ? sessions[msg.from.id].state : 'null') : 'null');
  }
});

bot.on('/showBeastsToValidate', (msg) => {
  if (!_.isEmpty(sessions)) {
    if (sessions[msg.from.id] !== undefined) {
      if (sessions[msg.from.id].beastsToValidate.length > 0) {
        return msg.reply.text(getBeastToValidateMessage(sessions[msg.from.id].beastsToValidate, sessions[msg.from.id].beastRequest), {
          parseMode: 'html',
          replyMarkup: 'hide',
        }).catch(e => console.log(e));
      }
    }
  }
});

bot.on('/reset_beast_database', (msg) => {
  if (process.env.ENV === 'STAGING' || process.env.ENV === 'LOCAL') {
    msg.reply.text('ПЕРЕХОЖУ В РЕЖИМ СБРОСА БАЗЫ...\nЖДИ СООБЩЕНИЯ С ✅ГАЛОЧКАМИ✅');

    const performBulkInsert = () => {
      Beast.insertMany(signedBeasts, (error) => {
        if (error) {
          msg.reply.text(`Произошла проблема: ${error}`);
        } else {
          msg.reply.text('✅БАЗА МОБОВ НАПОЛНЕНА!✅');
        }
      });
    };

    Beast.find().then((beasts) => {
      if (beasts.length === 0) {
        performBulkInsert();
      } else {
        Beast.remove({}, () => {
          performBulkInsert();
        });
      }
    });
  }
});

bot.on('/help_icons', msg => msg.reply.text(`
✅ - Информация собрана <b>только</b> из актуальной версии ВВ
⚠️ - Информация собрана из данных актуальной версии ВВ и прошлых версий ВВ
‼️ - Информация собрана <b>только</b> из прошлых версий ВВ

Иконки сообщают об "свежести" данных о мобе.
    Что в нашем понимании "свежесть"? Представьте себе моба "🐲Трог (Воин)". Его урон, здоровье, лут и другие характеристики могут отличаться от каждой из версий WW (2.1/2.0/1.8). Раньше Ассистент держал все эти версии условного моба как единую запись, из за этого информация была слишком расплывчата.
    Мы же внедрили систему в ассистента которая различает разные версии мобов как раз для поддержания максимального уровня актуальности данных.
    На случай если Ассистент не сможет предоставить вам актуальную информацию - он постарается найти данные о мобе со старых версий, и конечно же - он вам сообщит когда вы будете просматривать "устаревшую" информацию что бы вы понимали что вы имеете дело с рисковым выбором.`, {
  parseMode: 'html',
  asReply: true,
}));


bot.connect();
