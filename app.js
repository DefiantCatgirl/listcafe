var express = require('express');
var path = require('path');
var app = express();

// Configure template engine
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'slm');

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

app.get('/', function (req, res) {
    res.render('index')
});

app.listen(3000, function () {
    console.log('Example app listening on port 3000!');
});