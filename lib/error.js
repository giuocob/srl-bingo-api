var errorCodes = {
	INTERNAL_ERROR: {
		status: 500,
		message: 'An internal server error occurred.'
	},
	NOT_FOUND: {
		status: 404,
		message: 'The requested resource was not found.'
	},
	BAD_REQUEST: {
		status: 400,
		message: 'The request was not understood.'
	},
	MISSING_PARAMETER: {
		status: 400,
		message: 'Required parameters for this request are missing.'
	},
	ACCESS_DENIED: {
		status: 403,
		message: 'You do not have permission to make this request.'
	},
	MISSING_ACCESS_TOKEN: {
		status: 400,
		message: 'An access token is required to fulfill this request.'
	}
};

// Takes up to 3 arguments: one of the above codes, a string for the error message, and an object indicating additional data about the error.
var ApiError = function() {
	var args = Array.prototype.slice.call(arguments);
	if(args.length === 0) {
		this.code = 'INTERNAL_ERROR';
	} else {
		if(typeof args[0] == 'string') {
			if(errorCodes[args[0]]) {
				this.code = args[0];
			} else {
				this.code = 'INTERNAL_ERROR';
			}
		} else  {
			this.code = 'INTERNAL_ERROR';
		}

		if(args[1]) {
			if(typeof args[1] == 'string') {
				this.message = args[1];
			}

			if(args[2]) {
				if(typeof args[2] == 'object') {
					this.data = args[2];
				}
			}
		}
	}
};

module.exports.errorCodes = errorCodes;
module.exports.ApiError = ApiError;