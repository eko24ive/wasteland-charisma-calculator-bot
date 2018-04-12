const parsePip = msg => {
    try {
        msg = msg.split('\n').join('');



        const pipVersionRegExp = /📟Пип-бой 3000 v(\d*.\d*)/g;
        const factionRegExp = /👥Фракция: (.*)❤️/g;
        const charismaAgilityRegExp = /🗣Харизма: ([\d]*).🤸🏽‍♂️Ловкость: ([\d]*)/g;
        const damageArmorRegExp = /⚔️Урон: ([\d]*) 🛡Броня: ([\d]*)/g;
        const strengthDexterityRegExp = /💪Сила: ([\d]*) 🔫Меткость: ([\d]*)/g;
        const enduranceRegExp = /🔋Выносливость: ([\d]+)\/([\d]+)/g;
        const hungerRegExp = /🍗Голод: ([\d]*)%/g;
        const healthRegExp = /❤️Здоровье: (\d*)\/(\d*)/g;

        const [, parsedCharisma, parsedAgility] = charismaAgilityRegExp.exec(msg);
        const [, parsedDamage, parsedArmor] = damageArmorRegExp.exec(msg);
        const [, parsedStrength, parsedDexterity] = strengthDexterityRegExp.exec(msg);
        const [, enduranceNow, enduranceMax] = enduranceRegExp.exec(msg);
        const [, parsedHunger] = hungerRegExp.exec(msg);
        const [, healthNow, healthMax] = healthRegExp.exec(msg);
        const [, parsedFaction] = factionRegExp.exec(msg);
        const [, pipVersion] = pipVersionRegExp.exec(msg);



        return {
            pipVersion,
            parsedFaction,
            healthNow,
            healthMax,
            parsedHunger,
            parsedDamage,
            parsedArmor,
            parsedStrength,
            parsedDexterity,
            parsedCharisma,
            parsedAgility,
            endurance: {
                enduranceNow,
                enduranceMax
            }
        };
    } catch (e) {
        return false;
    }
}

module.exports = parsePip;