var express = require('express');
var validator = require('validator');
var List = require('../models/list');
var router = express.Router();

router.get('/lists', function (req, res) {
    List.forge()
        .query("orderByRaw", "LOWER(name)")
        .fetchAll()
        .then(function (lists) {
            res.render('lists', {lists: lists.models});
        })
        .catch(function(error) {
            console.error(error);
            res.render('500');
        });
});

router.get('/createlist', function (req, res) {
    if (!req.user) {
        return res.redirect('/login');
    }
    res.render('createlist');
});

function checkName(res, name, next) {
    List.forge()
        .query("whereRaw", "LOWER(name) LIKE ?", name.toLowerCase())
        .fetch()
        .then(function (list) {
            if (list) {
                res.locals.error = true;
                res.locals.errorExistingName = true;
            }
            next();
        });
}

function checkUrl(res, url, next) {
    List.forge()
        .query("whereRaw", "LOWER(url) LIKE ?", url.toLowerCase())
        .fetch()
        .then(function(list) {
            if (list) {
                res.locals.error = true;
                res.locals.errorExistingUrl = true;
            }
            next();
        });
}

function saveList(res, name, url, desc, next) {
    List.forge({
            name: name,
            url: url,
            description: desc
        })
        .save()
        .then(function (list) {
            next(list);
        })
        .catch(function (error) {
            console.error(error);
            res.render('500');
        });
}

router.post('/createlist', function (req, res) {
    if (!req.user) {
        return res.redirect('/login');
    }

    var url = validator.trim(req.body.url);
    var name = validator.trim(req.body.name);
    var desc = validator.trim(req.body.desc);

    res.locals = req.body;
    if (url.length > 0 && !validator.isAlphanumeric(url.replaceAll('.', '').replaceAll('_', '').replaceAll('-', ''))) {
        res.locals.error = true;
        res.locals.errorInvalidUrl = true;
    }

    if (url.length > 50) {
        res.locals.error = true;
        res.locals.errorLongUrl = true;
    }

    if (url.replaceAll('.', '').replaceAll('_', '').replaceAll('-', '').length < 3) {
        res.locals.error = true;
        res.locals.errorShortUrl = true;
    }

    if (name.length > 0 && !validator.isAlphanumeric(name.replaceAll('.', '').replaceAll('_', '').replaceAll('-', '').replaceAll(' ', ''))) {
        res.locals.error = true;
        res.locals.errorInvalidName = true;
    }

    if (name.length > 50) {
        res.locals.error = true;
        res.locals.errorLongName = true;
    }

    if (name.replaceAll('.', '').replaceAll('_', '').replaceAll('-', '').length < 3) {
        res.locals.error = true;
        res.locals.errorShortName = true;
    }

    if (desc.length > 1000) {
        res.locals.error = true;
        res.locals.errorLongDesc = true;
    }

    checkName(res, name,
        checkUrl.bind(null, res, url, function() {
            if (res.locals.error) {
                res.render('createlist');
            } else {
                saveList(res, name, url, desc,
                    function(list) {
                        res.redirect('/lists/' + list.attributes.url);
                    });
            }
        }));
});

function showList(req, res) {
    List.forge()
        .query("whereRaw", "LOWER(url) LIKE ?", req.params.url.toLowerCase())
        .fetch()
        .then(function (list) {
            if (list) {
                res.render('list', {list: list.attributes});
            } else {
                res.render('404');
            }
        });
}

router.get('/lists/:url', function(req, res) {
    if (req.user) {
        req.user.fetch({withRelated: [{
                lists: function(query) {
                    query.whereRaw("LOWER(url) LIKE ?", req.params.url.toLowerCase())
                }
            }]})
            .then(function(user) {
                if (user.related('lists').models.length == 0) {
                    showList(req, res);
                } else {
                    res.render('list', {
                        list: user.related('lists').models[0].attributes,
                        showAddButton: true
                    });
                }
            });
    } else {
        showList(req, res);
    }
});

router.get('/lists/:url/add', function(req, res) {
    if (!req.user) {
        return res.redirect('/login');
    }

    req.user.fetch({withRelated: [{
            lists: function(query) {
                query.whereRaw("LOWER(url) LIKE ?", req.params.url.toLowerCase())
            }
        }]})
        .then(function(user) {
            if (user.related('lists').models.length > 0) {
                return res.redirect('/user/' + user.attributes.name);
            }

            List.forge()
                .query("whereRaw", "LOWER(url) LIKE ?", req.params.url.toLowerCase())
                .fetch()
                .then(function(list) {
                    if (list) {
                        user.lists().attach(list);
                        user.save().then(function(user) {
                            res.redirect('/user/' + user.attributes.name);
                        });
                    } else {
                        res.render('404');
                    }
                });
        });
});

module.exports = router;