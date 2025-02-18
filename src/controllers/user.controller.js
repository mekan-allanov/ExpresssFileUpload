import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { Op } from "sequelize";
import { generateTokens } from "../middleware/auth.middleware.js";
import { ApiError } from "../middleware/error.middleware.js";
import Token from "../models/Token.js";
import User from "../models/User.js";
import { isValidEmail, isValidPassword, isValidUsername } from "../utils/validators.js";

// Sign up a new user
export const signup = async (req, res, next) => {
	try {
		const { email, password, username } = req.body;

		// Validate required fields
		if (!email || !password || !username) throw new ApiError(400, "All fields are required");

		// Validate email format
		if (!isValidEmail(email)) throw new ApiError(400, "Invalid email format");

		// Validate password strength
		if (!isValidPassword(password))
			throw new ApiError(
				400,
				"Password must be at least 6 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one special character"
			);

		// Validate username format
		if (!isValidUsername(username)) throw new ApiError(400, "Username must be 3-30 characters long and can only contain letters, numbers, and underscores");

		// Check for existing user by username or email
		const existingUser = await User.findOne({ where: { [Op.or]: [{ username }, { email }] } });
		if (existingUser) throw new ApiError(400, "Username or email already exists");

		// Hash the password before saving
		const hashedPassword = await bcrypt.hash(password, 10);
		const user = await User.create({ username, email, password: hashedPassword });

		// Generate access and refresh tokens
		const { accessToken, refreshToken } = generateTokens({ id: user.id });

		// Store the tokens in the database
		await Token.create({ userId: user.id, token: accessToken, refreshToken });

		// Respond with the tokens
		return res.status(201).json({ accessToken, refreshToken });
	} catch (error) {
		// Handle validation errors from Sequelize
		if (error.name === "SequelizeValidationError") {
			const messages = error.errors.map(err => err.message);
			next(new ApiError(400, "Validation error", messages));
			return;
		}

		next(error);
	}
};

// Sign in an existing user
export const signin = async (req, res, next) => {
	try {
		const { email, password } = req.body;
		const deviceInfo = req.headers["user-agent"] || null;

		// Validate required fields
		if (!email || !password) throw new ApiError(400, "All fields are required");

		// Find user by id
		const user = await User.findOne({ where: { email } });
		if (!user) throw new ApiError(400, "User not found");

		// Verify the password
		const validPassword = await bcrypt.compare(password, user.password);
		if (!validPassword) throw new ApiError(400, "Invalid password");

		// Generate access and refresh tokens
		const { accessToken, refreshToken } = generateTokens({ id: user.id }, deviceInfo);

		// Store the tokens in the database
		await Token.create({
			userId: user.id,
			token: accessToken,
			refreshToken,
			deviceInfo,
			status: "active",
		});

		// Respond with the tokens
		return res.json({ accessToken, refreshToken });
	} catch (error) {
		next(error);
	}
};

// Refresh the access token using the refresh token
export const refreshToken = async (req, res, next) => {
	const { refreshToken } = req.body;
	if (!refreshToken) throw new ApiError(401, "No refresh token provided");

	try {
		// Find the token record in the database
		const tokenRecord = await Token.findOne({
			where: {
				refreshToken,
				status: "active",
			},
		});

		if (!tokenRecord) throw new ApiError(403, "Invalid refresh token");

		// Verify the refresh token
		const user = jwt.verify(refreshToken, process.env.SECRET_KEY);
		const { accessToken, refreshToken: newRefreshToken } = generateTokens({ id: user.id }, tokenRecord.deviceInfo);

		// Update the token record with new tokens
		await tokenRecord.update({
			token: accessToken,
			refreshToken: newRefreshToken,
			status: "active",
		});

		// Respond with the new tokens
		return res.json({ accessToken, refreshToken: newRefreshToken });
	} catch (error) {
		if (error.name === "JsonWebTokenError") {
			next(new ApiError(403, "Invalid refresh token"));
			return;
		}
		next(error);
	}
};

// Get user information
export const getUserInfo = async (req, res, next) => {
	try {
		// Retrieve the user ID from the request object, which is set by the authentication middleware
		const userId = req.user.id;

		// Find the user by ID from the token
		const user = await User.findByPk(userId, {
			attributes: ["id", "email", "username"],
		});

		if (!user) throw new ApiError(404, "User not found");

		// Respond with user information
		return res.json(user);
	} catch (error) {
		// Handle any errors that occur during the user information retrieval process
		next(error);
	}
};

// Log out the user from the current session
export const logout = async (req, res, next) => {
	try {
		// Update the token record to block it
		await req.tokenRecord.update({ status: "blocked" });
		return res.sendStatus(204); // No content
	} catch (error) {
		next(error);
	}
};

// Log out the user from all sessions
export const logoutAll = async (req, res, next) => {
	try {
		// Update all token records for the user to block them
		await Token.update({ status: "blocked" }, { where: { userId: req.user.id } });
		return res.sendStatus(204); // No content
	} catch (error) {
		next(error);
	}
};
