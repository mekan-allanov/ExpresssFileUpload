import fs from "fs";
import multer from "multer";
import path from "path";

// Ensure upload directory exists
const uploadDir = path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadDir)) {
	fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure storage
const storage = multer.diskStorage({
	destination: (req, file, cb) => {
		cb(null, uploadDir);
	},
	filename: (req, file, cb) => {
		const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
		cb(null, file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname));
	},
});

// File filter
const fileFilter = (req, file, cb) => {
	// Accept documents only
	if (!file.originalname.match(/\.(pdf|doc|docx|xls|xlsx|ppt|pptx)$/)) {
		req.fileValidationError = "Only documents are allowed!";
		return cb(new Error("Only documents are allowed!"), false);
	}
	cb(null, true);
};

// Export the configured multer middleware
export const upload = multer({
	storage: storage,
	fileFilter: fileFilter,
	limits: { fileSize: 5 * 1024 * 1024 }, // 5MB file size limit
});
