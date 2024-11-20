import express from 'express'
import verifyLogin from '../controllers/verifyLogin.controller.js'



const router = express.Router();

router.get("/", verifyLogin);

export default router;