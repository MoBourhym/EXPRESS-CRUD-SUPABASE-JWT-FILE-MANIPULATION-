import express from "express";
import {
  getActivityById,
  getAllActivity,
  getDayActivity,
  getAverageWorkTime,
} from "../controllers/activity.controllers.js";
const router = express.Router();
router.get("/", getDayActivity);
router.get("/average",getAverageWorkTime);
router.get("/:id", getActivityById);
export default router;
