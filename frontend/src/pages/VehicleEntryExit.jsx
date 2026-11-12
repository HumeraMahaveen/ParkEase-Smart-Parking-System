
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import "./VehicleEntryExit.css";

function VehicleEntryExit() {
  const navigate = useNavigate();
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const role = user.role?.toLowerCase();

  const loadSlots = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await api.get("/parking");
      setSlots(response.data.slots || []);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to load parking slots.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!["admin", "operator", "security"].includes(role)) {
      navigate("/dashboard");
      return;
    }
    loadSlots();
  }, []);

  const recordEntry = async (slotId) => {
    try {
      setMessage("");
      setError("");
      const response = await api.put(`/parking/${slotId}/entry`);
      setMessage(response.data.message || "Vehicle entry recorded successfully.");
      await loadSlots();
    } catch (err) {
      setError(err.response?.data?.message || "Unable to record vehicle entry.");
    }
  };

  const recordExit = async (slotId) => {
    try {
      setMessage("");
      setError("");
      const response = await api.put(`/parking/${slotId}/exit`);
      setMessage(response.data.message || "Vehicle exit recorded successfully.");
      await loadSlots();
    } catch (err) {
      setError(err.response?.data?.message || "Unable to record vehicle exit.");
    }
  };

  return (
    <div className="vehicle-entry-page">
      <header className="vehicle-page-header">
        <div>
          <p>PARKEASE / OPERATIONS</p>
          <h1>Vehicle Entry & Exit</h1>
          <span>Monitor vehicle movements and parking activity.</span>
        </div>
        <button onClick={() => navigate("/dashboard")}>
          Back to Dashboard
        </button>
      </header>

      {message && <p className="vehicle-success">{message}</p>}
      {error && <p className="vehicle-error">{error}</p>}

      <section className="vehicle-list-card">
        <div className="vehicle-list-heading">
          <div>
            <h2>Parking Slot Records</h2>
            <p>Record entry and exit for parked vehicles.</p>
          </div>
          <button onClick={loadSlots}>Refresh</button>
        </div>

        {loading ? (
          <p>Loading parking records...</p>
        ) : slots.length === 0 ? (
          <p>No parking slots found.</p>
        ) : (
          <div className="vehicle-table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Slot Number</th>
                  <th>Vehicle Number</th>
                  <th>Vehicle Type</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>

              <tbody>
                {slots.map((slot) => (
                  <tr key={slot._id}>
                    <td>{slot.slotNumber}</td>
                    <td>{slot.vehicleNumber || "—"}</td>
                    <td>{slot.vehicleType || "—"}</td>
                    <td>
                      <span className={slot.isAvailable ? "vehicle-available" : "vehicle-occupied"}>
                        {slot.isAvailable ? "Available" : "Occupied"}
                      </span>
                    </td>
                    <td>
                      {slot.isAvailable ? (
                        <span>Waiting for vehicle</span>
                      ) : slot.bookingStatus === "Booked" ? (
                        <div className="vehicle-actions">
                          <button onClick={() => recordEntry(slot._id)}>
                            Record Entry
                          </button>
                        </div>
                      ) : slot.bookingStatus === "Active" ? (
                        <div className="vehicle-actions">
                          <button
                            className="vehicle-exit-button"
                            onClick={() => recordExit(slot._id)}
                          >
                            Record Exit
                          </button>
                        </div>
                      ) : (
                        <span>Processing</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}

export default VehicleEntryExit;
