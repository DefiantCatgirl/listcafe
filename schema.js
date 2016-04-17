var Schema = {
    users: {
        id: {type: 'increments', nullable: false, primary: true},
        email: {type: 'string', maxlength: 254, nullable: false, unique: true},
        name: {type: 'string', maxlength: 50, nullable: false, unique: true},
        password: {type: 'string', nullable: true, maxlength: 1000},
        salt: {type: 'string', nullable: true, maxlength: 1000},
        role_id: {type: 'integer', nullable: false, unsigned: true, references: 'roles.id'}
    },
    roles: {
        id: {type: 'integer', nullable: false, primary: true},
        name: {type: 'string', maxlength: 150, nullable: false}
    },
    lists: {
        id: {type: 'increments', nullable: false, primary: true},
        name: {type: 'string', maxlength: 150, nullable: false},
        description: {type: 'string', maxlength: 1000, nullable: true},
        url: {type: 'string', maxlength: 50, nullable: false, unique: true}
    },
    lists_items: {
        id: {type: 'increments', nullable: false, primary: true},
        list_id: {type: 'integer', nullable: false, unsigned: true, references: 'lists.id'},
        name: {type: 'string', maxlength: 150, nullable: false},
        description: {type: 'string', maxlength: 50000, nullable: false},
        image: {type: 'string', maxlength: 1000, nullable: true}
    },
    users_lists: {
        id: {type: 'increments', nullable: false, primary: true},
        list_id: {type: 'integer', nullable: false, unsigned: true, references: 'lists.id'},
        user_id: {type: 'integer', nullable: false, unsigned: true, references: 'users.id'}
    },
    users_list_items: {
        id: {type: 'increments', nullable: false, primary: true},
        list_id: {type: 'integer', nullable: false, unsigned: true, references: 'lists.id'},
        list_item_id: {type: 'integer', nullable: false, unsigned: true, references: 'list_items.id'},
        user_id: {type: 'integer', nullable: false, unsigned: true, references: 'users.id'},
        status_id: {type: 'integer', nullable: false, unsigned: true, references: 'list_item_statuses.id'},
        updated_at: {type: 'dateTime', nullable: false}
    },
    list_items_statuses: {
        id: {type: 'increments', nullable: false, primary: true},
        list_id: {type: 'integer', nullable: false, unsigned: true, references: 'lists.id'},
        name: {type: 'string', maxlength: 150, nullable: false}
    }
};

module.exports = Schema;