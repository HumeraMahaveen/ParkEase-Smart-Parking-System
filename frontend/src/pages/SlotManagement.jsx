
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import "./SlotManagement.css";

function SlotManagement() {
  const navigate = useNavigate();

  const [slots, setSlots] = useState([]);
  const [zones, setZones] = useState([]);
  const [slotNumber, setSlotNumber] = useState("");
  const [selectedZone, setSelectedZone] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const user = JSON.parse(localStorage.getItem("user") || "{}");

  const loadSlots = async () => {
    try {
      const response = await api.get("/parking");
      setSlots(response.data.slots || []);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to load slots.");
    }
  };

  const loadZones = async () => {
    try {
      const response = await api.get("/locations/zones");
      setZones(response.data.zones || []);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to load zones.");
    }
  };

  useEffect(() => {
    if (!localStorage.getItem("token")) {
      navigate("/");
      return;
    }

    if (user.role?.toLowerCase() !== "admin") {
      navigate("/dashboard");
      return;
    }

    loadSlots();
    loadZones();
  }, []);

  const handleAddSlot = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");
    setLoading(true);

    try {
      const response = await api.post("/parking", {
        slotNumber: slotNumber.trim().toUpperCase(),
        zone: selectedZone
      });

      setMessage(response.data.message || "Slot added successfully!");
      setSlotNumber("");
      setSelectedZone("");
      await loadSlots();
    } catch (err) {
      setError(err.response?.data?.message || "Unable to add slot.");
    } finally {
      setLoading(false);
    }
  };

  const handleRelease = async (id) => {
    setMessage("");
    setError("");

    try {
      const response = await api.put(`/parking/${id}/release`);
      setMessage(response.data.message || "Slot released successfully!");
      await loadSlots();
    } catch (err) {
      setError(err.response?.data?.message || "Unable to release slot.");
    }
  };

  return (
    <div className="slot-management-page">
      <header className="slot-page-header">
        <div>
          <p>PARKEASE / MANAGEMENT</p>
          <h1>Slot Management</h1>
          <span>Manage parking spaces, zones and availability.</span>
        </div>
        <button onClick={() => navigate("/dashboard")}>
          Back to Dashboard
        </button>
      </header>

      <section className="slot-add-card">
        <h2>Add New Parking Slot</h2>

        <form onSubmit={handleAddSlot}>
          <input
            type="text"
            placeholder="Enter slot number (Example: A4)"
            value={slotNumber}
            onChange={(e) => setSlotNumber(e.target.value)}
            required
          />

          <select
            value={selectedZone}
            onChange={(e) => setSelectedZone(e.target.value)}
            required
          >
            <option value="">Select Parking Zone</option>
            {zones.filter((zone) => zone.isActive).map((zone) => (
              <option key={zone._id} value={zone._id}>
                {zone.zoneName} ({zone.zoneCode})
                {zone.location?.locationName
                  ? ` - ${zone.location.locationName}`
                  : ""}
              </option>
            ))}
          </select>

          <button type="submit" disabled={loading || zones.length === 0}>
            {loading ? "Adding..." : "Add Slot"}
          </button>
        </form>

        {zones.length === 0 && (
          <p className="slot-error">
            No active zones found. Please create a zone first.
          </p>
        )}

        {message && <p className="slot-success">{message}</p>}
        {error && <p className="slot-error">{error}</p>}
      </section>

      <section className="slot-list-card">
        <div className="slot-list-heading">
          <div>
            <h2>Parking Slots</h2>
            <p>Total registered slots: {slots.length}</p>
          </div>
          <button onClick={() => {
            loadSlots();
            loadZones();
          }}>
            Refresh
          </button>
        </div>

        <div className="slot-table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Slot Number</th>
                <th>Parking Zone</th>
                <th>Status</th>
                <th>Vehicle Number</th>
                <th>Vehicle Type</th>
                <th>Action</th>
              </tr>
            </thead>

            <tbody>
              {slots.map((slot) => (
                <tr key={slot._id}>
                  <td><strong>{slot.slotNumber}</strong></td>
                  <td>
                    {slot.zone
                      ? `${slot.zone.zoneName} (${slot.zone.zoneCode})`
                      : "Unassigned"}
                  </td>
                  <td>
                    <span className={slot.isAvailable ? "slot-available" : "slot-occupied"}>
                      {slot.isAvailable ? "Available" : "Occupied"}
                    </span>
                  </td>
                  <td>{slot.vehicleNumber || "—"}</td>
                  <td>{slot.vehicleType || "—"}</td>
                  <td>
                    {!slot.isAvailable && (
                      <button
                        className="release-slot-button"
                        onClick={() => handleRelease(slot._id)}
                      >
                        Release
                      </button>
                    )}
                  </td>
                </tr>
              ))}

              {slots.length === 0 && (
                <tr>
                  <td colSpan="6">No parking slots found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

export default SlotManagement;
