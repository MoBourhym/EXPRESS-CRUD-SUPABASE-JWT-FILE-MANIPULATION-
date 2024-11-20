import express from "express";
import { handleLogout } from "../controllers/logout.controller.js";

const router = express.Router();

router.get("/login", handleLogout);

export default router;
