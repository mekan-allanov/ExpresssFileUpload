import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { Op } from "sequelize";
import { generateTokens } from "../middleware/auth.js";
import Token from "../models/Token.js";
import User from "../models/User.js";
import { isValidEmail, isValidPassword, isValidUsername } from "../utils/validators.js";

// Sign up a new user
export const signup = async (req, res) => {
	try {
		const { email, password, username } = req.body;

		// Validate required fields
		if (!email || !password || !username) return res.status(400).json({ message: "All fields are required" });

		// Validate email format
		if (!isValidEmail(email)) return res.status(400).json({ message: "Invalid email format" });

		// Validate password strength
		if (!isValidPassword(password))
			return res.status(400).json({
				message: "Password must be at least 6 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one special character",
			});

		// Validate username format
		if (!isValidUsername(username))
			return res.status(400).json({
				message: "Username must be 3-30 characters long and can only contain letters, numbers, and underscores",
			});

		// Check for existing user by username or email
		const existingUser = await User.findOne({ where: { [Op.or]: [{ username }, { email }] } });
		if (existingUser) return res.status(400).json({ message: "Username or email already exists" });

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
			return res.status(400).json({ message: "Validation error", errors: messages });
		}

		console.error(error);
		return res.status(500).json({ message: "Error creating user" });
	}
};

// Sign in an existing user
export const signin = async (req, res) => {
	try {
		const { email, password } = req.body;
		const deviceInfo = req.headers["user-agent"] || null;

		// Validate required fields
		if (!email || !password) return res.status(400).json({ message: "All fields are required" });

		// Find user by id
		const user = await User.findOne({ where: { email } });
		if (!user) return res.status(400).json({ message: "User not found" });

		// Verify the password
		const validPassword = await bcrypt.compare(password, user.password);
		if (!validPassword) return res.status(400).json({ message: "Invalid password" });

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
		console.error(error);
		return res.status(500).json({ message: "Error logging in" });
	}
};

// Refresh the access token using the refresh token
export const refreshToken = async (req, res) => {
	const { refreshToken } = req.body;
	if (!refreshToken) return res.sendStatus(401); // Unauthorized if no refresh token is provided

	try {
		// Find the token record in the database
		const tokenRecord = await Token.findOne({
			where: {
				refreshToken,
				status: "active",
			},
		});

		if (!tokenRecord) return res.sendStatus(403); // Forbidden if the token is not found

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
		console.error(error);
		return res.sendStatus(403); // Forbidden if token verification fails
	}
};

// Get user information
export const getUserInfo = async (req, res) => {
	try {
		// Retrieve the user ID from the request object, which is set by the authentication middleware
		const userId = req.user.id;

		// Find the user by ID from the token
		const user = await User.findByPk(userId, {
			attributes: ["id", "email", "username"],
		});

		if (!user) return res.status(404).json({ message: "User not found" });

		// Respond with user information
		return res.json(user);
	} catch (error) {
		console.error(error);
		// Handle any errors that occur during the user information retrieval process
		return res.status(500).json({ message: "Error fetching user information" });
	}
};

// Log out the user from the current session
export const logout = async (req, res) => {
	try {
		// Update the token record to block it
		await req.tokenRecord.update({ status: "blocked" });
		return res.sendStatus(204); // No content
	} catch (error) {
		console.error(error);
		return res.status(500).json({ message: "Error logging out" });
	}
};

// Log out the user from all sessions
export const logoutAll = async (req, res) => {
	try {
		// Update all token records for the user to block them
		await Token.update({ status: "blocked" }, { where: { userId: req.user.id } });
		return res.sendStatus(204); // No content
	} catch (error) {
		console.error(error);
		return res.status(500).json({ message: "Error logging out from all devices" });
	}
};
