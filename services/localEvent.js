var gen = require('../helper/generator');

// Event notifier
var EventEmitter = require('events').EventEmitter;

global.serviceControl = new EventEmitter();
//serviceControl.setmaxListeners(0);

global.serviceEvent = new EventEmitter();
//serviceEvent.setmaxListeners(0);

function emitServiceEvent(event, msg, needRes, cb) {
	var requestID = gen.getRequestID();
	msg.requestID = requestID;
	var channel = event + "-" + requestID;
	if (needRes) {
		serviceEvent.once(channel, function(ret) {
			// ret.res is return messages
			cb(ret);
		});
	} else {
		cb(true);
	}
	serviceEvent.emit(event, msg);
}
global.emitServiceEvent = emitServiceEvent;

function emitServiceControl(event, msg, needRes, cb) {
	var requestID = gen.getRequestID();a
	msg.requestID = requestID;
	var channel = event + "-" + requestID;
	if (needRes) {
		serviceControl.once(channel, function(ret) {
			// ret.res is return messages
			cb(ret);
		});
	} else {
		cb(true);
	}
	serviceEvent.emit(event, msg);
}
global.emitServiceControl = emitServiceControl;
