var bookshelf = require('../config/db');

var Role = bookshelf.Model.extend({
    tableName: 'roles'
});

module.exports = bookshelf.model('Role', Role);