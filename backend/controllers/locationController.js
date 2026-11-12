
import ParkingLocation from "../models/ParkingLocation.js";
import Zone from "../models/Zone.js";

// ADD PARKING LOCATION
export const addLocation = async (req, res) => {
  try {
    const { locationName, address, city, description } = req.body;

    if (!locationName || !address || !city) {
      return res.status(400).json({
        message: "Location name, address and city are required"
      });
    }

    const location = await ParkingLocation.create({
      locationName,
      address,
      city,
      description
    });

    res.status(201).json({
      message: "Parking location added successfully",
      location
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET ALL PARKING LOCATIONS
export const getLocations = async (req, res) => {
  try {
    const locations = await ParkingLocation.find().sort({
      createdAt: -1
    });

    res.status(200).json({
      message: "Parking locations fetched successfully",
      locations
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// UPDATE PARKING LOCATION
export const updateLocation = async (req, res) => {
  try {
    const location = await ParkingLocation.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!location) {
      return res.status(404).json({
        message: "Parking location not found"
      });
    }

    res.status(200).json({
      message: "Parking location updated successfully",
      location
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// DELETE PARKING LOCATION AND ITS ZONES
export const deleteLocation = async (req, res) => {
  try {
    const location = await ParkingLocation.findById(req.params.id);

    if (!location) {
      return res.status(404).json({
        message: "Parking location not found"
      });
    }

    await Zone.deleteMany({ location: location._id });
    await location.deleteOne();

    res.status(200).json({
      message: "Parking location and its zones deleted successfully"
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ADD ZONE
export const addZone = async (req, res) => {
  try {
    const { zoneName, zoneCode, location, description } = req.body;

    if (!zoneName || !zoneCode || !location) {
      return res.status(400).json({
        message: "Zone name, zone code and location are required"
      });
    }

    const existingLocation = await ParkingLocation.findById(location);

    if (!existingLocation) {
      return res.status(404).json({
        message: "Parking location not found"
      });
    }

    const zone = await Zone.create({
      zoneName,
      zoneCode,
      location,
      description
    });

    res.status(201).json({
      message: "Zone added successfully",
      zone
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        message: "This zone code already exists in this location"
      });
    }

    res.status(500).json({ message: error.message });
  }
};

// GET ALL ZONES
export const getZones = async (req, res) => {
  try {
    const zones = await Zone.find()
      .populate("location", "locationName city")
      .sort({ createdAt: -1 });

    res.status(200).json({
      message: "Zones fetched successfully",
      zones
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// UPDATE ZONE
export const updateZone = async (req, res) => {
  try {
    const zone = await Zone.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!zone) {
      return res.status(404).json({
        message: "Zone not found"
      });
    }

    res.status(200).json({
      message: "Zone updated successfully",
      zone
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        message: "This zone code already exists in this location"
      });
    }

    res.status(500).json({ message: error.message });
  }
};

// DELETE ZONE
export const deleteZone = async (req, res) => {
  try {
    const zone = await Zone.findByIdAndDelete(req.params.id);

    if (!zone) {
      return res.status(404).json({
        message: "Zone not found"
      });
    }

    res.status(200).json({
      message: "Zone deleted successfully"
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
