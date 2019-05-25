// ----------------- Imports -----------------
import express = require('express');
import path = require('path');
import bodyParser = require('body-parser');
import * as passport from 'passport';
import mongoose = require('mongoose');
import env = require('./config/ENV');
import users = require('./routes/users');

// ----------------- Globals -----------------
import helmet = require('helmet'); // Helmet helps secure the api by setting various security HTTP headers by default.
import cors = require('cors'); // Cors allows cross platform scripting
// @ts-ignore
import config from "./config/passport";

const PuppetMaster = express(); // Express simply allows us to create port listeners
const port: number = 3000; // Access at http://localhost:3000
const ApiKey: string = 'e7ed118c-36bc-431a-a3b4-000b79655720'; // Not pretty but good enough for demo purposes

// ----------------- Init -----------------
// Connect to DB
mongoose.connect(env.connectionString, {
    useCreateIndex: true,
    useNewUrlParser: true
});
mongoose.connection.on('connected', () => console.log('Mongoose Connected successfully')); // Access test

//Checking errors in the mongodb
mongoose.connection.on('error', (someErr) => {
    console.log('A DB error occured ' + someErr);
});

// Body Parser middleware
PuppetMaster.use(bodyParser.json(), cors(), express.static(path.join(__dirname, 'public')), passport.initialize(), passport.session());

// (allow) CORS Middleware
// PuppetMaster.use(cors());

// Set static folder
// PuppetMaster.use(express.static(path.join(__dirname, 'public')));

// Passport middleware
// PuppetMaster.use(passport.initialize());
// PuppetMaster.use(passport.session());

config(passport);

PuppetMaster.use('/users', users);

// Index Router
PuppetMaster.get('/', (req, res) => {
    res.send('Invalid endpoint');
});

PuppetMaster.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/index.html'));
});

// Bootup
PuppetMaster.listen(port, ()=> {
    console.log('Server started on port number:' + port)
});



//---------------------------------------------------------------- End of original app api.js



