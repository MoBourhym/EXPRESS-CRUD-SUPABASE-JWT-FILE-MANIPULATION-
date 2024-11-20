import express from "express";
import {
  addDepartement,
  deleteDepartement,
  getDepartementEmployees,
  getAllDepartment,
  getDepartmentById,

} from "../controllers/departement.controllers.js";

const router = express.Router();


router.get('/',getAllDepartment);
router.get("/employees/:id", getDepartementEmployees);
router.get("/:id", getDepartmentById);
router.post("/add", addDepartement);
router.delete("/delete/:id", deleteDepartement);

export default router;
