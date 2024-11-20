import express from 'express';
import { getAllEvents, updateEvent, deleteEvent, addEvent } from "../controllers/event.controllers.js"; 

const router = express.Router(); 

router.get('/', getAllEvents);
router.post('/add', addEvent);
router.put('/update/:id', updateEvent);
router.delete('/delete/:id', deleteEvent);

export default router;
