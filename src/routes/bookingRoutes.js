import express from 'express';
import { 
  createBooking, 
  getAllBookings, 
  getBookingById, 
  updateBooking,      // ✅ new controller function
  updateBookingStatus, 
  deleteBooking 
} from '../controllers/bookingController.js';

const router = express.Router();

router.post('/', createBooking);
router.get('/', getAllBookings);
router.get('/:id', getBookingById);
router.put('/:id', updateBooking);           // ✅ full update
router.put('/:id/status', updateBookingStatus);
router.delete('/:id', deleteBooking);

export default router;
