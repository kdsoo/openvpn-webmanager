// Platform check helper routine
var os = require('os');
var fs = require('fs');
var readline = require('readline');
var spawn = require('child_process').spawn;
var execSync = require('child_process').execSync;

var gitVersion;
// Get version on service init
getRevHash(function(err, version, timestamp, dirty) {
	if (err) {
		console.error(err);
		gitVersion = err;
	}
	gitVersion = {"host": os.hostname(), "node": process.version
		, "service": version, "timestamp": timestamp, "dirty": dirty};
	console.log(gitVersion);
});

module.exports.getVersion = function(cb) {
	isRepoDirty(function(err, isDirty) {
		if (err) {
			gitVersion.dirty = err;
		} else {
			gitVersion.dirty = isDirty;
		}
		cb(gitVersion);
	});
};

function isRepoDirty(callback) {
	var dirty = spawn('git', ['diff']);
	var isDirty = false;
	dirty.stderr.on('data', function(data) {
		console.log('err data: ' + data);
		callback(data);
	});
	dirty.stdout.on('data', function(data) {
		if (data) isDirty = true;
	});
	dirty.stdout.on('end', function(data) {
		if (isDirty) console.log("repository is dirty");
		callback(null, isDirty);
	});
}

function getRevHash(callback) {
	var child = spawn('git', ['log', '-1', '--format=%h,%cd']);

	child.stderr.on('data', function(data) {
		console.log('err data: ' + data);
		callback(data);
	});

	child.stdout.on('data', function(data) {
		console.log('stdout: (' + data + ')');
		var str = data.toString();
		var ret = data.toString().split(",");
		var version = ret[0];
		var timestamp = ret[1];
		isRepoDirty(function(err, isDirty) {
			if (err) callback(err);
			callback(null, version, timestamp.replace(/\n$/, ''), isDirty);
		});
	});
};

module.exports.gitPull = function(callback) {
	var child = spawn('git', ['pull']);
	var error = "";
	var log = "";

	child.stderr.on('data', function(data) {
		console.log('err data: ' + data);
		error += data;
	});

	child.stdout.on('data', function(data) {
		console.log('stdout: ' + data);
		log += data;
	});

	var rl = readline.createInterface({input: child.stdout});
	rl.on('line', function(line) {
		var lineArr = line.split(" ").filter(Boolean);
		console.log("readline stdout");
		console.log(lineArr);
	});

	var rle = readline.createInterface({input: child.stderr});
	rle.on('line', function(line) {
		var lineArr = line.split(" ").filter(Boolean);
		console.log("readline stderr");
		console.log(lineArr);
		console.log("stderr last word : " + lineArr[lineArr.length -1]);
		if (lineArr[lineArr.length -1] == "origin/master") {
			error = "";
		}
	});

	child.stdout.on('end', function() {
		console.log('end: ' + log);
		var ret = true;
		var logArr = log.split(" ").filter(Boolean);
		if (logArr[0] == "Already") {
			ret = log;
		}
		callback(error, ret);
	});

};

module.exports.gitCheckout = function(head, callback) {
	var child = spawn('git', ['checkout', head]);

	child.stderr.on('data', function(data) {
		console.log('err data: ' + data);
		callback();
	});

	child.stdout.on('data', function(data) {
		console.log('stdout: ' + data);
		callback(data);
	});
};

module.exports.gitReset = function() {
	var child = spawn('git', ['reset', '--hard']);

	child.stderr.on('data', function(data) {
		console.log('err data: ' + data);
		callback();
	});

	child.stdout.on('data', function(data) {
		console.log('stdout: ' + data);
		callback(data);
	});

};

module.exports.npmInstall = function(callback) {
	var child = spawn('npm', ['install']);
	var error = "";
	var log = "";

	child.stderr.on('data', function(data) {
		console.log('err data: ' + data);
		error += data;
	});

	child.stdout.on('data', function(data) {
		console.log('stdout: ' + data);
		log += data;
	});
	child.stdout.on('end', function(data) {
		console.log('stdout: ' + data);
		callback(error, log);
	});

}

module.exports.serviceUptime = function(callback) {
	String.prototype.toHHMMSS = function () {
		var sec_num = parseInt(this, 10); // don't forget the second param
		var hours   = Math.floor(sec_num / 3600);
		var minutes = Math.floor((sec_num - (hours * 3600)) / 60);
		var seconds = sec_num - (hours * 3600) - (minutes * 60);

		if (hours   < 10) {hours   = "0"+hours;}
		if (minutes < 10) {minutes = "0"+minutes;}
		if (seconds < 10) {seconds = "0"+seconds;}
		var time    = hours+':'+minutes+':'+seconds;
		return time;
	}

	var time = process.uptime();
	var uptime = (time + "").toHHMMSS();
	callback(uptime);
}

module.exports.serviceUptimeSync = function() {
	String.prototype.toHHMMSS = function () {
		var sec_num = parseInt(this, 10); // don't forget the second param
		var hours   = Math.floor(sec_num / 3600);
		var minutes = Math.floor((sec_num - (hours * 3600)) / 60);
		var seconds = sec_num - (hours * 3600) - (minutes * 60);

		if (hours   < 10) {hours   = "0"+hours;}
		if (minutes < 10) {minutes = "0"+minutes;}
		if (seconds < 10) {seconds = "0"+seconds;}
		var time    = hours+':'+minutes+':'+seconds;
		return time;
	}

	var time = process.uptime();
	var uptime = (time + "").toHHMMSS();
	return uptime;
}
