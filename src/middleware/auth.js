import jwt from "jsonwebtoken";
import Token from "../models/Token.js";

export const authenticateToken = async (req, res, next) => {
	const authHeader = req.headers["authorization"];
	const token = authHeader && authHeader.split(" ")[1];

	if (!token) return res.sendStatus(401);

	try {
		const user = jwt.verify(token, process.env.SECRET_KEY);
		const tokenRecord = await Token.findOne({
			where: {
				userId: user.id,
				token: token,
				status: "active", // Only allow active tokens
			},
		});

		if (!tokenRecord) {
			return res.sendStatus(403);
		}

		req.user = user;
		req.tokenRecord = tokenRecord; // Store token record for logout
		next();
	} catch (error) {
		if (error.name === "TokenExpiredError") {
			return res.status(401).json({ message: "Token expired" });
		}
		return res.sendStatus(403);
	}
};

export const generateTokens = (user, deviceInfo = null) => {
	// Generate unique tokens using timestamp and random string
	const timestamp = Date.now();
	const random = Math.random().toString(36).substring(7);

	const accessToken = jwt.sign(
		{
			id: user.id,
			timestamp,
			random,
		},
		process.env.SECRET_KEY,
		{ expiresIn: "10m" }
	);

	const refreshToken = jwt.sign(
		{
			id: user.id,
			timestamp,
			random,
		},
		process.env.SECRET_KEY
	);

	return { accessToken, refreshToken, deviceInfo };
};
