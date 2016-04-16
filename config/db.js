var settings = require('../settings');

var knex = require('knex')(settings.knex);
var bookshelf = require('bookshelf')(knex);
bookshelf.plugin('registry');

module.exports = bookshelf;