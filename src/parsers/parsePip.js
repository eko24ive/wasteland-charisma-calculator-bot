const parsePip = ({ text }) => {
    let error;

    try {
        const nameRegExp = /(.*)\n👥Фракция/g;
        const versionRegExp = /📟Пип-бой 3000 v(\d*.\d*)/g;
        const factionRegExp = /👥Фракция: (.*)/g;
        const charismaRegExp = /🗣Харизма: (\d*)/g;
        const agilityRegExp = /🤸🏽‍♂️Ловкость: (\d*)/g;
        const damageRegExp = /⚔️Урон: (\d*)/g;
        const armorRegExp = /🛡Броня: (\d*)/g;
        const strengthRegExp = /💪Сила: (\d*)/g;
        const precisionRegExp = /🔫Меткость: (\d*)/g;
        const enduranceRegExp = /🔋Выносливость: \d*\/(\d*)/g;
        const hungerRegExp = /🍗Голод: ([\d]*)%/g;
        const healthRegExp = /❤️Здоровье: \d*\/(\d*)/g;
        const verisonRegExp = /📟Пип-бой 3000 v(.+)/g;

        const [, charisma] = charismaRegExp.exec(text);
        const [, agility] = agilityRegExp.exec(text);
        const [, name] = nameRegExp.exec(text);
        const [, damage] = damageRegExp.exec(text);
        const [, armor] = armorRegExp.exec(text);
        const [, strength] = strengthRegExp.exec(text);
        const [, precision] = precisionRegExp.exec(text);
        const [, endurance] = enduranceRegExp.exec(text);
        const [, hunger] = hungerRegExp.exec(text);
        const [, health] = healthRegExp.exec(text);
        const [, faction] = factionRegExp.exec(text);
        const [, version] =verisonRegExp.exec(text);

        const data = {
            version,
            faction,
            health,
            name,
            damage,
            armor,
            hunger,
            strength,
            precision,
            charisma,
            agility,
            endurance
        };

        Object.keys(data).forEach(key => {
            if (!Number.isNaN(Number(data[key]))) {
                data[key] = Number(data[key]);
            };
        });

        return data;
    } catch (e) {
        error = e;
    }

    try {
        const charismaRegExp = /🗣(\d*)/g;
        const agilityRegExp = /🤸🏽‍♂️(\d*)/g;
        const precisionRegExp = /🔫(\d*)/g;
        const strengthRegExp = /💪(\d*)/g;
        const armorRegExp = /🛡(\d*)/g;
        const enduranceRegExp = /🔋\d*\/(\d*)/g;
        const hungerRegExp = /🍗(\d*)%/g;
        const healthRegExp = /❤️\d*\/(\d*)/g;
        const nameRegExp = /👤(.*)/g;
        const factionRegExp = /👤.*\n├(.*)/g;
        const damageRegExp = /⚔️(\d+)/;

        const [, charisma] = charismaRegExp.exec(text);
        const [, agility] = agilityRegExp.exec(text);
        const [, strength] = strengthRegExp.exec(text);
        const [, endurance] = enduranceRegExp.exec(text);
        const [, precision] = precisionRegExp.exec(text);
        const [, hunger] = hungerRegExp.exec(text);
        const [, health] = healthRegExp.exec(text);
        const [, armor] = armorRegExp.exec(text);
        const [, name] = nameRegExp.exec(text);
        const [, faction] = factionRegExp.exec(text);
        const [, damage] = damageRegExp.exec(text);


        const data = {
            name,
            armor,
            faction,
            health,
            hunger,
            strength,
            precision,
            charisma,
            agility,
            endurance,
            damage,
            version: 0
        };

        Object.keys(data).forEach(key => {
            if (!Number.isNaN(Number(data[key]))) {
                data[key] = Number(data[key]);
            };
        });

        return data;
    } catch (e) {
        error = e;
    };

//     console.log(`
// ===============================
// [ERROR]
// ${error}
// `);

    return false;
}

module.exports = parsePip;