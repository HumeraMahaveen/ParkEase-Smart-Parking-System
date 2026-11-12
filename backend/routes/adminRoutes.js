
import express from "express";

import {
  getDashboardStats,
  getSlotOccupancyReport,
  getBookingReport,
  getRevenueReport,
  getVehicleEntryExitReport,
  getAllPayments,
  getAllUsers,
  updateUserRole
} from "../controllers/adminController.js";

import {
  protect,
  authorizeRoles
} from "../middleware/authMiddleware.js";

const router = express.Router();

// Admin dashboard
router.get("/dashboard", protect, authorizeRoles("admin"), getDashboardStats);

// Slot occupancy report
router.get("/reports/occupancy", protect, authorizeRoles("admin"), getSlotOccupancyReport);

// Booking report
router.get("/reports/bookings", protect, authorizeRoles("admin"), getBookingReport);

// Revenue report
router.get("/reports/revenue", protect, authorizeRoles("admin"), getRevenueReport);

// Vehicle entry/exit report
router.get("/reports/vehicle-entry-exit", protect, authorizeRoles("admin"), getVehicleEntryExitReport);

// All customer payments
router.get("/payments", protect, authorizeRoles("admin"), getAllPayments);

// User management
router.get("/users", protect, authorizeRoles("admin"), getAllUsers);

// Update user role
router.put("/users/:id/role", protect, authorizeRoles("admin"), updateUserRole);

export default router;
