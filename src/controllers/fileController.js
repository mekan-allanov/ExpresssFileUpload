import fs from "fs";
import path from "path";
import File from "../models/File.js";

// Upload a file
export const uploadFile = async (req, res) => {
	try {
		// Check for file validation errors
		if (req.fileValidationError) return res.status(400).json({ message: req.fileValidationError });

		// Ensure a file is uploaded
		if (!req.file) return res.status(400).json({ message: "Please upload a file" });

		// Extract file details
		const { filename, mimetype, size } = req.file;
		const name = path.parse(filename).name; // Get the file name without extension
		const extension = path.extname(filename); // Get the file extension
		const uploadDate = new Date(); // Get the current date and time

		// Create a new file record in the database
		const file = await File.create({
			name,
			extension,
			mimeType: mimetype,
			size,
			uploadDate,
			userId: req.user?.id, // Associate the file with the user
		});

		// Respond with the created file details
		res.status(201).json(file);
	} catch (error) {
		console.error(error);
		// Handle any errors that occur during the upload process
		res.status(500).json({ message: "Error uploading file" });
	}
};

// List all files for the authenticated user
export const listFiles = async (req, res) => {
	try {
		// Get pagination parameters from the query
		const page = Number(req.query.page) || 1; // Default to page 1
		const listSize = Number(req.query.list_size) || 10; // Default to 10 items per page
		const offset = (page - 1) * listSize; // Calculate the offset for pagination

		// Fetch files from the database for the authenticated user
		const files = await File.findAll({
			where: { userId: req.user?.id },
			limit: listSize,
			offset,
		});

		// Respond with the list of files
		res.json(files);
	} catch (error) {
		console.error(error);
		// Handle any errors that occur during the file listing process
		res.status(500).json({ message: "Error fetching files" });
	}
};

// Delete a specific file by ID
export const deleteFile = async (req, res) => {
	try {
		// Find the file in the database
		const file = await File.findOne({
			where: { id: req.params.id, userId: req.user?.id },
		});

		// If the file is not found, respond with a 404 error
		if (!file) return res.status(404).json({ message: "File not found" });

		// Construct the file path for deletion
		const filePath = path.join(process.cwd(), "uploads", `${file.get("name")}${file.get("extension")}`);
		fs.unlinkSync(filePath); // Delete the file from the filesystem

		// Remove the file record from the database
		await file.destroy();
		res.sendStatus(204); // No content
	} catch (error) {
		console.error(error);
		// Handle any errors that occur during the file deletion process
		res.status(500).json({ message: "Error deleting file" });
	}
};

// Get a specific file by ID
export const getFile = async (req, res) => {
	try {
		// Find the file in the database
		const file = await File.findOne({
			where: { id: req.params.id, userId: req.user?.id },
		});

		// If the file is not found, respond with a 404 error
		if (!file) return res.status(404).json({ message: "File not found" });

		// Respond with the file details
		res.json(file);
	} catch (error) {
		console.error(error);
		// Handle any errors that occur during the file retrieval process
		res.status(500).json({ message: "Error fetching file information" });
	}
};

// Download a specific file by ID
export const downloadFile = async (req, res) => {
	try {
		// Find the file in the database
		const file = await File.findOne({
			where: { id: req.params.id, userId: req.user?.id },
		});

		// If the file is not found, respond with a 404 error
		if (!file) return res.status(404).json({ message: "File not found" });

		// Construct the file name and path for downloading
		const fileName = `${file.get("name")}${file.get("extension")}`;
		const filePath = path.join(process.cwd(), "uploads", fileName);

		// Initiate the file download
		res.download(filePath, fileName);
	} catch (error) {
		console.error(error);
		// Handle any errors that occur during the file download process
		res.status(500).json({ message: "Error downloading file" });
	}
};

// Update a specific file by ID
export const updateFile = async (req, res) => {
	try {
		// Find the existing file in the database
		const existingFile = await File.findOne({
			where: { id: req.params.id, userId: req.user?.id },
		});

		// If the file is not found, respond with a 404 error
		if (!existingFile) return res.status(404).json({ message: "File not found" });

		// Check for file validation errors
		if (req.fileValidationError) return res.status(400).json({ message: req.fileValidationError });

		// Ensure a new file is uploaded
		if (!req.file) return res.status(400).json({ message: "Please upload a file" });

		// Extract new file details
		const { filename, mimetype, size } = req.file;
		const name = path.parse(filename).name; // Get the new file name without extension
		const extension = path.extname(filename); // Get the new file extension

		// Delete the old file from the filesystem
		const oldFilePath = path.join(process.cwd(), "uploads", `${existingFile.get("name")}${existingFile.get("extension")}`);
		fs.unlinkSync(oldFilePath);

		// Update the file record in the database
		await existingFile.update({
			name,
			extension,
			mimeType: mimetype,
			size,
			uploadDate: new Date(),
		});

		// Respond with the updated file details
		res.json(existingFile);
	} catch (error) {
		console.error(error);
		// Handle any errors that occur during the file update process
		res.status(500).json({ message: "Error updating file" });
	}
};
