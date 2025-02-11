import express from "express";
import { deleteFile, downloadFile, getFile, listFiles, updateFile, uploadFile } from "../controllers/fileController.js";
import { authenticateToken } from "../middleware/auth.js";
import { upload } from "../middleware/fileUpload.js";

const router = express.Router();

router.post("/file/upload", authenticateToken, upload.single("file"), uploadFile);
router.get("/file/list", authenticateToken, listFiles);
router.delete("/file/delete/:id", authenticateToken, deleteFile);
router.get("/file/:id", authenticateToken, getFile);
router.get("/file/download/:id", authenticateToken, downloadFile);
router.put("/file/update/:id", authenticateToken, upload.single("file"), updateFile);

export default router;