/**
 * Module dependencies.
 */

var express = require('express');
var io = require('socket.io');
var RandomUniqueFixedLengthKeys = require('./keys.js').RandomUniqueFixedLengthKeys;

var sockets = {};

var keys = new RandomUniqueFixedLengthKeys(6, 'abcdefghijklmnopqrstuvwxyz');
console.info('Initialised key store');

var app = module.exports = express.createServer()
,
io = io.listen(app);

// Configuration
app.configure(function() {
    app.set('views', __dirname + '/views');
    app.set('view engine', 'jade');
    app.use(express.bodyParser());
    app.use(express.methodOverride());
    app.use(express.cookieParser());
    app.use(express.session({
        secret: 'your secret here'
    }));
    app.use(app.router);
    app.use(express.static(__dirname + '/public'));
});

app.configure('development',
function() {
    app.use(express.errorHandler({
        dumpExceptions: true,
        showStack: true
    }));
});

app.configure('production',
function() {
    app.use(express.errorHandler());
});

// Routes
app.get('/',
function(req, res) {
    res.render('index', {
        title: 'Receiver'
    });
});

app.get('/newData',
function(req, res) {
    res.render('newData', {
        title: 'Receiver'
    });
});

app.post('/newData',
function(req, res) {
    console.log('post /newData: key: "' + req.body.key + '": newData: "' + req.body.newData + '"');

    var socket = sockets[req.body.key];

    if (socket) {
        console.log('post /newData: emitting newData: "' + req.body.newData + '"');
        socket.emit('newData', req.body.newData);
    }

    res.redirect('back');
});

// io
io.sockets.on('connection',
function(socket) {
    var newKey = keys.assignKey();

    if (newKey != null) {
        sockets[newKey] = socket;

        console.log('on connection: emitting newKey: "' + newKey + '"');
        socket.emit('newKey', newKey);

        socket.on('disconnect',
        function() {
            console.log('on disconnect: newKey: "' + newKey + '"');
            delete(sockets[newKey]);
            keys.unassignKey(newKey);
        });
    } else {
        console.log('on connection: emitting noKeys');
        socket.emit('noKeys');
    }
});

app.listen(3000);
console.info("Express server listening on port %d in %s mode", app.address().port, app.settings.env);
