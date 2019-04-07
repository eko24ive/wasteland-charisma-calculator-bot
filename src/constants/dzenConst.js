/*
var a = Array.apply(null, Array(10)).map(function (x, i) { return i+1; });

x = [];

a.map((v,i) => {
   x.push({
        caps: (v * 500000),
        level: v
   })
});

JSON.stringify(x)
 */

module.exports = [{
  caps: 500000,
  level: 1,
}, {
  caps: 1000000,
  level: 2,
}, {
  caps: 1500000,
  level: 3,
}, {
  caps: 2000000,
  level: 4,
}, {
  caps: 2500000,
  level: 5,
}, {
  caps: 3000000,
  level: 6,
}, {
  caps: 3500000,
  level: 7,
}, {
  caps: 4000000,
  level: 8,
}, {
  caps: 4500000,
  level: 9,
}, {
  caps: 5000000,
  level: 10,
}];
