require('dotenv').config();
const TeleBot = require('telebot');
const program = require('commander');

program
    .version('0.1.0')
    .option('-D, --dev', 'Running bot with test token')
    .option('-P, --prod', 'Running bot with produciton token')
    .parse(process.argv);

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

const bot = new TeleBot({
    token: getToken(),
    usePlugins: ['namedButtons'],
    polling: {
        interval: 100,
        limit: 500,
        retryTimeout: 1000
    },
    pluginConfig: {
        namedButtons: {
            buttons
        }
    }
});

bot.on('*', msg => {
    return msg.reply.text(`
*Бот выключен на момент проведения технических работ, следите за новостями на канале @wwAssistantBotNews*

Также милости просим в чат - @wwAssistantChat
    `, {
        asReply: true,
        parseMode: 'markdown'
    }).catch(e => console.log(e));
})



bot.start();
