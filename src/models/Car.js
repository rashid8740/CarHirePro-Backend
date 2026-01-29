import mongoose from 'mongoose';

const carSchema = new mongoose.Schema(
  {
    plate: { type: String, required: true, index: true },
    model: { type: String, required: true },
    status: { type: String, required: true },
  },
  { timestamps: true, collection: 'cars' }
);

export default mongoose.model('Car', carSchema);


