import express from 'express';
import { listCars } from '../controllers/carController.js';

const router = express.Router();

router.get('/', listCars);

export default router;


