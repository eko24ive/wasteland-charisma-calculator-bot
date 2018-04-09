const parsePip = msg => {
    try {
        const splited = msg.split('\n');
        const [
            pipVersion, ,
            name,
            faction,
            health,
            hunger,
            damageArmor, ,
            strenthDexterity,
            charismaAgility, ,
            endurance
        ] = splited;


        const charismaAgilityRegExp = /🗣Харизма: ([\d]*).🤸🏽‍♂️Ловкость: ([\d]*)/g;
        const damageArmorRegExp = /⚔️Урон: ([\d]*) 🛡Броня: ([\d]*)/g;
        const strengthDexterityRegExp = /💪Сила: ([\d]*) 🔫Меткость: ([\d]*)/g;
        const enduranceRegExp = /🔋Выносливость: ([\d]+)\/([\d]+)/g;
        const hungerRegExp = /🍗Голод: ([\d]*)%/g;
        const healthRegExp = /❤️Здоровье: (\d*)\/(\d*)/g

        const [, parsedCharisma, parsedAgility] = charismaAgilityRegExp.exec(charismaAgility);
        const [, parsedDamage, parsedArmor] = damageArmorRegExp.exec(damageArmor);
        const [, parsedStrength, parsedDexterity] = strengthDexterityRegExp.exec(strenthDexterity);
        const [, enduranceNow, enduranceMax] = enduranceRegExp.exec(endurance);
        const [, parsedHunger] = hungerRegExp.exec(hunger);
        const [, healthNow, healthMax] = healthRegExp.exec(health);
        const parsedFaction = faction.replace('👥Фракция: ', '');

        return {
            pipVersion,
            name,
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
        }
    } catch (e) {
        return false;
    }
}

module.exports = parsePip;