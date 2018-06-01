const _ = require('underscore');

const testRegExpsOnString = (regexpSet, string, expectation) => {
    try {
        return regexpSet
            .map(regExp => regExp.test(string))
            .some(test => test === expectation);
    } catch (e) {
        return false;
    }
}

const regExpSetMatcher = (string, {
    regexpSet
}) => {
    let {
        contains,
        conditional,
        excludes
    } = regexpSet;

    let containsCheck = true;
    let conditionalCheck = true;
    let excludesCheck = true;

    contains = _.flatten(contains);
    conditional = _.flatten(conditional);
    excludes = _.flatten(excludes);

    if (contains !== undefined && contains.length > 0) {
        containsCheck = testRegExpsOnString(contains, string, true);
    }

    if (conditional !== undefined && conditional.length > 0) {
        conditionalCheck = testRegExpsOnString(conditional, string, true);
    }

    if (excludes !== undefined && excludes.length > 0) {
        excludesCheck = testRegExpsOnString(excludes, string, false);
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