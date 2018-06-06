const numeral = require('numeral');

const constants = require('./constants/constants');
const defaultSkillCost = require('./constants/defaultSkillCost');
const defaultCharismaCost = require('./constants/defaultCharismaCost');
const mobs = require('./constants/mobs');
const mobsRanges = require('./constants/mobsRanges');

const skillMap = {
  "❤ Живучесть": "health",
  "💪 Сила": "strength",
  "🔫 Меткость": "precision",
  "🗣 Харизма": "charisma",
  "🤸‍♀️ Ловкость": "agility"
};

const formatNubmer = number => {
    const floored = Math.floor(number);

    return numeral(floored).format('0,0');
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
            amountOfRaids: totalSpend / (bestCaseScenario.res / 10 + bestCaseScenario.caps)
        },
        worstCaseScenario: {
            ...worstCaseScenario,
            convertedCaps: worstCaseScenario.res / 10,
            amountOfRaids: totalSpend / (worstCaseScenario.res / 10 + worstCaseScenario.caps)
        }
    }
};

const calculateAmountSpentOnCharisma = (
    charismaLevel
) => {
    if (charismaLevel === "" || charismaLevel === 0) {
        return null;
    }

    const spentAmount = defaultCharismaCost.filter(c => c.level <= charismaLevel)
        .map(c => c.caps)
        .reduce((a, b) => a + b);

    return spentAmount;
}

const calculateSpentOnSkill = (
    skillLevel
) => {
    const spentAmount = defaultSkillCost.filter(c => c.level <= skillLevel)
        .map(c => c.caps)
        .reduce((a, b) => a + b);

    return spentAmount;
}

const calculateUpgrade = ({
    pip,
    upgradeSkill,
    amountToUpgrade,
    reachableKm
}) => {
    const currentSkillLevel = pip[skillMap[upgradeSkill]];
    const upgradeTo = Number(currentSkillLevel) + Number(amountToUpgrade);
    const charismaLevel = Number(pip.charisma);
    const reachableDistance = Number(/\d*/.exec(reachableKm).pop());

    const calculations = {
        amountOfSavedFunds: calculatePerkDiscount(charismaLevel),
        amountToSpend: amountToSpend(
            charismaLevel,
            currentSkillLevel,
            upgradeTo
        ),
        raidsInfo: calculateAmountOfRaids(
            reachableDistance,
            charismaLevel,
            currentSkillLevel,
            upgradeTo
        ),
        amountSpentOnCharisma: calculateAmountSpentOnCharisma(charismaLevel)
    };

    const spentOnSkill = calculateSpentOnSkill(currentSkillLevel);

    /*
    При самом удачном стечении обсоятельств тебе необходимо сделать примерно ${Math.ceil(calculations.raidsInfo.bestCaseScenario.amountOfRaids)} 👣 ходок:
За одну ходку ты получишь примерно:
- ${formatNubmer(calculations.raidsInfo.bestCaseScenario.caps)} 🕳 крышек
- ${formatNubmer(calculations.raidsInfo.bestCaseScenario.res)} 📦 материалов

Если сбагрить материалы в ломбарде то суммарная выручка за ${Math.floor(calculations.raidsInfo.bestCaseScenario.amountOfRaids)} ходки с учётом крышек будет ${formatNubmer((calculations.raidsInfo.bestCaseScenario.convertedCaps + calculations.raidsInfo.bestCaseScenario.caps) * calculations.raidsInfo.bestCaseScenario.amountOfRaids)} 🕳 крышек

*/

/* _Забавный факт #1: ты потратил на харизму ${formatNubmer(calculations.amountSpentOnCharisma)} 🕳 крышек_ */
    const res = `
_Всего ты потратил ${formatNubmer(spentOnSkill)} 🕳 крышек на ${upgradeSkill}_

Необходимо потратить ${formatNubmer(calculations.amountToSpend)} 🕳 крышек для прокачки навыка \`${upgradeSkill}\` от ${currentSkillLevel} уровня до ${upgradeTo} уровня

Тебе необходимо сделать примерно *${Math.floor((calculations.raidsInfo.worstCaseScenario.amountOfRaids + 2) * 1.5)} 👣 ходок*:
\`Из-за недавнего обновления Wasteland Wars данные для расчёта ходок работают в эксперементальном режиме\`
`;
/*
За одну ходку ты получишь примерно:
- ${formatNubmer(calculations.raidsInfo.worstCaseScenario.caps)} 🕳 крышек
- ${formatNubmer(calculations.raidsInfo.worstCaseScenario.res)} 📦 материалов

Если сбагрить материалы в ломбарде то суммарная выручка за ${Math.floor(calculations.raidsInfo.worstCaseScenario.amountOfRaids)} ходки с учётом крышек будет *${formatNubmer((calculations.raidsInfo.worstCaseScenario.convertedCaps + calculations.raidsInfo.worstCaseScenario.caps) * calculations.raidsInfo.worstCaseScenario.amountOfRaids)} 🕳 крышек* */

    return res;
};

module.exports = calculateUpgrade;