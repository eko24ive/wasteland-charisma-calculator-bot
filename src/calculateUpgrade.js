const constants = require('./constants/constants');
const defaultSkillCost = require('./constants/defaultSkillCost');
const defaultCharismaCost = require('./constants/defaultCharismaCost');
const mobs = require('./constants/mobs');
const mobsRanges = require('./constants/mobsRanges');

const skillMap = {
    'Здоровье': 'healthMax',
    'Сила': 'parsedStrength',
    'Меткость': 'parsedDexterity',
    'Харизма': 'parsedCharisma',
    'Ловкость': 'parsedAgility'
}

const calculatePerkDiscount = (charismaLevel) => {
    if (charismaLevel >= 2) {
        return (charismaLevel - 1) * constants.charismaSkillAffection;
    }

    return 0;
}

const amountToSpend = (
    charismaLevel,
    skillRangeFrom,
    skillRangeTo
) => {
    const discount = calculatePerkDiscount(charismaLevel);

    const skillCostWithDiscount = defaultSkillCost.map(level => {
        const costWithDiscount = level.caps - discount;
        if (costWithDiscount < 10) {
            return 10;
        }

        return costWithDiscount;
    }).slice(skillRangeFrom, skillRangeTo);

    const sum = skillCostWithDiscount.reduce((a, b) => a + b);

    return sum;
}

/* const skillCostWithDiscount = (
    charismaLevel,
    skillRangeFrom,
    skillRangeTo
) => {
    const slicedSkillCostWithDiscount = defaultSkillCost.map(skill => {
        const discount = calculatePerkDiscount(charismaLevel);

        const costWithDiscount = skill.caps - discount;
        if (costWithDiscount < 10) {
            return {
                level: skill.level,
                caps: 10
            };
        }

        return {
            level: skill.level,
            caps: costWithDiscount
        };
    }).slice(skillRangeFrom, skillRangeTo);

    const lowcost = slicedSkillCostWithDiscount.filter(skill => skill.caps === 10);

    if (lowcost.length > 0) {
        return [
            {
                level: `${lowcost[0].level} - ${lowcost.pop().level}`,
                caps: 10
            },
            ...slicedSkillCostWithDiscount.filter(skill => skill.caps !== 10),
        ]
    }

    return slicedSkillCostWithDiscount;
} */


var calculateAmountOfRaids = (
    reachableDistance,
    charismaLevel,
    skillRangeFrom,
    skillRangeTo
) => {
    const distanceOfRanges = {};
    const mobsFillment = [];

    const totalSpend = amountToSpend(
        charismaLevel,
        skillRangeFrom,
        skillRangeTo
    );

    if (totalSpend === null) {
        return null;
    }

    const scopeOfRanges = mobsRanges.filter(range => {
        const [start, end] = range.split('-');

        return Number(end) <= Number(reachableDistance) || Number(reachableDistance) >= Number(start);
    });

    scopeOfRanges.forEach(range => {
        const [start, end] = range.split('-');

        distanceOfRanges[range] = end - start;
    });

    const getRandomItem = array => {
        return array[Math.floor(Math.random() * array.length)];
    }

    scopeOfRanges.forEach(range => {
        const distanceOfRange = distanceOfRanges[range];
        const amountOfIterations = distanceOfRange < 2 ? distanceOfRange : Math.floor(Math.random() * 2) + 1;
        const mobsForRange = mobs[range];

        for (var i = amountOfIterations; i > 0; i--) {
            const item = getRandomItem(mobsForRange);
            mobsFillment.push(item)
        }
    })

    const bestCaseScenario = {
        caps: mobsFillment.map(mob => mob.capsMax).reduce((a, b) => Number(a) + Number(b)),
        res: mobsFillment.map(mob => mob.resMax).reduce((a, b) => Number(a) + Number(b))
    }

    const worstCaseScenario = {
        caps: mobsFillment.map(mob => mob.capsMin).reduce((a, b) => Number(a) + Number(b)),
        res: mobsFillment.map(mob => mob.resMin).reduce((a, b) => Number(a) + Number(b))
    }

    return {
        bestCaseScenario: {
            ...bestCaseScenario,
            convertedCaps: bestCaseScenario.res / 10,
            amountOfRaids: Math.ceil(totalSpend / (bestCaseScenario.res / 10 + bestCaseScenario.caps))
        },
        worstCaseScenario: {
            ...worstCaseScenario,
            convertedCaps: worstCaseScenario.res / 10,
            amountOfRaids: Math.ceil(totalSpend / (worstCaseScenario.res / 10 + worstCaseScenario.caps))
        }
    }
};

const calculateAmountSpentOnCharisma = (
    charismaLevel
) => {
    if (charismaLevel === "" || charismaLevel === 0) {
        return null;
    }

    return defaultCharismaCost.filter(c => c.level <= charismaLevel)
        .map(c => c.caps)
        .reduce((a, b) => a + b);
}

const calculateUpgrade = ({
    pip,
    upgradeSkill,
    amountToUpgrade
}) => {
    const currentSkillLevel = pip[skillMap[upgradeSkill]];
    const upgradeTo = Number(currentSkillLevel) + Number(amountToUpgrade);
    const charismaLevel = Number(pip.parsedCharisma);

    const calculations = {
        amountOfSavedFunds: calculatePerkDiscount(charismaLevel),
        amountToSpend: amountToSpend(
            charismaLevel,
            currentSkillLevel,
            upgradeTo
        ),
        raidsInfo: calculateAmountOfRaids(
            20,
            charismaLevel,
            currentSkillLevel,
            upgradeTo
        ),
        amountSpentOnCharisma: calculateAmountSpentOnCharisma(charismaLevel)
    };

    console.log(calculations);

    const res = `
    Поздравляю, ты потратил на харизму ${calculations.amountSpentOnCharisma} крышек
    Необходимо потратить ${calculations.amountToSpend} крышек для прокачки скила от ${currentSkillLevel} уровня до ${upgradeTo} уровня


    При самом удачном стечении обсоятельств тебе необходимо сделать примерно {raidsInfo.bestCaseScenario.amountOfRaids} ходок:
    Ты получишь примерно:
    - ${calculations.raidsInfo.bestCaseScenario.caps} крышек
    - ${calculations.raidsInfo.bestCaseScenario.res} материалов

    Если сбагрить материалы в ломбарде то всего будет ${calculations.raidsInfo.bestCaseScenario.convertedCaps + calculations.raidsInfo.bestCaseScenario.caps} крышек


    При самом хуёвом стечении обсоятельств тебе необходимо сделать примерно ${calculations.raidsInfo.worstCaseScenario.amountOfRaids} ходок:
    Ты получишь примерно:
    - ${calculations.raidsInfo.worstCaseScenario.caps} крышек
    - ${calculations.raidsInfo.worstCaseScenario.res} материалов

    Если сбагрить материалы в ломбарде то всего будет ${calculations.raidsInfo.worstCaseScenario.convertedCaps + calculations.raidsInfo.worstCaseScenario.caps} крышек
    За инфу о мобах, благодаря которой эта логика стала возможной огромное спасибо создателю @Wasteland Wars Helper - @radueff
    `;

    return res;
};

module.exports = calculateUpgrade;