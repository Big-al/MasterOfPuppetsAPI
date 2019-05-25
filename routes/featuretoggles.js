const Guid = require("../Helpers/Guid");
const express = require('express');
const UserModel = require('../models/user');
const router = express.Router();

// get all feature toggles from user
router.post('/getStatusAll', (req, res) => {
    if (!req.body.hasOwnProperty('email')) return res.status(400).json({success: false, msg: 'email missing from request'});
    if (!req.body.hasOwnProperty('password')) return res.status(400).json({success: false, msg: 'password missing from request'});

    const email = req.body.email;
    const password = req.body.password;

    UserModel.getUserByEmail(email, (err, user) => {
        if (err) throw err;
        if (!user) {
            return res.status(404).json({success: false, msg: 'User ' + email + ' not found'});
        }

        UserModel.comparePassword(password, user.pwHash, (err, isMatch) => {
            if (err) throw err;
            // Success case
            if (isMatch) {
                return res.status(200).json({
                    success: true,
                    msg: 'User successfully authenticated.',
                    featureToggle: user.featureToggles
                });
            } else {
                return res.status(401).json({success: false, msg: 'Password didnt match user data.'});
            }
        })
    })
});

// get one feature toggle from user, by secretKey
router.post('/getStatusOne', (req, res) => {
    // Simple proper format checking
    if (!req.body.hasOwnProperty('email')) return res.status(400).json({success: false, msg: 'email missing from request'});
    if (!req.body.hasOwnProperty('password')) return res.status(400).json({success: false, msg: 'password missing from request'});
    if (!req.body.hasOwnProperty('secretKey')) return res.status(400).json({success: false, msg: 'secretKey missing from request'});

    // Variable declaration
    const email = req.body.email;
    const password = req.body.password;
    const secretKey = req.body.secretKey;

    // Login -> Get User document -> Filter or Do stuff
    UserModel.getUserByEmail(email, (err, user) => {
        if (err) throw err;
        if (!user) {
            return res.status(404).json({success: false, msg: 'User ' + email + ' not found'});
        }

        UserModel.comparePassword(password, user.pwHash, (err, isMatch) => {
            if (err) throw err;
            // Success case
            if (isMatch) {
                let featureToggle = user.featureToggles.find((fT) => fT.secretKey === secretKey);
                if (featureToggle !== undefined) { // null check for wrong secretKey
                    featureToggle.lastUpdated = Date.now(); // Update timestamp so it wont get flushed after a month
                } else return res.status(404).json({success: false, msg: 'secretKey did not match any featureToggles.'});

                user.save(function (err) {
                    if (err) return res.status(500).json({success: false, msg: err});
                    // stuff worked
                    return res.status(200).json({
                        success: true,
                        msg: 'A feature toggle on the user: ' + email + ' was found with a matching secretKey of: ' + secretKey + '.',
                        featureToggle: featureToggle
                    });
                });
            } else {
                return res.status(401).json({success: false, msg: 'Password didnt match user data.'});
            }
        })
    });
});

// create new feature toggle on user
router.post('/createNew', (req, res) => {
    // Simple proper format checking
    if (!req.body.hasOwnProperty('email')) return res.status(400).json({success: false, msg: 'email missing from request'});
    if (!req.body.hasOwnProperty('password')) return res.status(400).json({success: false, msg: 'password missing from request'});

    // Variable declaration
    const email = req.body.email;
    const password = req.body.password;

    // Login -> Get User document -> Filter or Do stuff
    UserModel.getUserByEmail(email, (err, user) => {
        if (err) throw err;
        if (!user) {
            return res.status(404).json({success: false, msg: 'User ' + email + ' not found'});
        }

        UserModel.comparePassword(password, user.pwHash, (err, isMatch) => {
            if (err) throw err;
            // Successful login case
            if (isMatch) {
                const secretKey = Guid.newGuid();
                user.featureToggles.addToSet({ // AddToSet only inserts if no other element exists that matches the record.
                    secretKey: secretKey,
                    toggles: []
                });
                user.save(function (err) {
                    if (err) return res.status(500).json({success: false, msg: err});
                    // stuff worked
                    return res.status(200).json({
                        success: true,
                        msg: 'A feature toggle on the user: ' + email + ' was created with secretKey: ' + secretKey + '.',
                        secretKey: secretKey
                    });
                });
            } else {
                return res.status(401).json({success: false, msg: 'Password didnt match user data.'});
            }
        })
    });
});

