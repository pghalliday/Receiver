
/**
 * Module dependencies.
 */

var express = require('express');
var io = require('socket.io');
var KeyStore = require('./keys.js').KeyStore;

var sockets = {};
var keyStore = new KeyStore(6, 500000, [
		'a', 
		'b', 
		'c',
		'd',
		'e',
		'f',
		'g',
		'h',
		'i',
		'j',
		'k',
		'l',
		'm',
		'n',
		'o',
		'p',
		'q',
		'r',
		's',
		't',
		'u',
		'v',
		'w',
		'x',
		'y',
		'z'
	]);

var app = module.exports = express.createServer()
	, io = io.listen(app);

// Configuration

app.configure(function(){
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(express.cookieParser());
  app.use(express.session({ secret: 'your secret here' }));
  app.use(app.router);
  app.use(express.static(__dirname + '/public'));
});

app.configure('development', function(){
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true })); 
});

app.configure('production', function(){
  app.use(express.errorHandler()); 
});

// Routes

app.get('/', function(req, res){
  res.render('index', {
    title: 'Receiver'
  });
});

app.get('/newData', function(req, res){
  res.render('newData', {
    title: 'Receiver'
  });
});

app.post('/newData', function(req, res){
  console.log('post /newData: key: "' + req.body.key + '": newData: "' + req.body.newData + '"');

  var socket = sockets[req.body.key];

  if (socket) {
    console.log('post /newData: socket.internalKey: "' + socket.internalKey + '"');
    socket.emit('newData', req.body.newData);
  }

  res.redirect('back');
});

// io

io.sockets.on('connection', function(socket) {
  var newKey = keyStore.getKey();
  sockets[newKey] = socket;

  console.log('on connection: newKey: "' + newKey + '"');

  socket.emit('newKey', newKey);

  socket.on('disconnect', function() {
    console.log('on disconnect: newKey: "' + newKey + '"');
    delete(sockets[newKey]);
    keyStore.returnKey(newKey);
  });
});

app.listen(3000);
console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);
