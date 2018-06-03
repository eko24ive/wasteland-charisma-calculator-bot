const mongoose = require('mongoose');
var async = require('async');
const _ = require('underscore');

const beastSchema = require('../schemes/beast');

const Beast = mongoose.model('Beast', beastSchema);

const filteredData = {};

mongoose.connect('mongodb://heroku_1q54zt8s:8kbg65u9g98hol9dgithpujahv@ds119490.mlab.com:19490/heroku_1q54zt8s');

let purgeAmount = 0;
let issuesFound = 0;

Beast.find({
    'concussions.stats': null
}).then(beasts => {
    async.forEach(beasts, function (databaseBeast, next) {
        const beast = databaseBeast.toJSON();
        const concussionsBefore = beast.concussions.length;

        if(_.isEmpty(beast.concussions)) {
            return next();
        }

        databaseBeast.concussions.filter(battle => {
            return _.isEmpty(battle.toJSON().stats);
        }).forEach(battle => databaseBeast.concussions.remove(battle.id));

        purgeAmount += concussionsBefore - databaseBeast.toJSON().concussions.length;
        issuesFound++;

        databaseBeast.save().then(() => next());
    }, function (err) {
        console.log('============================');

        if(issuesFound !== 0 || purgeAmount !== 0) {
            console.log(`Issues found: ${issuesFound}`);
            console.log(`Data nodes purged: ${purgeAmount}`);
        } else {
            console.log(`✓ All concussion data is intact`)
        }

        mongoose.disconnect();
    });
});