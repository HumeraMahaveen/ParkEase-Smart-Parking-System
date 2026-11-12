
import ParkingSlot from "../models/ParkingSlot.js";
import Booking from "../models/Booking.js";
import Zone from "../models/Zone.js";

// Add a new parking slot
export const addParkingSlot = async (req, res) => {
  try {
    const { slotNumber, zone } = req.body;

    if (!slotNumber) {
      return res.status(400).json({
        message: "Slot number is required"
      });
    }

    const existingSlot = await ParkingSlot.findOne({ slotNumber });

    if (existingSlot) {
      return res.status(400).json({
        message: "Parking slot already exists"
      });
    }

    if (zone) {
      const existingZone = await Zone.findById(zone);

      if (!existingZone) {
        return res.status(404).json({
          message: "Selected zone not found"
        });
      }

      if (!existingZone.isActive) {
        return res.status(400).json({
          message: "Selected zone is inactive"
        });
      }
    }

    const newSlot = await ParkingSlot.create({
      slotNumber,
      zone: zone || null
    });

    res.status(201).json({
      message: "Parking slot added successfully",
      slot: newSlot
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// Get all parking slots with their current booking status
export const getParkingSlots = async (req, res) => {
  try {
    const slots = await ParkingSlot.find()
      .populate("zone", "zoneName zoneCode");

    const slotIds = slots.map(slot => slot._id);

    const bookings = await Booking.find({
      parkingSlot: { $in: slotIds },
      status: { $in: ["Booked", "Active"] }
    }).sort({ createdAt: -1 });

    const bookingStatusMap = new Map();

    bookings.forEach(booking => {
      const slotId = booking.parkingSlot.toString();

      if (!bookingStatusMap.has(slotId)) {
        bookingStatusMap.set(slotId, booking.status);
      }
    });

    const updatedSlots = slots.map(slot => ({
      ...slot.toObject(),
      bookingStatus: bookingStatusMap.get(slot._id.toString()) || null
    }));

    res.status(200).json({
      message: "Parking slots fetched successfully",
      slots: updatedSlots
    });
  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
};


// Book a parking slot and create a booking record
export const bookParkingSlot = async (req, res) => {
  try {
    const { vehicleNumber, vehicleType } = req.body;

    if (!vehicleNumber || !vehicleType) {
      return res.status(400).json({
        message: "Vehicle number and vehicle type are required"
      });
    }

    if (!req.user?.id) {
      return res.status(401).json({
        message: "Please log in to book a parking slot"
      });
    }

    const slot = await ParkingSlot.findById(req.params.id);

    if (!slot) {
      return res.status(404).json({
        message: "Parking slot not found"
      });
    }

    if (!slot.isAvailable) {
      return res.status(400).json({
        message: "Parking slot is already occupied"
      });
    }

    slot.isAvailable = false;
    slot.vehicleNumber = vehicleNumber;
    slot.vehicleType = vehicleType;

    await slot.save();

    let booking;

    try {
      booking = await Booking.create({
        user: req.user.id,
        parkingSlot: slot._id,
        vehicleNumber,
        vehicleType,
        status: "Booked"
      });
    } catch (error) {
      slot.isAvailable = true;
      slot.vehicleNumber = null;
      slot.vehicleType = null;
      await slot.save();

      throw error;
    }

    res.status(201).json({
      message: "Parking slot booked successfully",
      slot,
      booking
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Release a parking slot
export const releaseParkingSlot = async (req, res) => {
  try {
    const slot = await ParkingSlot.findById(req.params.id);

    if (!slot) {
      return res.status(404).json({
        message: "Parking slot not found"
      });
    }

    if (slot.isAvailable) {
      return res.status(400).json({
        message: "Parking slot is already available"
      });
    }

    slot.isAvailable = true;
    slot.vehicleNumber = null;
    slot.vehicleType = null;

    await slot.save();

    res.status(200).json({
      message: "Parking slot released successfully",
      slot
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get bookings of the logged-in customer
export const getMyBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({
      user: req.user.id
    })
      .populate("parkingSlot", "slotNumber")
      .sort({ createdAt: -1 });

    res.status(200).json({
      message: "Bookings fetched successfully",
      bookings
    });
  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
};

// Record vehicle entry
export const recordVehicleEntry = async (req, res) => {
  try {
    const { id } = req.params;

    const booking = await Booking.findOne({
      parkingSlot: id,
      status: "Booked"
    });

    if (!booking) {
      return res.status(404).json({
        message: "No active booking found for this parking slot"
      });
    }

    booking.entryTime = new Date();
    booking.status = "Active";

    await booking.save();

    res.status(200).json({
      message: "Vehicle entry recorded successfully",
      booking
    });
  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
};

// Record vehicle exit and calculate parking charges
export const recordVehicleExit = async (req, res) => {
  try {
    const { id } = req.params;

    const booking = await Booking.findOne({
      parkingSlot: id,
      status: "Active"
    });

    if (!booking) {
      return res.status(404).json({
        message: "No active vehicle found in this parking slot"
      });
    }

    const exitTime = new Date();
    booking.exitTime = exitTime;

    const durationMs = exitTime - booking.entryTime;
    const durationMinutes = Math.ceil(durationMs / 60000);

    booking.duration = durationMinutes;

    const rates = {
      Bike: { firstHour: 10, additionalHour: 10 },
      Car: { firstHour: 30, additionalHour: 20 },
      SUV: { firstHour: 40, additionalHour: 30 }
    };

    const vehicleRate = rates[booking.vehicleType];

    if (!vehicleRate) {
      return res.status(400).json({
        message: "Invalid vehicle type"
      });
    }

    const chargeableMinutes = Math.max(0, durationMinutes - 10);
    const billableHours = Math.ceil(chargeableMinutes / 60);

    if (billableHours === 0) {
      booking.amount = 0;
    } else {
      booking.amount =
        vehicleRate.firstHour +
        (billableHours - 1) * vehicleRate.additionalHour;
    }

    booking.status = "Completed";
    await booking.save();

    const slot = await ParkingSlot.findById(id);

    if (slot) {
      slot.isAvailable = true;
      slot.vehicleNumber = null;
      slot.vehicleType = null;
      await slot.save();
    }

    res.status(200).json({
      message: "Vehicle exit recorded successfully",
      booking
    });
  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
};
