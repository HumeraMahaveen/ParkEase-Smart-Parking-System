import Payment from "../models/Payment.js";
import Booking from "../models/Booking.js";

// Create a payment for a completed booking
export const createPayment = async (req, res) => {
  try {
    const { bookingId, paymentMethod } = req.body;

    if (!bookingId || !paymentMethod) {
      return res.status(400).json({
        message: "Booking ID and payment method are required"
      });
    }

    if (!["Cash", "UPI", "Card"].includes(paymentMethod)) {
      return res.status(400).json({
        message: "Invalid payment method"
      });
    }

    const booking = await Booking.findOne({
      _id: bookingId,
      user: req.user.id,
      status: "Completed"
    });

    if (!booking) {
      return res.status(404).json({
        message: "Completed booking not found"
      });
    }

    const existingPayment = await Payment.findOne({
      booking: bookingId,
      paymentStatus: "Paid"
    });

    if (existingPayment) {
      return res.status(400).json({
        message: "This booking has already been paid"
      });
    }

    const payment = await Payment.create({
      booking: booking._id,
      user: req.user.id,
      amount: booking.amount,
      paymentMethod,
      paymentStatus: "Paid"
    });

    res.status(201).json({
      message: "Payment recorded successfully",
      payment
    });

  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
};
// Get payment history of logged-in customer
export const getMyPayments = async (req, res) => {
  try {
    const payments = await Payment.find({
      user: req.user.id
    })
      .populate("booking", "vehicleNumber vehicleType amount status")
      .sort({ createdAt: -1 });

    res.status(200).json({
      message: "Payment history fetched successfully",
      payments
    });

  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
};