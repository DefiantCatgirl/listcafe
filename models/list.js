var bookshelf = require('../config/db');

var List = bookshelf.Model.extend({
    tableName: 'lists'
});

List.Collection = bookshelf.Collection.extend({
    model: List
});

module.exports = bookshelf.model('List', List);