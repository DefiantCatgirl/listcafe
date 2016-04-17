var express = require('express');
var path = require('path');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var session = require('express-session');
var settings = require('./settings');
var passport = require('./config/auth');

require('./utils/polyfill');

var app = express();


// RENDERING //

// Configure template engine
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'slm');

// Configure static folder
app.use('/static', express.static('static'));


// MIDDLEWARE //

// required middleware
app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(cookieParser());
app.use(session({
    secret: settings.secret,
    resave: false,
    saveUninitialized: false
}));

// Configure auth
app.use(passport.initialize());
app.use(passport.session());

// Custom middlewares
app.use(require('./middlewares/user-to-templates'));


// ROUTES //

app.use(require('./controllers/index'));
app.use(require('./controllers/about'));
app.use(require('./controllers/auth'));
app.use(require('./controllers/profile'));
app.use(require('./controllers/lists'));

app.use(require('./middlewares/500'));
app.use(require('./middlewares/404'));

// RUN SERVER //

var port = app.settings.env === 'production' ? 80 : 3000;
app.listen(port, function () {
    console.log('ListCafe listening on port ' + port +'.');
});