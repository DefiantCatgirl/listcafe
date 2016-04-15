var express = require('express');
var path = require('path');
var bodyParser = require('body-parser');
var validator = require('validator');
var passport = require('passport');
var Strategy = require('passport-local').Strategy;
var app = express();

// Configure template engine
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'slm');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(require('express-session')({ secret: 'keyboard catgirl', resave: false, saveUninitialized: false }));
app.use(require('cookie-parser')());

// Configure static
app.use('/static', express.static('static'));

// Configure database
var knex = require('knex')({
    client: 'sqlite3',
    connection: {
        filename: "./mydb.sqlite"
    }
});

var bookshelf = require('bookshelf')(knex);

var User = bookshelf.Model.extend({
    tableName: 'users',
    role: function () {
        return this.belongsTo(Category, 'role_id');
    }
});

var Role = bookshelf.Model.extend({
    tableName: 'roles'
});

var crypto = require('crypto');
function hashPassword(password, salt) {
    var hash = crypto.createHash('sha256');
    hash.update(password);
    hash.update(salt);
    return hash.digest('hex');
}

passport.use(new Strategy({
        usernameField: 'email',
        passwordField: 'password'
    },
    function(username, password, cb) {
        User.forge({email:validator.normalizeEmail(username)}).fetch().then(function(user) {
            if (!user) {
                return cb(null, false);
            }
            if (user.attributes.password != hashPassword(password, user.attributes.salt)) {
                return cb(null, false);
            }
            return cb(null, user);
        });
    })
);

passport.serializeUser(function(user, cb) {
    console.log(user);
    cb(null, user.id);
});

passport.deserializeUser(function(id, cb) {
    console.log(id);
    User.forge({id:id}).fetch().then(function(user) {
        cb(null, user);
    });
});

app.use(passport.initialize());
app.use(passport.session());

app.use(function(req, res, next) {
    res.locals.user = req.user;
    next();
});

app.get('/', function (req, res) {
    res.render('index');
});

app.get('/about', function (req, res) {
    console.log('about');
    res.render('about');
});

app.get('/login', function (req, res) {
    res.render('login');
});

app.post('/login', passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/login'
}));

app.get('/signup', function (req, res) {
    res.render('signup');
});

app.get('/logout', function(req, res) {
    req.logout();
    res.redirect('/');
});

app.post('/signup', function (req, res) {
    if (!validator.isEmail(req.body.email) || req.body.email.length > 254) {
        res.send('Invalid e-mail');
    } else if (!validator.isAlphanumeric(req.body.name.replace('.', '').replace('_', '').replace('-', '')) || req.body.name.length > 50) {
        res.send('Invalid name');
    } else if(req.body.password.length < 6) {
        res.send('Password too short');
    } else if (req.body.password !== req.body.passwordrepeat) {
        res.send('Passwords don\'t match');
    } else {

        var salt = crypto.randomBytes(16).toString('base64');
        var email = validator.normalizeEmail(req.body.email);
        var name = req.body.name;
        var password = req.body.password

        User.forge()
            .query("whereRaw", "LOWER(name) LIKE ?", name.toLowerCase())
            .fetch()
            .then(function (user) {
                if (user) {
                    res.send('User with this name already exists')
                } else {
                    User.forge({
                        email: email
                    })
                        .fetch()
                        .then(function(user) {
                        if (user) {
                            res.send('User with this email already exists')
                        } else {
                            User.forge({
                                    name: name,
                                    password: hashPassword(password, salt),
                                    email: email,
                                    salt: salt,
                                    role_id: 0
                                })
                                .save()
                                .then(function (user) {
                                    res.redirect('/');
                                })
                        }
                    })
                }
            });
    }
});



app.listen(3000, function () {
    console.log('Example app listening on port 3000!');
});