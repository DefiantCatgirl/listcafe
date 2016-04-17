var express = require('express');
var validator = require('validator');
var passport = require('../config/auth');
var User = require('../models/user');
var utils = require('../utils/crypto-utils');
var router = express.Router();

router.get('/login', function (req, res) {
    res.render('login');
});

router.post('/login', function(req, res, next) {
    res.locals = req.body;
    passport.authenticate('local', function(err, user, info) {
        if (err) {
            return next(err);
        }
        if (!user) {
            return res.render('login', {error: true});
        }
        req.logIn(user, function(err) {
            if (err) {
                return next(err);
            }
            return res.redirect('/profile/' + user.attributes.name);
        });
    })(req, res, next);
});

router.get('/signup', function (req, res) {
    res.render('signup');
});

router.get('/logout', function(req, res) {
    req.logout();
    res.redirect('/');
});

function checkName(res, name, next) {
    User.forge()
        .query("whereRaw", "LOWER(name) LIKE ?", name.toLowerCase())
        .fetch()
        .then(function (user) {
            if (user) {
                res.locals.error = true;
                res.locals.errorExistingName = true;
            }
            next();
        });
}

function checkEmail(res, email, next) {
    User.forge({
            email: email
        })
        .fetch()
        .then(function(user) {
            if (user) {
                res.locals.error = true;
                res.locals.errorExistingEmail = true;
            }
            next();
        });
}

function saveUser(res, name, password, email, next) {
    var salt = utils.generateSalt();

    User.forge({
            name: name,
            password: utils.hashPassword(password, salt),
            email: email,
            salt: salt,
            role_id: 0
        })
        .save()
        .then(function (user) {
            next(user);
        })
        .catch(function (error) {
            res.render('500');
        });
}

function authenticate(req, res, user) {
    req.login(user, function (err) {
        if (!err) {
            res.redirect('/profile/' + user.attributes.name);
        } else {
            res.redirect('/login')
        }
    })
}

router.post('/signup', function (req, res) {
    res.locals = req.body;

    var name = validator.trim(req.body.name);
    var email = validator.trim(req.body.email);
    var password = req.body.password;
    var passwordRepeat = req.body.passwordrepeat;

    if (!validator.isEmail(req.body.email) || req.body.email.length > 254) {
        res.locals.error = true;
        res.locals.errorEmail = true;
    } else {
        email = validator.normalizeEmail(email);
    }

    if (!validator.isAlphanumeric(name.replace('.', '').replace('_', '').replace('-', ''))) {
        res.locals.error = true;
        res.locals.errorInvalidName = true;
    }

    if (name.length > 50) {
        res.locals.error = true;
        res.locals.errorLongName = true;
    }

    if (name.replace('.', '').replace('_', '').replace('-', '').length < 3) {
        res.locals.error = true;
        res.locals.errorShortName = true;
    }

    if (password.length < 6) {
        res.locals.error = true;
        res.locals.errorShortPassword = true;
    } else if (password !== passwordRepeat) {
        res.locals.error = true;
        res.locals.errorPasswordMatch = true;
    }

    checkName(res, name,
        checkEmail.bind(null, res, email, function() {
            // Render errors if applicable, otherwise save and authenticate
            if (res.locals.error) {
                res.render('signup');
            } else {
                saveUser(res, name, password, email,
                    authenticate.bind(null, req, res));
            }
        }));
});

module.exports = router;