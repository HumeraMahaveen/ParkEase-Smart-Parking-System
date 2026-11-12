
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import "./CustomerBooking.css";

function CustomerBooking() {
  const navigate = useNavigate();

  const [slots, setSlots] = useState([]);
  const [vehicleNumber, setVehicleNumber] = useState("");
  const [vehicleType, setVehicleType] = useState("Car");
  const [selectedSlot, setSelectedSlot] = useState("");
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const role = user.role?.toLowerCase();

  const loadSlots = async () => {
    try {
      setLoading(true);
      const response = await api.get("/parking");
      setSlots(response.data.slots || []);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to load parking slots.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!["customer", "admin"].includes(role)) {
      navigate("/dashboard");
      return;
    }
    loadSlots();
  }, []);

  const handleBooking = async (event) => {
    event.preventDefault();
    setMessage("");
    setError("");

    if (!selectedSlot || !vehicleNumber.trim()) {
      setError("Please select a slot and enter your vehicle number.");
      return;
    }

    try {
      const response = await api.put(
        `/parking/${selectedSlot}/book`,
        {
          vehicleNumber: vehicleNumber.trim().toUpperCase(),
          vehicleType
        }
      );

      setMessage(response.data.message || "Parking slot booked successfully!");
      setVehicleNumber("");
      setSelectedSlot("");
      loadSlots();
    } catch (err) {
      setError(err.response?.data?.message || "Booking failed. Please try again.");
    }
  };

  const availableSlots = slots.filter((slot) => slot.isAvailable);

  return (
    <div className="customer-booking-page">
      <header className="customer-booking-header">
        <div>
          <p>PARKEASE / CUSTOMER</p>
          <h1>Book Your Parking Slot</h1>
          <span>Find an available slot and reserve your parking space.</span>
        </div>
        <button onClick={() => navigate("/dashboard")}>
          Back to Dashboard
        </button>
      </header>

      {message && <p className="customer-booking-success">{message}</p>}
      {error && <p className="customer-booking-error">{error}</p>}

      <section className="customer-slot-section">
        <div className="customer-slot-heading">
          <div>
            <h2>Available Parking Slots</h2>
            <p>Select an available slot for your vehicle.</p>
          </div>
          <button onClick={loadSlots}>Refresh</button>
        </div>

        {loading ? (
          <p>Loading available slots...</p>
        ) : availableSlots.length === 0 ? (
          <p>No parking slots are currently available.</p>
        ) : (
          <div className="customer-slot-grid">
            {availableSlots.map((slot) => (
              <button
                type="button"
                key={slot._id}
                className={`customer-slot-card ${selectedSlot === slot._id ? "selected" : ""}`}
                onClick={() => setSelectedSlot(slot._id)}
              >
                <strong>{slot.slotNumber}</strong>
                <span>Available</span>
              </button>
            ))}
          </div>
        )}
      </section>

      <section className="customer-booking-form-card">
        <h2>Vehicle Details</h2>
        <p>Enter your vehicle information to confirm your reservation.</p>

        <form onSubmit={handleBooking}>
          <label htmlFor="vehicleNumber">Vehicle Number</label>
          <input
            id="vehicleNumber"
            type="text"
            placeholder="Example: TS09AB1234"
            value={vehicleNumber}
            onChange={(event) => setVehicleNumber(event.target.value)}
            required
          />

          <label htmlFor="vehicleType">Vehicle Type</label>
          <select
            id="vehicleType"
            value={vehicleType}
            onChange={(event) => setVehicleType(event.target.value)}
          >
            <option value="Bike">Bike</option>
            <option value="Car">Car</option>
            <option value="SUV">SUV</option>
          </select>

          <p className="selected-slot-text">
            Selected Slot: {slots.find((slot) => slot._id === selectedSlot)?.slotNumber || "None"}
          </p>

          <button
            type="submit"
            disabled={!selectedSlot || loading}
          >
            Confirm Booking
          </button>
        </form>
      </section>
    </div>
  );
}

export default CustomerBooking;
