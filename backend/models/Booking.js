
import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  parkingSlot: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "ParkingSlot",
    required: true
  },
  vehicleNumber: {
    type: String,
    required: true
  },
  vehicleType: {
    type: String,
    required: true
  },
  bookingDate: {
    type: Date,
    default: Date.now
  },
  entryTime: {
    type: Date,
    default: null
  },
  exitTime: {
    type: Date,
    default: null
  },
  duration: {
    type: Number,
    default: 0
  },
  amount: {
    type: Number,
    default: 0
  },
  status: {
    type: String,
    enum: ["Booked", "Active", "Completed", "Cancelled"],
    default: "Booked"
  }
}, {
  timestamps: true
});

const Booking = mongoose.model("Booking", bookingSchema);

export default Booking;
