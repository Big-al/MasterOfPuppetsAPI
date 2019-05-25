const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;
const User = require('../models/user');
const env = require('./ENV');

module.exports = function(passport){
    let opts = {};
    opts.jwtFromRequest = ExtractJwt.fromAuthHeaderWithScheme("jwt");
    opts.secretOrKey = env.JWTsecret;
    passport.use(new JwtStrategy(opts, (jwt_payload, res) => {
        // console.log(jwt_payload); MOVING WITH THE PAYLOAD
        User.getUserById(jwt_payload.data._id, (err, user) => {
            if(err){
                return res(err, false);
            }

            if(user){
                return res(null, user);
            } else {
                return res(null, false)
            }
        });
    }));
};
