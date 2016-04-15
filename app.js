var express = require('express');
var path = require('path');
var bodyParser = require('body-parser');
var validator = require('validator');
var app = express();

// Configure template engine
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'slm');

app.use(bodyParser.urlencoded({ extended: true }));

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

app.get('/', function (req, res) {
    res.render('index')
});

app.get('/about', function (req, res) {
    res.render('about')
});

app.get('/login', function (req, res) {
    res.render('login')
});

app.get('/signup', function (req, res) {
    res.render('signup')
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
    }

    var salt = crypto.randomBytes(16).toString('base64');

    User.forge({
        name: req.body.name,
        password: hashPassword(req.body.password, salt),
        email: req.body.email,
        salt: salt,
        role_id: 0
    })
        .save()
        .then(function(user) {
            res.redirect('/');
        })
});



app.listen(3000, function () {
    console.log('Example app listening on port 3000!');
});