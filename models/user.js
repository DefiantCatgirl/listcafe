var bookshelf = require('../config/db');

var User = bookshelf.Model.extend({
    tableName: 'users',
    role: function () {
        return this.belongsTo('Role', 'role_id');
    },
    lists: function () {
        return this.belongsToMany('List', 'users_lists', 'user_id', 'list_id');
    }
});

module.exports = bookshelf.model('User', User);