
import express from "express";

import {
  addLocation,
  getLocations,
  updateLocation,
  deleteLocation,
  addZone,
  getZones,
  updateZone,
  deleteZone
} from "../controllers/locationController.js";

import { protect, authorizeRoles } from "../middleware/authMiddleware.js";

const router = express.Router();

// LOCATION ROUTES
router.post("/locations", protect, authorizeRoles("admin"), addLocation);
router.get("/locations", protect, authorizeRoles("admin"), getLocations);
router.put("/locations/:id", protect, authorizeRoles("admin"), updateLocation);
router.delete("/locations/:id", protect, authorizeRoles("admin"), deleteLocation);

// ZONE ROUTES
router.post("/zones", protect, authorizeRoles("admin"), addZone);
router.get("/zones", protect, authorizeRoles("admin"), getZones);
router.put("/zones/:id", protect, authorizeRoles("admin"), updateZone);
router.delete("/zones/:id", protect, authorizeRoles("admin"), deleteZone);

export default router;
