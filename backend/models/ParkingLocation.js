
import mongoose from "mongoose";

const parkingLocationSchema = new mongoose.Schema(
  {
    locationName: {
      type: String,
      required: true,
      trim: true
    },
    address: {
      type: String,
      required: true,
      trim: true
    },
    city: {
      type: String,
      required: true,
      trim: true
    },
    description: {
      type: String,
      default: ""
    },
    isActive: {
      type: Boolean,
      default: true
    }
  },
  { timestamps: true }
);

const ParkingLocation = mongoose.model(
  "ParkingLocation",
  parkingLocationSchema
);

export default ParkingLocation;
