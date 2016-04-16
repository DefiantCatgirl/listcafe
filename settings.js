var settings = {};

// Database settings, SQLite for development
settings.knex = {
    client: 'sqlite3',
    connection: {
        filename: require('path').resolve(__dirname, 'mydb.sqlite')
    }
};

// Session secret
settings.secret = 'keyboard catgirl';

// Use production settings where applicable

try {
    production = require('./settings_production_template');
    for (var attrname in obj2) {
        settings[attrname] = production[attrname];
    }
} catch (ex) {
    console.log('Production settings NOT loaded');
}

module.exports = settings;
