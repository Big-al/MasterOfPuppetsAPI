const mongoose = require('mongoose');
const crypto = require('crypto');
const env = require('../config/ENV');

// FeatureToggle Schema
const FeatureToggleSchema = new mongoose.Schema({
    secretKey: {type: String, required: true, unique: true},
    toggles: {
        type: [
            {id: String, state: Boolean}
        ], required: true
    },
    lastUpdated: {
        type: Date,
        default: Date.now
    },
});

// User Schema
const UserSchema = mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        unique: true,
        required: true
    },
    pwHash: {
        type: String,
        required: true
    },
    featureToggles: [{type: FeatureToggleSchema}]
}, {collection: "Users"});

const User = module.exports = mongoose.model('User', UserSchema);

module.exports.getUserById = function (id, callback) {
    User.findById(id, callback);
};

module.exports.getUserByEmail = function (email, callback) {
    const query = {email: email};
    User.findOne(query, callback);
};

module.exports.addUser = function (newUser, callback) {
    newUser.pwHash = crypto.pbkdf2Sync(newUser.pwHash, env.salt, 1000, 64, 'sha512').toString('hex');
    newUser.save(callback);
};

module.exports.comparePassword = function (Password, hash, callback) {
    const hash2 = crypto.pbkdf2Sync(Password, env.salt, 1000, 64, 'sha512').toString('hex');
    let isMatch = hash2 === hash;
    callback(null, isMatch);
};

module.exports.cleanByLastUpdated = function (callback) {
    let dateLimit = new Date();
    dateLimit.setMonth(dateLimit.getMonth() - 1);

    User.updateMany(
        {lastUpdated: {$lte: Date.now()}},
        {$set: {"featureToggles.$[element]": {}}},
        {arrayFilters: [{"element.lastUpdated": {$lte: dateLimit}}]}
    )
};
