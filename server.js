import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import sequelize from "./src/config/db.config.js";
import fileRoutes from "./src/routes/file.route.js";
import userRoutes from "./src/routes/user.route.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use("/api", userRoutes);
app.use("/api", fileRoutes);

// Error handling middleware (should be last)
app.use(errorHandler);

// Sync all models with the database
const syncDatabase = async () => {
	try {
		await sequelize.sync({ force: true }); // Use { force: true } to drop existing tables
		console.log("Database synchronized successfully.");
	} catch (error) {
		console.error("Error synchronizing database:", error);
	}
};

// Sync the database
syncDatabase();

// Start the server
app.listen(PORT, () => {
	console.log(`Server is running on http://localhost:${PORT}`);
});

export default app;
