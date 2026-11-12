
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import "./AdminReports.css";

function AdminReports() {
  const navigate = useNavigate();

  const [reports, setReports] = useState({
    occupancy: null,
    bookings: null,
    revenue: null,
    vehicles: null
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadReports = async () => {
    try {
      setLoading(true);
      setError("");

      const [occupancy, bookings, revenue, vehicles] = await Promise.all([
        api.get("/admin/reports/occupancy"),
        api.get("/admin/reports/bookings"),
        api.get("/admin/reports/revenue"),
        api.get("/admin/reports/vehicle-entry-exit")
      ]);

      setReports({
        occupancy: occupancy.data.report,
        bookings: bookings.data.report,
        revenue: revenue.data.report,
        vehicles: vehicles.data.report
      });
    } catch (err) {
      setError(
        err.response?.data?.message || "Unable to load reports."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReports();
  }, []);

  const formatDate = (date) => {
    if (!date) return "—";
    return new Date(date).toLocaleString("en-IN");
  };

  if (loading) {
    return <div className="admin-reports"><p>Loading reports...</p></div>;
  }

  if (error) {
    return (
      <div className="admin-reports">
        <p className="report-error">{error}</p>
        <button onClick={loadReports}>Try Again</button>
        <button onClick={() => navigate("/dashboard")}>Back to Dashboard</button>
      </div>
    );
  }

  return (
    <div className="admin-reports">
      <header className="reports-header">
        <div>
          <p>PARKEASE / ADMIN / ANALYTICS</p>
          <h1>Reports & Analytics</h1>
          <span>Monitor parking operations and business performance.</span>
        </div>
        <div className="reports-actions">
          <button onClick={loadReports}>Refresh Reports</button>
          <button onClick={() => navigate("/dashboard")}>Dashboard</button>
        </div>
      </header>

      <section className="report-section">
        <h2>1. Slot Occupancy Report</h2>
        <div className="report-summary">
          <div className="report-card">
            <p>Total Slots</p>
            <h3>{reports.occupancy?.totalSlots || 0}</h3>
          </div>
          <div className="report-card">
            <p>Available Slots</p>
            <h3>{reports.occupancy?.availableSlots || 0}</h3>
          </div>
          <div className="report-card">
            <p>Occupied Slots</p>
            <h3>{reports.occupancy?.occupiedSlots || 0}</h3>
          </div>
          <div className="report-card">
            <p>Occupancy</p>
            <h3>{reports.occupancy?.occupancyPercentage || 0}%</h3>
          </div>
        </div>

        <div className="report-table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Slot Number</th>
                <th>Status</th>
                <th>Vehicle Number</th>
                <th>Vehicle Type</th>
              </tr>
            </thead>
            <tbody>
              {reports.occupancy?.slots?.map((slot) => (
                <tr key={slot._id}>
                  <td>{slot.slotNumber}</td>
                  <td>{slot.isAvailable ? "Available" : "Occupied"}</td>
                  <td>{slot.vehicleNumber || "—"}</td>
                  <td>{slot.vehicleType || "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="report-section">
        <h2>2. Booking Report</h2>
        <div className="report-summary">
          <div className="report-card">
            <p>Total Bookings</p>
            <h3>{reports.bookings?.totalBookings || 0}</h3>
          </div>
          <div className="report-card">
            <p>Booked</p>
            <h3>{reports.bookings?.bookedBookings || 0}</h3>
          </div>
          <div className="report-card">
            <p>Active</p>
            <h3>{reports.bookings?.activeBookings || 0}</h3>
          </div>
          <div className="report-card">
            <p>Completed</p>
            <h3>{reports.bookings?.completedBookings || 0}</h3>
          </div>
          <div className="report-card">
            <p>Cancelled</p>
            <h3>{reports.bookings?.cancelledBookings || 0}</h3>
          </div>
        </div>

        <div className="report-table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Customer</th>
                <th>Slot</th>
                <th>Vehicle</th>
                <th>Booking Date</th>
                <th>Duration</th>
                <th>Amount</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {reports.bookings?.bookings?.map((booking) => (
                <tr key={booking._id}>
                  <td>{booking.user?.name || "—"}</td>
                  <td>{booking.parkingSlot?.slotNumber || "—"}</td>
                  <td>{booking.vehicleNumber}</td>
                  <td>{formatDate(booking.bookingDate || booking.createdAt)}</td>
                  <td>{booking.duration || 0} min</td>
                  <td>₹{booking.amount || 0}</td>
                  <td>{booking.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="report-section">
        <h2>3. Revenue Report</h2>
        <div className="report-summary">
          <div className="report-card">
            <p>Total Transactions</p>
            <h3>{reports.revenue?.totalPayments || 0}</h3>
          </div>
          <div className="report-card">
            <p>Paid Transactions</p>
            <h3>{reports.revenue?.paidPayments || 0}</h3>
          </div>
          <div className="report-card">
            <p>Pending Transactions</p>
            <h3>{reports.revenue?.pendingPayments || 0}</h3>
          </div>
          <div className="report-card">
            <p>Total Revenue</p>
            <h3>₹{reports.revenue?.totalRevenue || 0}</h3>
          </div>
        </div>

        <div className="report-table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Customer</th>
                <th>Vehicle</th>
                <th>Amount</th>
                <th>Method</th>
                <th>Date</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {reports.revenue?.payments?.map((payment) => (
                <tr key={payment._id}>
                  <td>{payment.user?.name || "—"}</td>
                  <td>{payment.booking?.vehicleNumber || "—"}</td>
                  <td>₹{payment.amount || 0}</td>
                  <td>{payment.paymentMethod}</td>
                  <td>{formatDate(payment.createdAt)}</td>
                  <td>{payment.paymentStatus}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="report-section">
        <h2>4. Vehicle Entry / Exit Report</h2>
        <div className="report-summary">
          <div className="report-card">
            <p>Total Vehicles</p>
            <h3>{reports.vehicles?.totalVehicles || 0}</h3>
          </div>
          <div className="report-card">
            <p>Vehicles Entered</p>
            <h3>{reports.vehicles?.vehiclesEntered || 0}</h3>
          </div>
          <div className="report-card">
            <p>Vehicles Exited</p>
            <h3>{reports.vehicles?.vehiclesExited || 0}</h3>
          </div>
          <div className="report-card">
            <p>Currently Parked</p>
            <h3>{reports.vehicles?.currentlyParked || 0}</h3>
          </div>
        </div>

        <div className="report-table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Customer</th>
                <th>Vehicle Number</th>
                <th>Slot</th>
                <th>Entry Time</th>
                <th>Exit Time</th>
                <th>Duration</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {reports.vehicles?.vehicles?.map((booking) => (
                <tr key={booking._id}>
                  <td>{booking.user?.name || "—"}</td>
                  <td>{booking.vehicleNumber}</td>
                  <td>{booking.parkingSlot?.slotNumber || "—"}</td>
                  <td>{formatDate(booking.entryTime)}</td>
                  <td>{formatDate(booking.exitTime)}</td>
                  <td>{booking.duration || 0} min</td>
                  <td>{booking.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

export default AdminReports;
