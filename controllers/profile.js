var express = require('express');
var User = require('../models/user');
var router = express.Router();

router.get('/profile/:name', function (req, res) {
    User.forge()
        .query("whereRaw", "LOWER(name) LIKE ?", req.params.name.toLowerCase())
        .fetch()
        .then(function(user) {
            if (user) {
                console.log(user);
                res.render('profile', {profile: user.attributes});
            } else {
                res.render('404');
            }
    });
});

module.exports = router;