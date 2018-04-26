require('dotenv').config();
const TeleBot = require('telebot');
const program = require('commander');

const parsePip = require('./src/parsePip');
const calculateUpgrade = require('./src/calculateUpgrade');
const config = require('./package.json');

program
    .version('0.1.0')
    .option('-D, --dev', 'Running bot with test token')
    .option('-P, --prod', 'Running bot with produciton token')
    .parse(process.argv);
    
const sessions = {};

const PIP_FORWARDED = 'PIP_FORWARDED';
const SKILL_SELECTED = 'SKILL_SELECTED';
const DISTANCE_ENTERED = 'DISTANCE_ENTERED';
const LEVELS_ENTERED = 'LEVELS_ENTERED';
const EFFORT_RESPONDED = 'EFFORT_RESPONDED';

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

const amountOfLevels = (msg) => {
    const replyMarkup = bot.keyboard([
        [
            buttons.amountOfLevelsTen.label,
            buttons.amountOfLevelsTwenty.label,
            buttons.amountOfLevelsThirty.label,
            buttons.amountOfLevelsFourty.label
        ]
    ], {
        resize: true
    });

    return bot.sendMessage(msg.from.id, 'На сколько уровней хочешь прокачать?', {
        replyMarkup
    });
}

const reachableKm = (msg) => {
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

    return bot.sendMessage(msg.from.id, 'До какого км ходишь?', {
        replyMarkup
    });
}

const seedSession = id => {
    sessions[id] = {
        pip: null,
        state: null
    };
};

const states = {
    PIP_FORWARDED,
    SKILL_SELECTED,
    DISTANCE_ENTERED,
    LEVELS_ENTERED,
    EFFORT_RESPONDED
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
    label: "10",
    command: "/upgradeSkill"
  },
  amountOfLevelsTwenty: {
    label: "20",
    command: "/upgradeSkill"
  },
  amountOfLevelsThirty: {
    label: "30",
    command: "/upgradeSkill"
  },
  amountOfLevelsFourty: {
    label: "40",
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
    
    throw new Error('Please, specify bot token mode "--dev" for deveolpment and "--prod" production');
};

const bot = new TeleBot({
    token: getToken(),
    usePlugins: ['namedButtons'],
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
        msg.from.id, 'Пожалуйста, перешли мне свой пип-бой :3', { replyMarkup: 'hide' }
    );
});

bot.on('/resetSession', (msg) => {
    sessions[msg.from.id] = {
        pip: null,
        state: null
    };

    bot.sendMessage(
        msg.from.id, 'Данные сброшены - можешь скинуть свой пип-бой снова.', { replyMarkup: 'hide' }
    );
});

bot.on('/resetSessionAbort', (msg) => {
    bot.sendMessage(
        msg.from.id, 'Cброс данных отменён.', { replyMarkup: 'hide' }
    );
});

bot.on('forward', (msg) => {
    if(msg.from.is_bot) {
        return;
    }

    if (sessions[msg.from.id] === undefined) {
        seedSession(msg.from.id);
    }

    const pip = parsePip(msg);

    if (typeof pip === 'object') {
        sessions[msg.from.id].pip = pip;
        sessions[msg.from.id].state = states.PIP_FORWARDED;

        const replyMarkup = bot.keyboard([
            [buttons.skillSelectStrength.label,buttons.skillSelectAccuracy.label,buttons.skillSelectAgility.label],
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
    sessions[msg.from.id].state = states.SKILL_SELECTED;
    
    reachableKm(msg);
});

bot.on('/reachableKm', msg => {
    sessions[msg.from.id].reachableKm = msg.text;
    sessions[msg.from.id].state = states.DISTANCE_ENTERED;

    amountOfLevels(msg);
});

bot.on('/upgradeSkill', msg => {
    if (sessions[msg.from.id].state == states.EFFORT_RESPONDED) {
        return false;
    }

    sessions[msg.from.id].state = states.LEVELS_ENTERED;
    
    sessions[msg.from.id].amountToUpgrade = msg.text;

    const effort = calculateUpgrade(sessions[msg.from.id]);

    bot.sendMessage(msg.from.id, effort, { replyMarkup: "hide" });

    console.log(`
------------------------------------------
[REPLY]
User: ${sessions[msg.from.id].pip.name} | ${sessions[msg.from.id].pip.faction}
Reachable distance: ${sessions[msg.from.id].reachableKm}
Amout to upgrade: ${sessions[msg.from.id].amountToUpgrade}
`);

    sessions[msg.from.id].state = EFFORT_RESPONDED;
});

bot.on('/version', msg => msg.reply.text(config.version))

bot.on('/debug', msg => {
    const replyMarkup = bot.keyboard([
        [buttons.skillSelectStrength.label,buttons.skillSelectAccuracy.label,buttons.skillSelectAgility.label],
        [buttons.skillSelectHealth.label, buttons.skillSelectCharisma.label]
    ], {
        resize: true
    });

    return bot.sendMessage(msg.from.id, 'Что качать будешь?', {
        replyMarkup
    });
})

/*
bot.on(/\d/g, msg => {
     console.log(sessions[msg.from.id].state);
    
    switch (sessions[msg.from.id].state) {
        case states.SKILL_SELECTED:
                sessions[msg.from.id].reachableKm = msg.text;
                sessions[msg.from.id].state = states.DISTANCE_ENTERED;

                amountOfLevels(msg);
            break;
        case states.DISTANCE_ENTERED:
            sessions[msg.from.id].state = states.LEVELS_ENTERED;

            sessions[msg.from.id].amountToUpgrade = msg.text;

            const effort = calculateUpgrade(sessions[msg.from.id]);

            effort.map(info => msg.reply.text(info));

            sessions[msg.from.id].state = states.EFFORT_RESPONDED;
            break;
        default:
            break;
    } 
})*/

bot.start();