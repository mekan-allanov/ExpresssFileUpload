import dotenv from "dotenv";
import { Sequelize } from "sequelize";

dotenv.config();

// Create a new Sequelize instance without specifying a database
const sequelize = new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASSWORD, {
	host: process.env.DB_HOST,
	port: process.env.DB_PORT || 3032,
	dialect: "mysql",
	pool: {
		pool: {
			max: 5,
			min: 0,
			acquire: 30000,
			idle: 10000,
		},
	},
});

// Function to create the database if it does not exist
const createDatabaseIfNotExists = async () => {
	const dbName = process.env.DB_NAME;

	try {
		// Connect to MySQL server without specifying a database
		const connection = new Sequelize(`mysql://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}`);

		// Create the database if it does not exist
		await connection.query(`CREATE DATABASE IF NOT EXISTS \`${dbName}\`;`);
		console.log(`Database '${dbName}' checked/created successfully.`);

		// Close the connection
		await connection.close();
	} catch (error) {
		console.error("Error creating database:", error);
	}
};

// Call the function to create the database
createDatabaseIfNotExists();

//Test the connection
const testConnection = async () => {
	try {
		await sequelize.authenticate();
		console.log("Connection has been established successfully.");
	} catch (error) {
		console.error("Unable to connect to the database:", error);
	}
};

testConnection();

export default sequelize;
