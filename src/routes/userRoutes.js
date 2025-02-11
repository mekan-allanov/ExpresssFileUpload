import express from "express";
import {
	getUserInfo,
	logout,
	logoutAll,
	refreshToken,
	signin,
	signup,
} from "../controllers/userController.js";
import { authenticateToken } from "../middleware/auth.js";

const router = express.Router();

router.post("/signup", signup);
router.post("/signin", signin);
router.post("/signin/new_token", refreshToken);
router.get("/info", authenticateToken, getUserInfo);
router.get("/logout", authenticateToken, logout);
router.get("/logout/all", authenticateToken, logoutAll);

export default router;
