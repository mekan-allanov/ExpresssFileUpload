class ApiError extends Error {
	constructor(statusCode, message) {
		super(message);
		this.statusCode = statusCode;
		this.status = `${statusCode}`.startsWith("4") ? "fail" : "error";
		this.isOperational = true;

		Error.captureStackTrace(this, this.constructor);
	}
}

const errorHandler = (err, req, res, next) => {
	err.statusCode = err.statusCode || 500;
	err.status = err.status || "error";

	if (process.env.NODE_ENV === "development") {
		res.status(err.statusCode).json({
			status: err.status,
			error: err,
			message: err.message,
			stack: err.stack,
		});
	} else {
		// Production mode: don't leak error details
		res.status(err.statusCode).json({
			status: err.status,
			message: err.isOperational ? err.message : "Something went wrong!",
		});
	}
};

export { ApiError, errorHandler };
