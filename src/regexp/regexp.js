const locationNameRegExp = /^(.+)\n❤️/;
const locationRaidPostfixRegExp = / \(.+\)/;
const healthRegExp = /❤️(-|)(\d+)\/(\d+)/;
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
const beastDefeatFleeRegExp = /Ты проиграл в этой схватке/;
const beastSuccessFleeRegExp = /удалось избежать схватки/;
const beastVictoryRegExp = /Ты одержал победу!/;
const beastDefeatCapsLostRegExp = /Потеряно крышек: 🕳(\d+)/;
const beastDefeatMaterialsLostRegExp = /Потеряно материалов: 📦(\d+)/;
const deathMessageRegExp = /Потеряно: 🕳(\d+) и 📦(\d+)/;

const junkmanRegExp = /Ты встретил бродячего торговца/;
const junkManItems = /(.+) — (\d+)/g;

const deathMessageHeaderRegExp = /Эта вылазка могла бы стать последней для тебя/;
const deathMessageContentRegExp = /Спустя какое-то время ты пришел в себя в своем лагере/;
const deathMessageRecourcesLostRexExp = /Потеряно: 🕳(\d+) и 📦(\d+)/;

const beastFacedRegExp = /Во время вылазки на тебя напал (.+)\./;
const dungeonBeastFacedRegExp = /(.+) перегородил тебе путь./;

const metalAmountRegExp = /(.+) (\d+)/; // 🔗Кубонит 192
const multipleItemsReceived = /(.+) [x|х](\d+)/; //Провода x1
const emojiRecourceAmount = /(.+) [\u{1f300}-\u{1f5ff}\u{1f900}-\u{1f9ff}\u{1f600}-\u{1f64f}\u{1f680}-\u{1f6ff}\u{2600}-\u{26ff}\u{2700}-\u{27bf}\u{1f1e6}-\u{1f1ff}\u{1f191}-\u{1f251}\u{1f004}\u{1f0cf}\u{1f170}-\u{1f171}\u{1f17e}-\u{1f17f}\u{1f18e}\u{3030}\u{2b50}\u{2b55}\u{2934}-\u{2935}\u{2b05}-\u{2b07}\u{2b1b}-\u{2b1c}\u{3297}\u{3299}\u{303d}\u{00a9}\u{00ae}\u{2122}\u{23f3}\u{24c2}\u{23e9}-\u{23ef}\u{25b6}\u{23f8}-\u{23fa}](\d+)/u; //Кварц 🔹1
const bonusEmojiResourceAmount = /([\u{1f300}-\u{1f5ff}\u{1f900}-\u{1f9ff}\u{1f600}-\u{1f64f}\u{1f680}-\u{1f6ff}\u{2600}-\u{26ff}\u{2700}-\u{27bf}\u{1f1e6}-\u{1f1ff}\u{1f191}-\u{1f251}\u{1f004}\u{1f0cf}\u{1f170}-\u{1f171}\u{1f17e}-\u{1f17f}\u{1f18e}\u{3030}\u{2b50}\u{2b55}\u{2934}-\u{2935}\u{2b05}-\u{2b07}\u{2b1b}-\u{2b1c}\u{3297}\u{3299}\u{303d}\u{00a9}\u{00ae}\u{2122}\u{23f3}\u{24c2}\u{23e9}-\u{23ef}\u{25b6}\u{23f8}-\u{23fa}])\+(\d+)/u; //Бонус: 🔩+4

const achievmentMessageRegExp = /🏆Достижение получено!/;
const achievmentContentRegExp = /✅(.+)\n(.+)/;

const currentHealthRegExp = /❤️(.\d+)\/\d+/;


const every = {
    contains: [healthRegExp, hungerRegExp, staminaRegExp, campDistanceRegExp]
};

const location = {
    contains: [every.contains, locationNameRegExp],
    conditional: [
        every.contains,
        receivedCapsRegExp,
        receivedMaterialsRegExp,
        receivedBonusItemRegExp,
        injuryRegExp,
        capsLostRegExp,
        materialsLostRegExp,
        receivedItemRegExp,
        actionReceivedCapsRegExp,
        actionReceivedMaterialsRegExp,
        beastFacedRegExp
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

const flee = {
    contains: [
        every.contains,
    ],
    conditional: [
        beastSuccessFleeRegExp,
        beastDefeatFleeRegExp,
        beastDefeatCapsLostRegExp,
        injuryRegExp,
        beastDefeatMaterialsLostRegExp
    ]
}

const deathMessage = {
    contains: [
        deathMessageHeaderRegExp,
        deathMessageContentRegExp,
        deathMessageRecourcesLostRexExp
    ]
};

const regularBeastFaced = {
    contains: [
        beastFacedRegExp
    ]
};

const dungeonBeastFaced = {
    contains: [
        dungeonBeastFacedRegExp
    ]
};

const regexps = {
    locationNameRegExp,
    locationRaidPostfixRegExp,
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
    junkManItems,
    deathMessageRecourcesLostRexExp,
    beastFacedRegExp,
    metalAmountRegExp,
    emojiRecourceAmount,
    bonusEmojiResourceAmount,
    multipleItemsReceived,
    currentHealthRegExp,
    beastSuccessFleeRegExp,
    beastDefeatFleeRegExp
}

module.exports = {
    every,
    location,
    regularBeast,
    dungeonBeast,
    flee,
    deathMessage,
    regularBeastFaced,
    dungeonBeastFaced,
    regexps
};