// PuppetMaster.use(helmet(), cors(), bodyParser.json(), passport.initialize());
// PuppetMaster.listen(port, () => console.log(`PuppetMaster listening on port ${port}! Muhaha`));
//
// // ----------------- Schemas -----------------
// const FeatureToggleSchema: mongoose.Schema = new mongoose.Schema({
//     secretKey: {type: String, required: true, unique: true},
//     toggles: {
//         type: [
//             {ID: {type: String, unique: true}, state: Boolean}
//         ], required: true
//     }
// });
// const FeatureToggle = mongoose.model("FeatureToggle", FeatureToggleSchema);
//
// const UserSchema: mongoose.Schema = new mongoose.Schema({
//     userName: {type: String, required: true, unique: true},
//     pwHash: {type: String, required: true},
//     featureToggles: FeatureToggleSchema,
//     lastUpdated: {type: Date, required: true}
// });
//
// UserSchema.methods.createPasswordHash = function (password: string) {
//     return this.pwHash = crypto.pbkdf2Sync(password, Globals.salt, 10000, 256, 'sha512').toString('hex');
// };
//
// UserSchema.methods.checkPasswordHash = function (pwHash: string) {
//     return this.pwHash === crypto.pbkdf2Sync(pwHash, Globals.salt, 10000, 256, 'sha512').toString('hex');
// };
//
// UserSchema.methods.tokenize = function () {
//     const today = new Date();
//     today.setDate(today.getDate() + 14);
//
//     return jwt.sign({
//         _id: this._id,
//         userName: "",
//         exp: today.getTime() / 1000
//     }, Globals.jwtSecret);
// };
//
// export interface IUser extends mongoose.Document {
//     userName: string;
//     pwHash: string;
//     featureToggles: any[];
//     lastUpdate: Date;
//     createPasswordHash: (password: string) => string;
//     checkPasswordHash: (pwHash: string) => boolean;
//     tokenize: () => string;
// }
//
// const User: mongoose.Model<IUser> = mongoose.model<IUser>('User', UserSchema);
// const user = new User(); // TODO: fix schema reference
//
// passport.use(new LocalStrategy.Strategy(
//     function (username, password, res) {
//         User.findOne({userName: username}, function (err, user) {
//             if (err) return res(err);
//             if (!user) return res(undefined, false, {message: 'User not found'});
//             if (!user.checkPasswordHash(password)) return res(undefined, false, {message: 'Incorrect password'});
//             return res(undefined, user);
//         });
//     }
// ));
//
// // ----------------- Endpoints -----------------
//
// // getStatus will return the project with all settings.
// // Working request:
// // {
// //     "ApiKey" : "e7ed118c-36bc-431a-a3b4-000b79655720",
// //     "secretKey": "08d9573d-384b-4479-99a9-efc1c089da92"
// // }
// PuppetMaster.post('/api/v1/getStatus', (req, res) => {
//     if (req.body.ApiKey !== ApiKey) { // secretKey
//         console.log("PublicAPI Error: Temp Apikey system error");
//         return res.status(401).json({response: 'ApiKey not accepted.'});
//     }
//
//     FeatureToggle.findOne({secretKey: req.body.secretKey})
//         .then((mongoRes: any) => res.status(201).json(mongoRes))
//         .catch((err: any) => res.status(404).json(err));
// });
//
// PuppetMaster.post('/api/v1/register', (req, res) => {
//     {
//         res.json({
//             "response": "User registered: " + req.body.email
//         });
//         return res.status(200);
//     }
// });
//
// PuppetMaster.post('/api/v1/login', (req, res) => {
//     {
//         res.json({
//             "response": "User logged in: " + req.body.email
//         });
//         return res.status(200);
//     }
// });
//
// // Creates a new secretKey and adds it to the database along with whatever toggles are passed with it.
// // {
// //    "ApiKey" : "e7ed118c-36bc-431a-a3b4-000b79655720",
// //    "toggles": [{"ID": "test1", "state": true}, {"ID": "test2", "state": false}]
// // }
// PuppetMaster.post('/api/v1/createProject', (req, res) => {
//     if (req.body.ApiKey !== ApiKey) {
//         console.log("PublicAPI Error: Temp Apikey system error");
//         return res.status(401).json({response: 'ApiKey not accepted.'});
//     }
//
//     const ftData = new FeatureToggle({
//         secretKey: help.Guid.newGuid(),
//         toggles: req.body.toggles
//     });
//
//     ftData.save()
//         .then((mongoRes: any) => res.status(201).json(mongoRes))
//         .catch((err: any) => res.status(418).json(err));
// });
//
// // Should return a httpstatuscode according to result
// PuppetMaster.post('/api/v1/deleteProject', (req, res) => {
//     if (req.body.ApiKey !== ApiKey) {
//         console.log("PublicAPI Error: Temp Apikey system error");
//         return res.status(401).json({response: 'ApiKey not accepted.'});
//     }
//
//     FeatureToggle.findOneAndDelete({secretKey: req.body.secretKey}).exec()
//         .then((mongoRes: any) => res.status(200).json(mongoRes))
//         .catch((err: any) => res.status(404).json(err));
// });
//
// // Should return a httpstatuscode according to result
// PuppetMaster.post('/api/v1/updateProject', (req, res) => {
//     if (req.body.ApiKey !== ApiKey) {
//         console.log("PublicAPI Error: Temp Apikey system error");
//         return res.status(401).json({response: 'ApiKey not accepted.'});
//     }
//
//     FeatureToggle.findOne({secretKey: req.body.secretKey}, (ft: any) => {
//         ft.toggles = req.body.toggles;
//         ft.save().then((mongoRes: any) => res.status(200).json(mongoRes));
//     }).catch((err: any) => res.status(404).json(err));
// });
