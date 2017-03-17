const passport = require('passport');
const User = require('../models/user');
const config = require('../config');
const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;
const LocalStrategy = require('passport-local');


// Create local strategy
const localOptions = {
    usernameField: 'email'
};
const localLogin = new LocalStrategy(localOptions, function(email, password, done) {
    // Verify email and password, call done with user
    // if correct, else call done with false
    User.findOne({ email: email }, function(err, user) {
        if(err) {
            return done(err);
        }
        // email not found
        if(!user) {
            return done(null, false);
        }
        // email found
        // Compare passwords - is 'password' == user.password
        user.comparePassword(password, function(err, isMatch) {
            if(err) {
                return done(err);
            }
            // if passwords don't match
            if(!isMatch) {
                return done(null, false);
            }
            // passwords match, return user
            return done(null, user);
        })
    });
});

// Setup options for JWT Strategy
const jwtOptions = {
    jwtFromRequest: ExtractJwt.fromHeader('authorization'),
    secretOrKey: config.secret
};

// Create JWT Strategy
const jwtLogin = new JwtStrategy(jwtOptions, function(payload, done) {
    // See if user id in payload exists in database
    // If yes, call 'done' with user, else call 'done' without user.
    User.findById(payload.sub, function(err, user) {
        if(err) {
            return done(err, false);
        }
        if(user) {
            // user found
            done(null, user);
        } else {
            // user not found
            done(null, false);
        }
    });
});

// Tell passport to use this strategy
passport.use(jwtLogin);
passport.use(localLogin);