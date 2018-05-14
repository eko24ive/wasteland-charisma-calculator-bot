const _ = require('underscore');
var async = require('async');

var x = [{
    "distanceRange": [
      13,
      12,
      11
    ]
  },
  {
    "distanceRange": [
      30,
      33,
      32,
      31
    ]
  },
  {
    "distanceRange": [
      48,
      49,
      50,
      51
    ]
  },
  {
    "distanceRange": [
      56,
      59,
      60,
      58
    ]
  },
  {
    "distanceRange": [
      56,
      60,
      59,
      58
    ]
  },
  {
    "distanceRange": [
      56,
      62,
      63,
      61
    ]
  },
  {
    "distanceRange": [
      23
    ]
  },
  {
    "distanceRange": [
      26,
      22,
      25,
      24
    ]
  },
  {
    "distanceRange": [
      7,
      5,
      6
    ]
  },
  {
    "distanceRange": [
      43
    ]
  },
  {
    "distanceRange": [
      11,
      10,
      9,
      12
    ]
  },
  {
    "distanceRange": [
      29
    ]
  },
  {
    "distanceRange": [
      48,
      51,
      50
    ]
  },
  {
    "distanceRange": [
      54,
      56,
      53,
      52
    ]
  },
  {
    "distanceRange": [
      4,
      3,
      1
    ]
  },
  {
    "distanceRange": [
      21,
      20
    ]
  },
  {
    "distanceRange": [
      35,
      34,
      37
    ]
  },
  {
    "distanceRange": [
      12,
      9,
      13
    ]
  },
  {
    "distanceRange": [
      14,
      17,
      16
    ]
  },
  {
    "distanceRange": [
      20,
      21,
      19
    ]
  },
  {
    "distanceRange": [
      67,
      65
    ]
  },
  {
    "distanceRange": [
      3,
      1,
      4
    ]
  },
  {
    "distanceRange": [
      11,
      9,
      13,
      10
    ]
  },
  {
    "distanceRange": [
      68,
      70,
      67,
      65
    ]
  },
  {
    "distanceRange": [
      57,
      59
    ]
  },
  {
    "distanceRange": [
      37,
      34
    ]
  },
  {
    "distanceRange": [
      19,
      20,
      18
    ]
  },
  {
    "distanceRange": [
      38,
      39,
      41,
      42,
      40
    ]
  },
  {
    "distanceRange": [
      43,
      46,
      45
    ]
  },
  {
    "distanceRange": [
      60,
      58
    ]
  },
  {
    "distanceRange": [
      63,
      61,
      62
    ]
  },
  {
    "distanceRange": [
      22
    ]
  },
  {
    "distanceRange": [
      17
    ]
  },
  {
    "distanceRange": [
      16
    ]
  },
  {
    "distanceRange": [
      54,
      52,
      53,
      56,
      55
    ]
  },
  {
    "distanceRange": [
      6,
      7
    ]
  },
  {
    "distanceRange": [
      31,
      32,
      33
    ]
  },
  {
    "distanceRange": [
      68,
      66,
      70
    ]
  },
  {
    "distanceRange": [
      14,
      15,
      16,
      17
    ]
  },
  {
    "distanceRange": [
      22,
      23,
      26
    ]
  },
  {
    "distanceRange": [
      19,
      21,
      20
    ]
  },
  {
    "distanceRange": [
      76
    ]
  },
  {
    "distanceRange": [
      69,
      68,
      65,
      66
    ]
  },
  {
    "distanceRange": [
      65
    ]
  },
  {
    "distanceRange": [
      16
    ]
  },
  {
    "distanceRange": [
      28,
      29,
      29
    ]
  },
  {
    "distanceRange": [
      76
    ]
  },
  {
    "distanceRange": [
      72
    ]
  },
  {
    "distanceRange": [
      76
    ]
  },
  {
    "distanceRange": [
      18,
      19,
      20
    ]
  }
];



function d(a) {
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


  function multiDimensionalUnique(arr) {
    var uniques = [];
    var itemsFound = {};
    for (var i = 0, l = arr.length; i < l; i++) {
      var stringified = JSON.stringify(arr[i]);
      if (itemsFound[stringified]) {
        continue;
      }
      uniques.push(arr[i]);
      itemsFound[stringified] = true;
    }
    return uniques;
  }


  const dupeless = multiDimensionalUnique(ranged);

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

console.log(d(x));