
import mongoose from "mongoose";

const parkingSlotSchema = new mongoose.Schema({
  slotNumber: {
    type: String,
    required: true,
    unique: true
  },
  isAvailable: {
    type: Boolean,
    default: true
  },
  vehicleNumber: {
    type: String,
    default: null
  },
  vehicleType: {
    type: String,
    default: null
  },
  zone: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Zone",
    default: null
  }
}, {
  timestamps: true
});

const ParkingSlot = mongoose.model("ParkingSlot", parkingSlotSchema);

export default ParkingSlot;
