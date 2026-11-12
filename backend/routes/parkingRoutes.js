import express from "express";

import {
  addParkingSlot,
  getParkingSlots,
  bookParkingSlot,
  releaseParkingSlot,
  getMyBookings,
  recordVehicleEntry,
  recordVehicleExit
} from "../controllers/parkingController.js";

import {
  protect,
  authorizeRoles
} from "../middleware/authMiddleware.js";

const router = express.Router();

// Parking slot management
router.post("/", protect, addParkingSlot);
router.get("/", protect, getParkingSlots);

// Customer bookings
router.get("/my-bookings", protect, getMyBookings);
router.put("/:id/book", protect, bookParkingSlot);
router.put("/:id/release", protect, releaseParkingSlot);

// Vehicle entry
router.put(
  "/:id/entry",
  protect,
  authorizeRoles("admin", "operator", "security"),
  recordVehicleEntry
);

// Vehicle exit
router.put(
  "/:id/exit",
  protect,
  authorizeRoles("admin", "operator", "security"),
  recordVehicleExit
);

export default router;