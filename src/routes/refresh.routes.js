import express from "express";
import { handleRefreshToken } from "../controllers/refresh.controller.js";

const router = express.Router();

router.get("/", handleRefreshToken);

export default router;
