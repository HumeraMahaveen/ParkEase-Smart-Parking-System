import express from "express";

import {
  createPayment,
  getMyPayments
} from "../controllers/paymentController.js";

import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// Record payment
router.post("/", protect, createPayment);

// Get customer payment history
router.get("/my-payments", protect, getMyPayments);

export default router;