
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import "./BookingManagement.css";

function BookingManagement() {
  const navigate = useNavigate();

  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const user = JSON.parse(localStorage.getItem("user") || "{}");

  const loadBookings = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await api.get("/admin/reports/bookings");
      const report = response.data.report;

      setBookings(report?.bookings || []);
    } catch (err) {
      setError(
        err.response?.data?.message || "Unable to load bookings."
      );
    } finally {
      setLoading(false);
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

    loadBookings();
  }, []);

  const totalBookings = bookings.length;
  const booked = bookings.filter(b => b.status === "Booked").length;
  const active = bookings.filter(b => b.status === "Active").length;
  const completed = bookings.filter(b => b.status === "Completed").length;
  const cancelled = bookings.filter(b => b.status === "Cancelled").length;

  const formatDate = (date) => {
    if (!date) return "—";
    return new Date(date).toLocaleString("en-IN");
  };

  return (
    <div className="booking-management-page">
      <header className="booking-page-header">
        <div>
          <p>PARKEASE / MANAGEMENT</p>
          <h1>Booking Management</h1>
          <span>View and monitor all parking reservations.</span>
        </div>

        <button onClick={() => navigate("/dashboard")}>
          Back to Dashboard
        </button>
      </header>

      <section className="booking-summary">
        <div className="booking-summary-card">
          <p>Total Bookings</p>
          <h2>{loading ? "—" : totalBookings}</h2>
        </div>

        <div className="booking-summary-card">
          <p>Booked</p>
          <h2>{loading ? "—" : booked}</h2>
        </div>

        <div className="booking-summary-card">
          <p>Active</p>
          <h2>{loading ? "—" : active}</h2>
        </div>

        <div className="booking-summary-card">
          <p>Completed</p>
          <h2>{loading ? "—" : completed}</h2>
        </div>

        <div className="booking-summary-card">
          <p>Cancelled</p>
          <h2>{loading ? "—" : cancelled}</h2>
        </div>
      </section>

      <section className="booking-table-card">
        <div className="booking-table-heading">
          <div>
            <h2>All Parking Bookings</h2>
            <p>Customer reservations and parking records.</p>
          </div>

          <button onClick={loadBookings}>↻ Refresh</button>
        </div>

        {error && <p className="booking-error">{error}</p>}

        {loading ? (
          <p className="booking-empty">Loading bookings...</p>
        ) : bookings.length === 0 ? (
          <p className="booking-empty">No bookings found.</p>
        ) : (
          <div className="booking-table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Customer</th>
                  <th>Slot</th>
                  <th>Vehicle Number</th>
                  <th>Vehicle Type</th>
                  <th>Booking Date</th>
                  <th>Duration</th>
                  <th>Amount</th>
                  <th>Status</th>
                </tr>
              </thead>

              <tbody>
                {bookings.map((booking) => (
                  <tr key={booking._id}>
                    <td>
                      {booking.user?.name || booking.user?.email || "—"}
                    </td>
                    <td>
                      {booking.parkingSlot?.slotNumber || "—"}
                    </td>
                    <td>{booking.vehicleNumber || "—"}</td>
                    <td>{booking.vehicleType || "—"}</td>
                    <td>{formatDate(booking.bookingDate || booking.createdAt)}</td>
                    <td>{booking.duration || 0} min</td>
                    <td>₹{booking.amount ?? 0}</td>
                    <td>
                      <span className={`booking-status ${booking.status?.toLowerCase()}`}>
                        {booking.status}
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

export default BookingManagement;
