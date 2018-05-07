const locationNameRegExp = /^(.+)\n❤️/;
const healthRegExp = /❤️(-|)\d+\/\d+/;
const hungerRegExp = /🍗\d+\%/;
const staminaRegExp = /🔋\d+\/\d+/;
const campDistanceRegExp = /👣(\d+)км от лагеря/;
const receivedCapsRegExp = /Ты заработал: 🕳(\d+)/;
const receivedMaterialsRegExp = /Получено: 📦(\d+)/;
const receivedItemRegExp = /Получено: (?!📦)(.+)/;
const receivedBonusItemRegExp = /Бонус: (.+)/;
const injuryRegExp = /Ты ранен: 💔-(\d+)/;
const capsLostRegExp = /Ты потерял: 🕳(\d+)/;
const materialsLostRegExp = /Проебано: 📦(\d+)/;

const actionReceivedCapsRegExp = /Получено крышек: 🕳(\d+)/;
const actionReceivedMaterialsRegExp = /Получено материалов: 📦(\d+)/;

const beastNameRegExp = /Сражение с (.+)/;
const beastAttackRegExp = /.+ 💔-(\d+)/;
const beastStunRegExp = /(.+) оглушен ударом 💫/;
const playerBeastAttackRegExp = /👤Ты .+ 💥(\d+)/;
const dungeonBeastAppeared = /(.+) перегородил тебе путь/;
const beastDefeatRegExp = /Тебя буквально размазали/;
const beastVictoryRegExp = /Ты одержал победу!/;
const beastDefeatCapsLostRegExp = /Потеряно крышек: 🕳(\d+)/;
const beastDefeatMaterialsLostRegExp = /Потеряно материалов: 📦(\d+)/;
const deathMessageRegExp = /Потеряно: 🕳(\d+) и 📦(\d+)/;

const junkmanRegExp = /Ты встретил бродячего торговца/;
const junkManItems = /(.+) — (\d+)/g;

const every = {
    contains: [healthRegExp, hungerRegExp, staminaRegExp, campDistanceRegExp]
};

const location = {
    contains: [every.contains, locationNameRegExp],
    conditional: [
        receivedCapsRegExp,
        receivedMaterialsRegExp,
        receivedBonusItemRegExp,
        injuryRegExp,
        capsLostRegExp,
        materialsLostRegExp,
        receivedItemRegExp,
        actionReceivedCapsRegExp,
        actionReceivedMaterialsRegExp
    ],
    excludes: [beastNameRegExp]
};

const regularBeast = {
    contains: [every.contains, beastNameRegExp],
    conditional: [
        beastAttackRegExp,
        beastStunRegExp,
        playerBeastAttackRegExp,
        beastDefeatRegExp,
        beastVictoryRegExp,
        receivedItemRegExp,
        beastDefeatCapsLostRegExp,
        beastDefeatMaterialsLostRegExp,
        actionReceivedCapsRegExp,
        actionReceivedMaterialsRegExp
    ]
};

const dungeonBeast = {
    contains: [every.contains, beastNameRegExp],
    conditional: [
        beastAttackRegExp,
        beastStunRegExp,
        playerBeastAttackRegExp,
        beastDefeatRegExp,
        beastVictoryRegExp,
        beastDefeatCapsLostRegExp,
        beastDefeatMaterialsLostRegExp
    ],
    excludes: [
        receivedItemRegExp,
        actionReceivedCapsRegExp,
        actionReceivedMaterialsRegExp
    ]
}

const regexps = {
    locationNameRegExp,
    healthRegExp,
    hungerRegExp,
    staminaRegExp,
    campDistanceRegExp,
    receivedCapsRegExp,
    receivedMaterialsRegExp,
    receivedItemRegExp,
    receivedBonusItemRegExp,
    injuryRegExp,
    capsLostRegExp,
    materialsLostRegExp,
    actionReceivedCapsRegExp,
    actionReceivedMaterialsRegExp,
    beastNameRegExp,
    beastAttackRegExp,
    beastStunRegExp,
    playerBeastAttackRegExp,
    dungeonBeastAppeared,
    beastDefeatRegExp,
    beastVictoryRegExp,
    beastDefeatCapsLostRegExp,
    beastDefeatMaterialsLostRegExp,
    deathMessageRegExp,
    junkmanRegExp,
    junkManItems
}

module.exports = {
    every,
    location,
    regularBeast,
    dungeonBeast,
    regexps
};