// update a feature toggle on user by secretKey (Also used for single toggle deletion. Separate endpoint for that could be added later..)
router.post('/updateOne', (req, res) => {
    // Simple proper format checking
    if (!req.body.hasOwnProperty('email')) return res.status(400).json({success: false, msg: 'email missing from request'});
    if (!req.body.hasOwnProperty('password')) return res.status(400).json({success: false, msg: 'password missing from request'});
    if (!req.body.hasOwnProperty('secretKey')) return res.status(400).json({success: false, msg: 'secretKey missing from request'});
    if (!req.body.hasOwnProperty('toggles')) return res.status(400).json({success: false, msg: 'new toggles missing from request'});

    // Variable declaration
    const email = req.body.email;
    const password = req.body.password;
    const secretKey = req.body.secretKey;
    const toggles = req.body.toggles;

    // Login -> Get User document -> Filter or Do stuff
    UserModel.getUserByEmail(email, (err, user) => {
        if (err) throw err;
        if (!user) {
            return res.status(404).json({success: false, msg: 'User ' + email + ' not found'});
        }

        UserModel.comparePassword(password, user.pwHash, (err, isMatch) => {
            if (err) throw err;
            // Successful login case
            if (isMatch) {
                let featureToggle = user.featureToggles.find((fT) => fT.secretKey === secretKey);
                if (featureToggle !== undefined) { // null check for wrong secretKey
                    featureToggle.lastUpdated = Date.now();
                    featureToggle.toggles = toggles;
                } else return res.status(404).json({success: false, msg: 'secretKey did not match any featureToggles.'});

                user.save(function (err) {
                    if (err) return res.status(500).json({success: false, msg: err});
                    // stuff worked
                    return res.status(200).json({
                        success: true,
                        msg: 'Toggles on the user: ' + email + ' with the secretKey: ' + secretKey + ' were updated correctly.',
                        featureToggle: featureToggle
                    });
                });
            } else {
                return res.status(401).json({success: false, msg: 'Password didnt match user data.'});
            }
        })
    });
});

// remove a feature toggle on user by secretKey
router.post('/deleteOne', (req, res) => {
    // Simple proper format checking
    if (!req.body.hasOwnProperty('email')) return res.status(400).json({success: false, msg: 'email missing from request'});
    if (!req.body.hasOwnProperty('password')) return res.status(400).json({success: false, msg: 'password missing from request'});
    if (!req.body.hasOwnProperty('secretKey')) return res.status(400).json({success: false, msg: 'secretKey missing from request'});

    // Variable declaration
    const email = req.body.email;
    const password = req.body.password;
    const secretKey = req.body.secretKey;

    // Login -> Get User document -> Filter or Do stuff
    UserModel.getUserByEmail(email, (err, user) => {
        if (err) throw err;
        if (!user) {
            return res.status(404).json({success: false, msg: 'User ' + email + ' not found'});
        }

        UserModel.comparePassword(password, user.pwHash, (err, isMatch) => {
            if (err) throw err;
            // Successful login case
            if (isMatch) {
                // let featureToggle = user.featureToggles.find((fT) => fT.secretKey === secretKey);
                if (user.featureToggles.find((fT) => fT.secretKey === secretKey) !== undefined) { // null check for wrong secretKey
                    user.featureToggles = user.featureToggles.filter((fT) => fT.secretKey !== secretKey)
                } else return res.status(404).json({success: false, msg: 'secretKey did not match any featureToggles.'});

                user.save(function (err) {
                    if (err) return res.status(500).json({success: false, msg: err});
                    // stuff worked
                    return res.status(200).json({
                        success: true,
                        msg: 'FeatureToggle on the user: ' + email + ' with the secretKey: ' + secretKey + ' was removed.',
                    });
                });
            } else {
                return res.status(401).json({success: false, msg: 'Password didnt match user data.'});
            }
        })
    });
});

module.exports = router;
