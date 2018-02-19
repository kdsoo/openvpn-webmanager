var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'SeaHaven VPN manager' });
});

router.get('/status', function(req, res, next) {
	emitServiceEvent("trigger", {cmd: "gethosts"}, false, function(ret) {
		res.send("done");
	});
});

router.get('/rtt/:target', function(req, res, next) {
	var target = req.params.target;
	console.log("Query ping of " + target);
	emitServiceEvent("ping", {cmd: "ping", target: target}, true, function(ret) {
		res.json(ret.res);
	});
});

module.exports = router;
