import mongoose from 'mongoose';

const bookingSchema = new mongoose.Schema(
  {
    client: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'Client', 
      required: [true, 'Client is required'] 
    },
    vehicle: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'Vehicle', 
      required: [true, 'Vehicle is required'] 
    },
    startDate: { 
      type: Date, 
      required: [true, 'Start date is required'],
      validate: {
        validator: function(value) {
          // Ensure start date is today or in the future
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          return value >= today;
        },
        message: 'Start date cannot be in the past'
      }
    },
    endDate: { 
      type: Date, 
      required: [true, 'End date is required'],
      validate: {
        validator: function(value) {
          return value > this.startDate;
        },
        message: 'End date must be after the start date'
      }
    },
    status: { 
      type: String, 
      enum: ['Active', 'Completed', 'Cancelled'], 
      default: 'Active' 
    }
  },
  { 
    timestamps: true,
    collection: 'bookings'
  }
);

// Indexes for performance
bookingSchema.index({ vehicle: 1, startDate: 1, endDate: 1 });
bookingSchema.index({ client: 1 });
bookingSchema.index({ status: 1 });

// Pre-save middleware to prevent double booking
bookingSchema.pre('save', async function(next) {
  try {
    // Check conflicts only if relevant fields are modified or new booking
    if (this.isNew || this.isModified('startDate') || this.isModified('endDate') || this.isModified('vehicle')) {
      const conflict = await mongoose.model('Booking').findOne({
        _id: { $ne: this._id },
        vehicle: this.vehicle,
        status: { $in: ['Active'] },
        $or: [
          // Overlapping start date
          {
            startDate: { $lte: this.startDate },
            endDate: { $gt: this.startDate }
          },
          // Overlapping end date
          {
            startDate: { $lt: this.endDate },
            endDate: { $gte: this.endDate }
          },
          // Booking fully inside another booking
          {
            startDate: { $gte: this.startDate },
            endDate: { $lte: this.endDate }
          }
        ]
      });

      if (conflict) {
        const error = new Error('This vehicle is already booked during the selected dates.');
        error.name = 'DoubleBookingError';
        return next(error);
      }
    }

    next();
  } catch (error) {
    next(error);
  }
});

export default mongoose.model('Booking', bookingSchema);
