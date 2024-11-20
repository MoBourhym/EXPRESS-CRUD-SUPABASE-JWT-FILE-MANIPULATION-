import express from 'express'; 
import { insertToBucketTest,getAllEmployees, addEmployee, updateEmployee, deleteEmployee, downloadData } from '../controllers/employee.controllers.js';
import upload from '../config/multer.config.js'; // Import the multer configuration

const router = express.Router(); 

router.get('/', getAllEmployees);
router.post('/add', upload.fields([
    { name: 'avatar', maxCount: 1 },
    { name: 'cin', maxCount: 1 },
    { name: 'cnss', maxCount: 1 }
]), addEmployee);
router.put('/update/:id', upload.fields([
    { name: 'avatar', maxCount: 1 },
    { name: 'cin', maxCount: 1 },
    { name: 'cnss', maxCount: 1 }
]), updateEmployee);
router.delete('/delete/:id', deleteEmployee);
router.get('/download/:format',downloadData)
router.post('/test',upload.fields([
    { name: 'image', maxCount: 1 }]),insertToBucketTest)
export default router;
