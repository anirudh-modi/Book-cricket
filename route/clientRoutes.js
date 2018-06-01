var express = require('express');

var router = express.Router();

var path = require('path');

router.get('/lib/:fileName', function(req, res) {
    res.sendFile(path.resolve('client/lib/' + req.params.fileName));
});

router.get('/html/:fileName', function(req, res) {
    res.sendFile(path.resolve('client/html/' + req.params.fileName));
});

router.get('/css/:fileName', function(req, res) {
    res.sendFile(path.resolve('client/css/' + req.params.fileName));
});

router.get('/model/:fileName', function(req, res) {
    res.sendFile(path.resolve('client/model/' + req.params.fileName));
});

router.get('/image/:fileName', function(req, res) {
    res.sendFile(path.resolve('client/image/' + req.params.fileName));
});

router.get('/viewmodel/:fileName', function(req, res) {
    res.sendFile(path.resolve('client/viewmodel/' + req.params.fileName));
});

module.exports = router;
