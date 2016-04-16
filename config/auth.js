var passport = require('passport');
var validator = require('validator');
var Strategy = require('passport-local').Strategy;
var utils = require('../utils');
var User = require('../models/user');

passport.use(new Strategy({
        usernameField: 'email',
        passwordField: 'password'
    },
    function(username, password, cb) {
        User.forge({email:validator.normalizeEmail(username)}).fetch().then(function(user) {
            if (!user) {
                return cb(null, false);
            }
            if (user.attributes.password != utils.hashPassword(password, user.attributes.salt)) {
                return cb(null, false);
            }
            return cb(null, user);
        });
    })
);

passport.serializeUser(function(user, cb) {
    cb(null, user.id);
});

passport.deserializeUser(function(id, cb) {
    User.forge({id:id}).fetch().then(function(user) {
        cb(null, user);
    });
});

module.exports = passport;