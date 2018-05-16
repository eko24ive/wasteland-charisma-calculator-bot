const _ = require('underscore');
var async = require('async');

const multiDimensionalUnique = arr => {
  let uniques = [];
  let itemsFound = {};
  for (let i = 0, l = arr.length; i < l; i++) {
    let stringified = JSON.stringify(arr[i]);
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
  const sorted = mobs.map(data => {
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

  const dupeless = multiDimensionalUnique(ranged).sort((a, b) => {
    if (a[0] < b[0])
      return -1;
    if (a[0] > b[0])
      return 1;
    return 0;
  });

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

  const noSinglePoints = {};

  filtered.forEach((range, index) => {
    if(range.length !== 2 && (index + 1) < filtered.length) {
      let nextRange = filtered[index + 1];
      nextRange.push(range[0]);


      const first = _.first(nextRange);
      const last = _.last(nextRange);

      noSinglePoints[`${first}-${last}`] = [first, last];

    } else if (range.length === 2 && (index + 1) < filtered.length) {
      if(noSinglePoints[`${range[0]}-${range[1]}`] === undefined) {
        noSinglePoints[`${range[0]}-${range[1]}`] = range;
      }
    }
  })

  // return Object.keys(noSinglePoints).map(key => noSinglePoints[key].sort());
  return dupeless;
}

module.exports = getRanges;