import express from "express";
import { handleLogout } from "../controllers/logout.controller.js";

const router = express.Router();

router.get("/", handleLogout);

export default router;
