process.on('unhandledRejection', (reason) => {
  console.log('Unhandled Rejection at:', reason.stack || reason);
});

require('dotenv').config();


const uristring = process.env.MONGODB_URI;
const { REPORT_CHANNEL_ID } = process.env;
const DATA_THRESHOLD = Number(process.env.DATA_THRESHOLD);
const DATA_THRESHOLD_DUNGEON = Number(process.env.DATA_THRESHOLD_DUNGEON);
const { VERSION } = process.env;
const botStart = Date.now() / 1000;
const Sentry = require('@sentry/node');

const async = require('async');
const mongoose = require('mongoose');
const _ = require('underscore');
const TeleBot = require('telebot');
const program = require('commander');
const moment = require('moment-timezone');

const config = require('../package.json');

const regexps = require('./regexp/regexp');

const beastSchema = require('./schemes/beast');
const validateDistanceRange = require('./utils/validateDistanceRange');

const { ranges, dzRanges, dungeonRanges } = require('./utils/getRanges');
const withBackButton = require('./utils/withBackButton');

const {
  regExpSetMatcher,
} = require('./utils/matcher');

mongoose.connect(uristring);

const Beast = mongoose.model('Beast', beastSchema);

program
  .version('0.1.0')
  .option('-D, --dev', 'Running bot with test token')
  .option('-P, --prod', 'Running bot with produciton token')
  .parse(process.argv);

let bot;

if (process.env.ENV === 'LOCAL') {
  bot = new TeleBot({
    token: process.env.BOT_TOKEN,
    polling: {
      interval: 0,
    },
  });
} else {
  const token = process.env.BOT_TOKEN;
  const host = '0.0.0.0';
  const port = process.env.PORT;
  const url = process.env.BOT_WEBHOOK_URL;

  bot = new TeleBot({
    token,
    webhook: {
      key: '/etc/ssl/private/self-signed.key',
      cert: '/etc/ssl/certs/self-signed.crt',
      url: process.env.BOT_WEBHOOK_URL,
      host: '0.0.0.0',
      port: process.env.PORT,
    },
  });
}


class BeastMaster {
  constructor() {
    this.beasts = [];
    this.isBeastsFetched = false;

    this.fetchBeasts();
  }

  fetchBeasts() {
    console.log('start fetchging');
    Beast.find({}).then((beasts) => {
      this.beasts = beasts;

      this.isBeastsFetched = true;
      console.log('finished fetching');
    });
  }

  async waitForBeastFetch() {
    return new Promise((resolve) => {
      const checker = setInterval(() => {
        if (this.isBeastsFetched) {
          resolve();
          clearInterval(checker);
        }
      }, 1000);
    });
  }

  get beastsLength() {
    return this.beasts.length;
  }
}

const bm = new BeastMaster();

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


bot.on('/start', async (msg) => {
  msg.reply.text(`found ${bm.beastsLength} beasts`);
});


const launch = async () => {
  console.log('waiting for fetching');
  await bm.waitForBeastFetch();
  console.log('fetched, starting bot');

  bot.connect();
};

launch();
