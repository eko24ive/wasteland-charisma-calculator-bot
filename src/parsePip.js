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
        try {
            msg = msg.split("\n").join("");

            var charismaRegExp = /🗣(\d*)/g;
            var agilityRegExp = /🤸🏽‍♂️(\d*)/g;
            var dexterityRegExp = /🔫(\d*)/g;
            var strengthRegExp = /💪(\d*)/g;
            var enduranceRegExp = /🔋(\d*)\/(\d*)/g;
            var hungerRegExp = /🍗(\d*)%/g;
            var healthRegExp = /❤️(\d*)\/(\d*)/g;

            var [, parsedCharisma] = charismaRegExp.exec(msg);
            var [, parsedAgility] = agilityRegExp.exec(msg);
            var [, parsedStrength] = strengthRegExp.exec(msg);
            var [, enduranceNow, enduranceMax] = enduranceRegExp.exec(msg);
            var [, parsedDexterity] = dexterityRegExp.exec(msg);
            var [, parsedHunger] = hungerRegExp.exec(msg);
            var [, healthNow, healthMax] = healthRegExp.exec(msg);

            return {
                healthNow,
                healthMax,
                parsedHunger,
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
}

module.exports = parsePip;