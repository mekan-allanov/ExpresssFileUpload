import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { createConnection } from "mysql2/promise";
import request from "supertest";
import server from "../../server";
import User from "../models/User.js";

// Mock database connection
const dbConfig = {
	host: "localhost",
	user: "test_user",
	password: "test_password",
	database: "test_db",
};

let connection;
let token;
let refreshToken;

beforeAll(async () => {
	connection = await createConnection(dbConfig);
	// Create a test user and generate a token
	const hashedPassword = await bcrypt.hash("Test@1234", 10);
	await User.create({ id: "testuser", email: "test@example.com", password: hashedPassword });
	token = jwt.sign({ id: "testuser" }, process.env.JWT_SECRET, { expiresIn: "1h" });
});

afterAll(async () => {
	await connection.end();
});

describe("Authentication Routes", () => {
	test("User Signup", async () => {
		const response = await request(server).post("/signup").send({ id: "newuser", email: "newuser@example.com", password: "NewUser@1234" });

		expect(response.status).toBe(201);
		expect(response.body).toHaveProperty("accessToken");
		expect(response.body).toHaveProperty("refreshToken");
	});

	test("User Signin", async () => {
		const response = await request(server).post("/signin").send({ id: "testuser", password: "Test@1234" });

		expect(response.status).toBe(200);
		expect(response.body).toHaveProperty("accessToken");
		expect(response.body).toHaveProperty("refreshToken");
		refreshToken = response.body.refreshToken; // Store refresh token for later tests
	});

	test("Refresh Token", async () => {
		const response = await request(server).post("/signin/new_token").send({ refreshToken });

		expect(response.status).toBe(200);
		expect(response.body).toHaveProperty("accessToken");
		expect(response.body).toHaveProperty("refreshToken");
	});

	test("Get User Info", async () => {
		const response = await request(server).get("/info").set("Authorization", `Bearer ${token}`);

		expect(response.status).toBe(200);
		expect(response.body).toHaveProperty("id", "testuser");
	});

	test("Logout", async () => {
		const response = await request(server).get("/logout").set("Authorization", `Bearer ${token}`);

		expect(response.status).toBe(204);
	});

	test("Logout All", async () => {
		const response = await request(server).get("/logout/all").set("Authorization", `Bearer ${token}`);

		expect(response.status).toBe(204);
	});
});
