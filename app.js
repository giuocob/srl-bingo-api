var express = require('express');
var bodyParser = require('body-parser');
var app = express();
var port = process.env.PORT || 17888;
var path = require('path');

app.set('port', port);
app.use(bodyParser.json());

// Middleware to fix query string garbage from racebot
app.use(function(req, res, next) {
	Object.keys(req.query).forEach(function(key) {
		if(key.indexOf('amp;') === 0) {
			var newKey = key.slice('amp;'.length);
			req.query[newKey] = req.query[key];
			delete req.query[key];
		}
	});
	next();
});

// Add res.error and res.result functions, to be used to return from api endpoints
var errorLib = require('./lib/error');
app.use(function(req, res, next) {
	res.result = function(result) {
		var responseObject = { success: true };
		if(result && (typeof result == 'object' || typeof result == 'string' || typeof result == 'number')) {
			responseObject = result;
		}
		var responseText = JSON.stringify(result,null,4);
		this.status(200);
		this.set({
			'Content-Type': 'application/json',
			'Content-Length': Buffer.byteLength(responseText)
		});
		this.send(responseText);
	};

	res.error = function(error) {
		var httpStatus = 500, responseObject = { code: 'INTERNAL_ERROR' };
		if(error && error instanceof errorLib.ApiError) {
			if(error.code) {
				responseObject.code = error.code;
				var errorDefaults = errorLib.errorCodes[error.code];
				if(errorDefaults) {
					if(errorDefaults.status) httpStatus = errorDefaults.status;
					if(errorDefaults.message) responseObject.message = errorDefaults.message;
				}
			}
			if(error.message) responseObject.message = error.message;
			if(error.data) responseObject.data = error.data;
		}

		this.status(httpStatus).json(responseObject);
	};

	next();
});


app.get('/', function(req,res) {
	res.sendFile(path.dirname(require.main.filename)+'/public/index.html');
});


// Let the router set itself up
require('./api/router').setup(app);


app.listen(app.get('port'));
console.log('Server listening on port ' + port);
