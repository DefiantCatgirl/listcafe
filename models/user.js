var bookshelf = require('../config/db');

var User = bookshelf.Model.extend({
    tableName: 'users',
    role: function () {
        return this.belongsTo('Role', 'role_id');
    }
});

module.exports = bookshelf.model('User', User);