const _ = require('underscore');

const regExpSetMatcher = (string, {
    regexpSet
}) => {
    let {
        contains,
        conditional,
        excludes
    } = regexpSet;

    let conditionalCheck = true;
    let excludesCheck = true;


    contains = _.flatten(contains);
    conditional = _.flatten(conditional);
    excludes = _.flatten(excludes);


    const containsCheck = contains
        .map(regExp => {
            return regExp.test(string);
        })
        .every(test => test === true);

    if (conditional !== undefined && conditional.length > 0) {
        conditionalCheck = conditional
            .map(regExp => regExp.test(string))
            .some(test => test === true);
    }

    if (excludes !== undefined && excludes.length > 0) {
        excludesCheck = excludes
            .map(regExp => {
                return regExp.test(string);
            })
            .every(test => test !== true);
    }

    return (containsCheck && conditionalCheck && excludesCheck);
};

const matcher = (string, regExp) => {
    return regExp.test(string);
}

module.exports = {
    matcher,
    regExpSetMatcher
};