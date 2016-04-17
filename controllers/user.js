var express = require('express');
var User = require('../models/user');
var router = express.Router();

router.get('/user/:name', function (req, res) {
    User.forge()
        .query("whereRaw", "LOWER(name) LIKE ?", req.params.name.toLowerCase())
        .fetch({withRelated: {lists: function(query) {
            query.orderByRaw("LOWER(name)");
        }}})
        .then(function(user) {
            if (user) {
                res.render('user', {
                    profile: user.attributes,
                    lists: user.related('lists').models
                });
            } else {
                res.render('404');
            }
    });
});

module.exports = router;