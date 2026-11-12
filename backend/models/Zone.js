
import mongoose from "mongoose";

const zoneSchema = new mongoose.Schema(
  {
    zoneName: {
      type: String,
      required: true,
      trim: true
    },
    zoneCode: {
      type: String,
      required: true,
      trim: true
    },
    location: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ParkingLocation",
      required: true
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

zoneSchema.index(
  { location: 1, zoneCode: 1 },
  { unique: true }
);

const Zone = mongoose.model("Zone", zoneSchema);

export default Zone;
