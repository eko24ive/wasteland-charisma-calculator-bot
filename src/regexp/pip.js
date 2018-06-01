const classicNameRegExp = /(.*)\n👥Фракция/g;
const classicFactionRegExp = /👥Фракция: (.*)/g;
const classicCharismaRegExp = /🗣Харизма: (\d*)/g;
const classicAgilityRegExp = /🤸🏽‍♂️Ловкость: (\d*)/g;
const classicDamageRegExp = /⚔️Урон: (\d*)/g;
const classicArmorRegExp = /🛡Броня: (\d*)/g;
const classicStrengthRegExp = /💪Сила: (\d*)/g;
const classicPrecisionRegExp = /🔫Меткость: (\d*)/g;
const classicEnduranceRegExp = /🔋Выносливость: \d*\/(\d*)/g;
const classicHungerRegExp = /🍗Голод: ([\d]*)%/g;
const classicHealthRegExp = /❤️Здоровье: \d*\/(\d*)/g;
const classicVerisonRegExp = /📟Пип-бой 3000 v(.+)/g;

const simpleNameRegExp = /👤(.*)/g;
const simpleFactionRegExp = /👤.*\n├(.*)/g;
const simpleCharismaRegExp = /🗣(\d*)/g;
const simpleAgilityRegExp = /🤸🏽‍♂️(\d*)/g;
const simpleDamageRegExp = /⚔️(\d+)/;
const simpleArmorRegExp = /🛡(\d*)/g;
const simpleStrengthRegExp = /💪(\d*)/g;
const simplePrecisionRegExp = /🔫(\d*)/g;
const simpleEnduranceRegExp = /🔋\d*\/(\d*)/g;
const simpleHungerRegExp = /🍗(\d*)%/g;
const simpleHealthRegExp = /❤️\d*\/(\d*)/g;

const classicPip = {
    includes: [
        classicNameRegExp,
        classicFactionRegExp,
        classicCharismaRegExp,
        classicAgilityRegExp,
        classicDamageRegExp,
        classicArmorRegExp,
        classicStrengthRegExp,
        classicPrecisionRegExp,
        classicEnduranceRegExp,
        classicHungerRegExp,
        classicHealthRegExp,
        classicVerisonRegExp
    ],
    excludes: [
        simpleNameRegExp,
        simpleFactionRegExp,
        simpleCharismaRegExp,
        simpleAgilityRegExp,
        simpleDamageRegExp,
        simpleArmorRegExp,
        simpleStrengthRegExp,
        simplePrecisionRegExp,
        simpleEnduranceRegExp,
        simpleHungerRegExp,
        simpleHealthRegExp
    ]
};

const simplePip = {
    includes: classicPip.excludes,
    excludes: classicPip.includes
};

const regexps = {
    classicNameRegExp,
    classicFactionRegExp,
    classicCharismaRegExp,
    classicAgilityRegExp,
    classicDamageRegExp,
    classicArmorRegExp,
    classicStrengthRegExp,
    classicPrecisionRegExp,
    classicEnduranceRegExp,
    classicHungerRegExp,
    classicHealthRegExp,
    classicVerisonRegExp,
    simpleNameRegExp,
    simpleFactionRegExp,
    simpleCharismaRegExp,
    simpleAgilityRegExp,
    simpleDamageRegExp,
    simpleArmorRegExp,
    simpleStrengthRegExp,
    simplePrecisionRegExp,
    simpleEnduranceRegExp,
    simpleHungerRegExp,
    simpleHealthRegExp
};

module.exports = {
    classicPip,
    simplePip,
    regexps
}