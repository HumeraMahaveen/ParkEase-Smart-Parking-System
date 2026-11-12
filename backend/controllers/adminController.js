import ParkingSlot from "../models/ParkingSlot.js";
import Booking from "../models/Booking.js";
import Payment from "../models/Payment.js";
import User from "../models/user.js";

// Get admin dashboard statistics
export const getDashboardStats = async (req, res) => {
  try {
    const totalSlots = await ParkingSlot.countDocuments();

    const availableSlots = await ParkingSlot.countDocuments({
      isAvailable: true
    });

    const occupiedSlots = await ParkingSlot.countDocuments({
      isAvailable: false
    });

    const totalBookings = await Booking.countDocuments();

    const completedBookings = await Booking.countDocuments({
      status: "Completed"
    });

    const revenueResult = await Payment.aggregate([
      {
        $match: {
          paymentStatus: "Paid"
        }
      },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: "$amount" }
        }
      }
    ]);

    const totalRevenue = revenueResult[0]?.totalRevenue || 0;

    res.status(200).json({
      message: "Dashboard statistics fetched successfully",
      statistics: {
        totalSlots,
        availableSlots,
        occupiedSlots,
        totalBookings,
        completedBookings,
        totalRevenue
      }
    });

  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
};
// Get parking slot occupancy report
export const getSlotOccupancyReport = async (req, res) => {
  try {
    const slots = await ParkingSlot.find();

    const totalSlots = slots.length;

    const availableSlots = slots.filter(
      slot => slot.isAvailable
    ).length;

    const occupiedSlots = totalSlots - availableSlots;

    const occupancyPercentage = totalSlots > 0
      ? Number(((occupiedSlots / totalSlots) * 100).toFixed(2))
      : 0;

    res.status(200).json({
      message: "Slot occupancy report fetched successfully",
      report: {
        totalSlots,
        availableSlots,
        occupiedSlots,
        occupancyPercentage,
        slots
      }
    });

  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
};
// Get booking report
export const getBookingReport = async (req, res) => {
  try {
    const bookings = await Booking.find()
      .populate("user", "name email")
      .populate("parkingSlot", "slotNumber")
      .sort({ createdAt: -1 });

    const totalBookings = bookings.length;

    const bookedBookings = bookings.filter(
      booking => booking.status === "Booked"
    ).length;

    const activeBookings = bookings.filter(
      booking => booking.status === "Active"
    ).length;

    const completedBookings = bookings.filter(
      booking => booking.status === "Completed"
    ).length;

    const cancelledBookings = bookings.filter(
      booking => booking.status === "Cancelled"
    ).length;

    res.status(200).json({
      message: "Booking report fetched successfully",
      report: {
        totalBookings,
        bookedBookings,
        activeBookings,
        completedBookings,
        cancelledBookings,
        bookings
      }
    });

  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
};

// Get revenue report
export const getRevenueReport = async (req, res) => {
  try {
    const payments = await Payment.find()
      .populate("booking", "vehicleNumber vehicleType status")
      .populate("user", "name email")
      .sort({ createdAt: -1 });

    const totalPayments = payments.length;

    const paidPayments = payments.filter(
      payment => payment.paymentStatus === "Paid"
    );

    const pendingPayments = payments.filter(
      payment => payment.paymentStatus === "Pending"
    ).length;

    const failedPayments = payments.filter(
      payment => payment.paymentStatus === "Failed"
    ).length;

    const totalRevenue = paidPayments.reduce(
      (total, payment) => total + payment.amount,
      0
    );

    res.status(200).json({
      message: "Revenue report fetched successfully",
      report: {
        totalPayments,
        paidPayments: paidPayments.length,
        pendingPayments,
        failedPayments,
        totalRevenue,
        payments
      }
    });

  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
};

// Get vehicle entry and exit report
export const getVehicleEntryExitReport = async (req, res) => {
  try {
    const bookings = await Booking.find({
      $or: [
        { entryTime: { $ne: null } },
        { exitTime: { $ne: null } }
      ]
    })
      .populate("user", "name email")
      .populate("parkingSlot", "slotNumber")
      .sort({ createdAt: -1 });

    const totalVehicles = bookings.length;

    const vehiclesEntered = bookings.filter(
      booking => booking.entryTime !== null
    ).length;

    const vehiclesExited = bookings.filter(
      booking => booking.exitTime !== null
    ).length;

    const currentlyParked = bookings.filter(
      booking => booking.status === "Active"
    ).length;

    res.status(200).json({
      message: "Vehicle entry/exit report fetched successfully",
      report: {
        totalVehicles,
        vehiclesEntered,
        vehiclesExited,
        currentlyParked,
        vehicles: bookings
      }
    });

  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
};


// Get all customer payments for admin
export const getAllPayments = async (req, res) => {
  try {
    const payments = await Payment.find()
      .populate("booking", "vehicleNumber vehicleType amount status")
      .populate("user", "name email")
      .sort({ createdAt: -1 });

    const totalTransactions = payments.length;

    const paidPayments = payments.filter(
      payment => payment.paymentStatus === "Paid"
    );

    const totalRevenue = paidPayments.reduce(
      (total, payment) => total + Number(payment.amount || 0),
      0
    );

    res.status(200).json({
      message: "All payments fetched successfully",
      report: {
        totalTransactions,
        paidTransactions: paidPayments.length,
        totalRevenue,
        payments
      }
    });
  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
};


// Get all registered users for admin
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find()
      .select("-password")
      .sort({ createdAt: -1 });

    res.status(200).json({
      message: "Users fetched successfully",
      totalUsers: users.length,
      users
    });
  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
};

// Update a user's role
export const updateUserRole = async (req, res) => {
  try {
    const { role } = req.body;
    const { id } = req.params;

    const allowedRoles = [
      "admin",
      "customer",
      "operator",
      "security"
    ];

    if (!allowedRoles.includes(role)) {
      return res.status(400).json({
        message: "Invalid user role"
      });
    }

    if (req.user.id === id) {
      return res.status(400).json({
        message: "You cannot change your own role"
      });
    }

    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({
        message: "User not found"
      });
    }

    user.role = role;
    await user.save();

    res.status(200).json({
      message: "User role updated successfully",
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
};

