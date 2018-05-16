const _ = require('underscore');
var async = require('async');

const multiDimensionalUnique = arr => {
  const uniques = [];
  const itemsFound = {};
  for (const i = 0, l = arr.length; i < l; i++) {
    const stringified = JSON.stringify(arr[i]);
    if (itemsFound[stringified]) {
      continue;
    }

    uniques.push(arr[i]);
    itemsFound[stringified] = true;
  }

  return uniques;
}

const filterDupes = array => {
  return array.filter((currentRange, index, arrayRO) => {
    if (index !== 0) {
      const previousRange = arrayRO[index - 1];


      const currentFirst = _.first(currentRange);
      const currentLast = _.last(currentRange);

      const previousFirst = _.first(previousRange);
      const previousLast = _.last(previousRange);

      if (currentFirst <= previousLast) {
        return false;
      }

      if (currentFirst > previousFirst && currentLast <= previousLast) {
        return false;
      }

      return true;
    }

    return true;
  });
}

const getRanges = mobs => {
  const sorted = a.map(data => {
    return data.distanceRange.sort((a, b) => {
      if (a < b)
        return -1;
      if (a > b)
        return 1;
      return 0;
    })

    return ordered;
  });

  const ordered = sorted.sort((a, b) => {
    if (a[0] < b[0])
      return -1;
    if (a[0] > b[0])
      return 1;
    return 0;
  })

  const ranged = ordered.map(range => {
    const first = _.first(range);
    const last = _.last(range);

    if (first !== last) {
      return [first, last];
    }

    return [first];
  });

  const dupeless = multiDimensionalUnique(ranged);

  let filtered = filterDupes(dupeless);

  async.whilst(
    function () {
      return !_.isEqual(filtered, filterDupes(filtered))
    },
    function (callback) {
      filtered = filterDupes(filtered);
      callback(null, filtered);
    },
    function (err, filtered) {
      return filtered;
    }
  );

  return filtered;
}

module.exports = getRanges;