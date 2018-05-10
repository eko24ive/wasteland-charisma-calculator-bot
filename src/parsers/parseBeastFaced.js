const {
    regexps
} = require('../regexp/regexp');

const parseRegularBeastFaced = data => {
    const splitted = data.split('\n');

    const [, distance] = regexps.campDistanceRegExp.exec(data);
    const [, name] = regexps.beastFacedRegExp.exec(data);

    return {
        distance: Number(distance),
        name
    }
};

const parseDungeonBeastFaced = data => {
    const [, name] = regexps.dungeonBeastFaced.exec(data);

    return {
        name
    };
}

module.exports = {
    parseRegularBeastFaced,
    parseDungeonBeastFaced
};