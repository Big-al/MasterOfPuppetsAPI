const express = require('express');
const passport = require('passport');
const jwt = require('jsonwebtoken');
const env = require('../config/ENV');
const UserModel = require('../models/user');
const router = express.Router();

// Register
router.post('/register', (req, res) => {
    console.log("Call to users/register");
    let newUser = new UserModel({
        name: req.body.name,
        email: req.body.email,
        pwHash: req.body.pwHash,
        featureToggles: req.body.featureToggles
        // The featureToggles value could be defaulted to [{}], however it is nice to be able to create a user and
        // its toggles in one go, via a single endpoint, if needed.
    });

    UserModel.addUser(newUser, (err, user) => {
        if (err) {
            res.json({success: false, msg: 'Failed to register. Server responded with: ' + err})
        } else {
            res.json({success: true, msg: 'Welcome ' + user.name + '. You are now registered, and can log in with: ' + user.email})
        }
    })
});

// Authenticate based on password and email
router.post('/authenticate', (req, res) => {
    console.log("Call to users/authenticate");
    const email = req.body.email;
    const password = req.body.password;

    UserModel.getUserByEmail(email, (err, user) => {
        if (err) throw err;
        if (!user) {
            return res.json({success: false, msg: 'User ' + email + ' not found'});
        }

        UserModel.comparePassword(password, user.pwHash, (err, isMatch) => {
            if (err) throw err;
            if (isMatch) {
                const token = jwt.sign({data: user}, env.JWTsecret, {
                    expiresIn: 604800 // 1 week
                });
                res.json({
                    success: true,
                    msg: 'User ' + user.email + ' authenticated correctly.',
                    token: 'JWT ' + token,
                    user: {
                        id: user._id,
                        name: user.name,
                        email: user.email
                    }
                });
            } else {
                return res.json({success: false, msg: 'Password didnt match user data.'});
            }
        })
    })
});

// gets the entire user profile (User object)
router.get('/profile', passport.authenticate('jwt', {session: false}), (req, res) => {
    console.log("Call to users/profile");
    res.json(req.user)
});

module.exports = router;
