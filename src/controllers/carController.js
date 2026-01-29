import Car from '../models/Car.js';

export const listCars = async (req, res) => {
  try {
    const cars = await Car.find({}).lean();
    if (!cars || cars.length === 0) {
      return res.status(200).json({ success: true, count: 0, data: [] });
    }
    return res.status(200).json({ success: true, count: cars.length, data: cars });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to fetch cars' });
  }
};


