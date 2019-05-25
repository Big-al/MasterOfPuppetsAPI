const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const cors = require('cors');
const passport = require('passport');
const mongoose = require('mongoose');
const env = require('./config/ENV');
const helmet = require('helmet');

const app = express();
const users = require('./routes/users');
const featuretoggles = require('./routes/featuretoggles');
const cleanJobs = require('./cron-jobs/Clean-Job');
const port = 3000;

// ====================== Connect to DB ======================
mongoose.connect(env.connectionString, {
    useCreateIndex: true,
    useNewUrlParser: true
});

// Debugging w/ mongoose
mongoose.connection.on('error', (someErr) => {
    console.log('A DB error occured ' + someErr);
});
mongoose.connection.on('connected', () => console.log('Connected')); // Access test
// ====================== Connect to DB END ======================

// ====================== Middleware ======================
// Helmet helps secure the api by setting various security HTTP headers by default.
app.use(helmet());

// Body Parser middleware for parsing post request bodies
app.use(bodyParser.json());

// (allow) CORS Middleware for allowing cross origin requests
app.use(cors());

// Set static folder for serving static files via the api (only used for serving index.html currently)
app.use(express.static(path.join(__dirname, 'public')));

// Passport middleware for simple authentication, and possible future OAuth integrations?
app.use(passport.initialize());
app.use(passport.session());
require('./config/passport')(passport);
// ====================== Middleware END ======================

// ====================== Import API routes ======================
app.use('/users', users);
app.use('/featuretoggles', featuretoggles);
// ====================== Import API routes END ======================

// ====================== Initialize ======================
// Wildcard endpoint for accidental browsers.
app.get('*', (req, res) => res.sendFile(path.join(__dirname, 'public/index.html')));

 // Initialize express
app.listen(port, ()=> console.log('Server started on port number:' + port));

// Initialize cron jobs
cleanJobs.CronJob();
// ====================== Initialize END ======================
