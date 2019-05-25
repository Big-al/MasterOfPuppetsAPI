const cron = require("node-cron");
const UserModel = require('../models/user');

// Run the clean job every 30 mins -> Find all featuretoggles with LastUpdated time > 1 month -> Delete the featuretoggle
module.exports.CronJob = function (id, callback) {
    cron.schedule("30 * * * *", function () {
        console.log(' --------> Starting clean job <-------- ');
        UserModel.cleanByLastUpdated()
    });
}

