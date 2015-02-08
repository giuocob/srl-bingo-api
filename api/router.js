var legacyBingo = require('../bingo/legacy/legacy-bingo');
var async = require('async');
var ApiError = require('../lib/error').ApiError;

exports.setup = function(app) {

	app.registerApiRoute = function() {

		function invalidRegister() {
			console.log('Invalid call to app.registerApiRoute');
			process.exit(1);
		}

		var path, method = 'POST', middlewares = [], callback;
		var args = Array.prototype.slice.call(arguments);
		if(args.length < 2) return invalidRegister();
		//Fun with args!
		path = args[0];
		if(typeof path != 'string') return invalidRegister();
		if(path[0] != '/') path = '/' + path;
		if(path.indexOf('/api') !== 0) path = '/api' + path;
		//Last arg is callback
		callback = args[args.length-1];
		if(typeof callback != 'function') return invalidRegister();
		//2nd arg may be request type, GET or POST
		if(args.length >= 3) {
			var firstMiddlewareIndex = 1;
			if(typeof args[1] == 'string') {
				firstMiddlewareIndex = 2;
				if(args[1] == 'GET' || args[1] == 'POST') {
					method = args[1];
				} else {
					return invalidRegister();
				}
			}

			for(var i=firstMiddlewareIndex;i<args.length-1;i++) {
				var midware = args[i];
				if(typeof midware != 'function') return invalidRegister();
				middlewares.push(midware);
			}
		}

		//Register route
		var appArgs = [path].concat(middlewares);
		appArgs.push(callback);
		if(method == 'GET') {
			app.get.apply(app, appArgs);
		} else if(method == 'POST') {
			app.post.apply(app, appArgs);
		} else {
			return invalidRegister();
		}
	};

	//Get card ready to send to client
	function prettifyCard(card, opts) {
		if(!opts) opts = {};
		if(opts.nameOnly) {
			card.goals = card.goals.map(function(item) {
				return item.name;
			});
		}
		return card;
	}

	function legacyBingoParams(req) {
		var params = {};
		if(req.query['seed']) {
			params.seed = req.query['seed'];
			if(typeof params.seed == 'number') params.seed = params.seed.toString();
		}
		if(req.query['mode']) params.mode = req.query['mode'];
		if(req.query['version']) params.version = req.query['version'];
		return params;
	}



	// Get a current bingo card. Still will call out to legacy because current version still uses it.
	// This route will need to be continuously updated with each version until we get a better update system rolling.
	app.registerApiRoute('bingo/card', 'GET', function(req, res) {
		var opts = legacyBingoParams(req);
		if(!opts.seed) opts.seed = Math.ceil(Math.random()*1000000).toString();
		if(opts.version) return res.error(new ApiError('BAD_REQUEST', 'Cannot pass version'));

		legacyBingo.getCard(opts, function(error, card) {
			if(error) return res.error(error);
			card = prettifyCard(card);
			res.result(card);
		});
	});

	app.registerApiRoute('bingo/legacy/card', 'GET', function(req,res) {
		var opts = legacyBingoParams(req);
		if(!opts.seed) opts.seed = Math.ceil(Math.random()*1000000).toString();
		if(!opts.version) return res.error(new ApiError('BAD_REQUEST', 'Version is a required parameter'));

		legacyBingo.getCard(opts, function(error, card) {
			if(error) return res.error(error);
			card = prettifyCard(card);
			res.result(card);
		});
	});

	//Get a card suitable for blackout (eg no duplcate goals)
	app.registerApiRoute('bingo/card/blackout', 'GET', function(req,res) {
		var opts = legacyBingoParams(req);
		var attempts = 0;
		if(opts.seed) return res.error(new ApiError('BAD_REQUEST', 'Blackout route does not accept a seed parameter'));
		if(opts.version) return res.error(new ApiError('BAD_REQUEST', 'Blackout route does not accept a version parameter'));
		var teamSize = req.query['teamSize'] || undefined;
		if(teamSize) {
			teamSize = parseInt(teamSize, 10);
			if(isNaN(teamSize)) return res.error(new ApiError('BAD_REQUEST', 'teamSize parameter not understood'));
		}

		var theCard;
		async.doWhilst(function(cb) {
			attempts++;
			if(attempts > 50) return cb(new ApiError('INTERNAL_ERROR', 'Maximum number of card attempts exceeded'));
			legacyBingo.getCard(opts, function(error, card) {
				if(error) return cb(error);
				theCard = card;
				cb();
			});
		}, function() {
			return !legacyBingo.isBlackoutFriendly(theCard, teamSize);
		}, function(error) {
			if(error) return res.error(error);
			card = prettifyCard(theCard);
			res.result(card);
		});
	});
};