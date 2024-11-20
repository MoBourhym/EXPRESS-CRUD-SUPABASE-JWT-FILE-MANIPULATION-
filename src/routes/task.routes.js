import express from 'express';
import { addTask,completeTask,getAllTasks } from '../controllers/task.controllers.js';

const router = express.Router(); 

router.get('/', getAllTasks);
router.post('/add', addTask);
router.put('/done/:id', completeTask);

export default router;
