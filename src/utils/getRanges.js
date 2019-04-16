/* eslint-disable */

const _ = require('underscore');
let async = require('async');

let input = [
  [1],
  [1, 4],
  [5, 7],
  [5, 6],
  [6, 7],
  [9, 12],
  [9, 13],
  [9, 11],
  [10, 13],
  [11],
  [11, 13],
  [14, 17],
  [14],
  [14, 16],
  [15],
  [15, 17],
  [16],
  [17],
  [18, 20],
  [18, 21],
  [19],
  [19, 21],
  [22, 24],
  [22, 25],
  [22],
  [22, 26],
  [23],
  [23, 26],
  [28, 29],
  [29],
  [29, 33],
  [30, 33],
  [34, 37],
  [34],
  [38, 41],
  [38, 42],
  [43, 46],
  [45],
  [47, 51],
  [48, 51],
  [52, 56],
  [53, 56],
  [56, 63],
  [56, 60],
  [56, 58],
  [57, 60],
  [57, 59],
  [61, 63],
  [61, 64],
  [65, 70],
  [65, 67],
  [65, 68],
  [65],
  [66, 69],
  [66, 70],
  [71],
  [71, 73],
  [72],
  [74, 71],
  [76],
  [78, 76],
  [81]
];


function isAppliableToRange(range, distance) {
  if (range === undefined) {
    return false;
  }

  const first = range[0];
  const last = range[1];


  if (first < distance && distance < last) {
    return true;
  } else if (distance === first) {
    return true;
  } else if (distance === last) {
    return true;
  }

  return false;
}

function applyToRange(range, distance) {
  let first = range[0];
  let last = range[1];


  if (first < distance && distance < last) {
    return range;
  } else if (distance === first) {
    first = distance;
  } else if (distance === last) {
    last = distance;
  }

  return [first, last];
}

function isMergable(range1, range2) {
  if (range1 === undefined || range2 === undefined) {
    return false;
  }

  var ranges1 = {
    first: range1[0],
    last: range1[1]
  }

  var ranges2 = {
    first: range2[0],
    last: range2[1]
  }

  if (ranges2.first <= ranges1.last && ranges1.first < ranges2.last) {
    return true;
  }

  return false;
}

function processData(d) {
  const sorted = d.map(z => z.sort());

  const withTuples = [];
  let ignoreIndex = -1;

  const withTuplesF = x.forEach((range, index) => {
    const previousRange = x[index - 1];
    const nextRange = x[index + 1];
    if (range.length === 1) {
      if (isAppliableToRange(previousRange, range[0])) {
        withTuples.push(applyToRange(previousRange, range[0]));
        ignoreIndex = index - 1;
      } else if (isAppliableToRange(nextRange, range[0])) {
        withTuples.push(applyToRange(nextRange, range[0]));
        ignoreIndex = index + 1;
      } else {
        withTuples.push(range[0]);
      }
    } else {
      if (ignoreIndex !== index) {
        withTuples.push(range);
      }
    }
  });

  withTuples.forEach((range, index) => {
    const rangePrevious = withTuples[index - 1];

    if (isMergable(rangePrevious, range)) {

    };
  });
}

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

const getRangeForItems = range => {
  const first = _.min(range);
  const last = _.max(range);

  if (first !== last) {
    return [first, last];
  }

  return [first];
}

const getRanges = mobs => {
  const sorted = mobs.map(data => {
    // return data.distanceRange.sort((a, b) => {
    return data.sort((a, b) => {
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
    const first = _.max(range);
    const last = _.min(range);

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
  }).map(getRangeForItems);

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


  filtered = dupeless.map(z => z.sort()).map(getRangeForItems);

  const withTuples = [];
  let ignoreIndex = -1;

  const withTuplesF = filtered.forEach((range, index) => {
    const previousRange = dupeless[index - 1];
    const nextRange = dupeless[index + 1];
    if (range.length === 1) {
      if (isAppliableToRange(previousRange, range[0])) {
        withTuples.push(applyToRange(previousRange, range[0]));
        ignoreIndex = index - 1;
      } else if (isAppliableToRange(nextRange, range[0])) {
        withTuples.push(applyToRange(nextRange, range[0]));
        ignoreIndex = index + 1;
      } else {
        withTuples.push(range[0]);
      }
    } else {
      if (ignoreIndex !== index) {
        withTuples.push(range);
      }
    }
  });

  ignoreIndex = -1;
  let merged = [];
  withTuples.forEach((range, index) => {
    if(index !== ignoreIndex) {

    const nextRange = withTuples[index + 1];

    if (isMergable(range, nextRange)) {
      ignoreIndex = index - 1;
      merged.push(getRangeForItems(_.union(range, nextRange).sort()))
    } else {
      merged.push(range);
    };
  }

  });

  return withTuples;
}

// module.exports = getRanges;

// console.log(JSON.stringify(getRanges(input)));


const ranges = [
  [1, 4],
  [5, 8],
  [9, 13],
  [14, 17],
  [18, 21],
  [22, 27],
  [28, 29],
  [30, 33],
  [34, 37],
  [38, 42],
  [43, 46],
  [47, 51],
  [52, 56],
  [57, 60],
  [61, 64],
  [65, 70],
  [71,74],
  [75,78],
  [79,84],
  [85,90],
  [91,95],
  [96,104]
]

const dzRanges = [
  [23, 27],
  [28, 29],
  [30, 33],
  [34, 39],
  [53, 56],
  [57, 60],
  [61, 64],
  [75,78],
  [79,84],
  [85,89]
]

const dungeonRanges = [
  11,
  19,
  23,
  29,
  34,
  39,
  45,
  50,
  56,
  69,
  74,
  80,
]

module.exports = {
  ranges,
  dzRanges,
  dungeonRanges,
};
