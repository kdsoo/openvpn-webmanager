var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var io = require('socket.io');

var events = require('./services/localEvent');
var openvpn = require('./services/openvpn');
var ping = require('./services/ping');

var index = require('./routes/index');
var users = require('./routes/users');

var app = express();
app.io = io();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', index);
app.use('/users', users);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

app.io.on('connection', function(socket) {
	/*
	emitServiceEvent("vpn", {cmd: "gethosts"}, true, function(ret) {
		var networks = Object.keys(ret.res);
		for (var i = 0; i < networks.length; i++) {
			var table = ret.res[networks[i]].networkTable;
			app.io.sockets.emit('hosts', {network: networks[i], hosts: table});
		}
	});
	*/
	/*
	 * 	var address = socket.handshake.address;
	 * 		var idx = address.lastIndexOf(':');
	 * 			if (~idx && ~address.indexOf('.'))
	 * 					  address = address.slice(idx + 1);
	 * 					  */
	var socketId = socket.id;
	var clientIp = socket.request.connection.remoteAddress;
	console.log(socket.handshake.address + " connected");
	console.log(socket.id + "," + clientIp + " connected");

	socket.on('disconnecting', function() {
		console.log("disconnecting");
	});
	socket.on('disconnect', function() {
		console.log("disconnected");
	});
});

serviceEvent.on("trigger", function(msg) {
	try {
		if (typeof(msg) == "string")
			msg = JSON.parse(msg);
	} catch(e) {
		console.error(e);
	}
	if (!msg.res && msg.cmd) {
		switch (msg.cmd) {
			case "gethosts":
				emitServiceEvent("vpn", {cmd: "gethosts"}, true, function(ret) {
					var networks = Object.keys(ret.res);
					for (var i = 0; i < networks.length; i++) {
						var table = ret.res[networks[i]].networkTable;
						app.io.sockets.emit('hosts', {network: networks[i], hosts: table});
					}
				});
				break;
			default:
				break;
		}
	}
});

module.exports = app;
