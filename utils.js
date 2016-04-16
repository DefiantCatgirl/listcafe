var crypto = require('crypto');

module.exports.hashPassword = function (password, salt) {
    var hash = crypto.createHash('sha256');
    hash.update(password);
    hash.update(salt);
    return hash.digest('hex');
};

module.exports.generateSalt = function () {
    return crypto.randomBytes(16).toString('base64');
};