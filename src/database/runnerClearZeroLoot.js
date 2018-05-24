// mongoexport -h ds119490.mlab.com:19490 -d heroku_1q54zt8s -c beasts -u heroku_1q54zt8s -p 8kbg65u9g98hol9dgithpujahv -o test.json

const mongoose = require('mongoose');
var async = require('async');
const _ = require('underscore');

const beastSchema = require('../schemes/beast');

const Beast = mongoose.model('Beast', beastSchema);

const filteredData = {};

mongoose.connect('mongodb://heroku_1q54zt8s:8kbg65u9g98hol9dgithpujahv@ds119490.mlab.com:19490/heroku_1q54zt8s');

Beast.find().or([{ capsReceived: 0 }, { materialsReceived: 0 }]).then(beasts => {
  async.forEach(beasts, function (beast, next) {
    beast.capsReceived = _.without(beast.capsReceived, 0);
    beast.materialsReceived = _.without(beast.materialsReceived, 0);

    beast.save().then(() => next());
  }, function (err) {
    console.log('iterating done');
  });
});