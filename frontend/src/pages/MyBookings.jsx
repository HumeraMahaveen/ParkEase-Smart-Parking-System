
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import "./MyBookings.css";

function MyBookings() {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadBookings = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/parking/my-bookings");
      setBookings(response.data.bookings || []);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to load your bookings.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBookings();
  }, []);

  const formatDate = (date) => {
    if (!date) return "—";
    return new Date(date).toLocaleString("en-IN");
  };

  return (
    <div className="my-bookings-page">
      <header className="my-bookings-header">
        <div>
          <p>PARKEASE / CUSTOMER</p>
          <h1>My Bookings</h1>
          <span>View and track all your parking reservations.</span>
        </div>

        <button onClick={() => navigate("/dashboard")}>
          Back to Dashboard
        </button>
      </header>

      <section className="my-bookings-card">
        <div className="my-bookings-heading">
          <div>
            <h2>Booking History</h2>
            <p>Your parking reservation details.</p>
          </div>

          <button onClick={loadBookings}>Refresh</button>
        </div>

        {loading ? (
          <p>Loading your bookings...</p>
        ) : error ? (
          <p className="my-bookings-error">{error}</p>
        ) : bookings.length === 0 ? (
          <p>No bookings found. Book a parking slot to get started.</p>
        ) : (
          <div className="my-bookings-table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Slot</th>
                  <th>Vehicle Number</th>
                  <th>Vehicle Type</th>
                  <th>Booking Date</th>
                  <th>Entry Time</th>
                  <th>Exit Time</th>
                  <th>Duration</th>
                  <th>Amount</th>
                  <th>Status</th>
                </tr>
              </thead>

              <tbody>
                {bookings.map((booking) => (
                  <tr key={booking._id}>
                    <td>{booking.parkingSlot?.slotNumber || "—"}</td>
                    <td>{booking.vehicleNumber || "—"}</td>
                    <td>{booking.vehicleType || "—"}</td>
                    <td>{formatDate(booking.bookingDate || booking.createdAt)}</td>
                    <td>{formatDate(booking.entryTime)}</td>
                    <td>{formatDate(booking.exitTime)}</td>
                    <td>{booking.duration ?? 0} min</td>
                    <td>₹{booking.amount ?? 0}</td>
                    <td>
                      <span className={`booking-status ${booking.status?.toLowerCase()}`}>
                        {booking.status || "Unknown"}
                      </span>
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

export default MyBookings;
