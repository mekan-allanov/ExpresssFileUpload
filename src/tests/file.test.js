import jwt from "jsonwebtoken";
import { createConnection } from "mysql2/promise";
import path from "path";
import request from "supertest";
import server from "../server";

// Mock database connection
const dbConfig = {
	host: "localhost",
	user: "test_user",
	password: "test_password",
	database: "test_db",
};

let connection;
let token;

beforeAll(async () => {
	connection = await createConnection(dbConfig);
	// Generate a test JWT token
	token = jwt.sign({ id: 1 }, process.env.JWT_SECRET, { expiresIn: "1h" });
});

afterAll(async () => {
	await connection.end();
});

describe("File Handling Routes", () => {
	//Tests the file upload functionality by sending a POST request with a file attached.
	test("Upload File", async () => {
		const response = await request(server).post("/file/upload").set("Authorization", `Bearer ${token}`).attach("file", path.join(__dirname, "testFile.txt"));

		expect(response.status).toBe(201);
		expect(response.body).toHaveProperty("message", "File uploaded successfully");
	});
	//Tests the ability to list files by sending a GET request.
	test("List Files", async () => {
		const response = await request(server).get("/file/list").set("Authorization", `Bearer ${token}`);

		expect(response.status).toBe(200);
		expect(Array.isArray(response.body)).toBe(true);
	});
	//Tests retrieving a specific file by sending a GET request with an ID.
	test("Get File", async () => {
		const response = await request(server).get("/file/1").set("Authorization", `Bearer ${token}`);

		expect(response.status).toBe(200);
		expect(response.body).toHaveProperty("id", 1);
	});
	//Tests downloading a file by sending a GET request and checking the response headers.
	test("Download File", async () => {
		const response = await request(server).get("/file/download/1").set("Authorization", `Bearer ${token}`);

		expect(response.status).toBe(200);
		expect(response.header["content-disposition"]).toContain("attachment");
	});
	//Tests updating a file by sending a PUT request with an updated file.
	test("Update File", async () => {
		const response = await request(server).put("/file/update/1").set("Authorization", `Bearer ${token}`).attach("file", path.join(__dirname, "updatedTestFile.txt"));

		expect(response.status).toBe(200);
		expect(response.body).toHaveProperty("message", "File updated successfully");
	});
	//Tests deleting a file by sending a DELETE request.
	test("Delete File", async () => {
		const response = await request(server).delete("/file/delete/1").set("Authorization", `Bearer ${token}`);

		expect(response.status).toBe(200);
		expect(response.body).toHaveProperty("message", "File deleted successfully");
	});
});
