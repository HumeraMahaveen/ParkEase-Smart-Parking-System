
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import "./Dashboard.css";

function Dashboard() {
  const navigate = useNavigate();

  const [slots, setSlots] = useState([]);
  const [dashboardStats, setDashboardStats] = useState(null);
  const [statsError, setStatsError] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [vehicleNumber, setVehicleNumber] = useState("");
  const [vehicleType, setVehicleType] = useState("Car");
  const [bookingMessage, setBookingMessage] = useState("");
  const [bookingLoading, setBookingLoading] = useState(false);

  let user = {};

  try {
    user = JSON.parse(localStorage.getItem("user")) || {};
  } catch {
    user = {};
  }

  const isAdmin = user.role?.toLowerCase() === "admin";
  const isCustomer = user.role?.toLowerCase() === "customer";
  const isOperator = user.role?.toLowerCase() === "operator";
  const isSecurity = user.role?.toLowerCase() === "security";

  const loadSlots = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await api.get("/parking");
      setSlots(response.data.slots || []);
    } catch (err) {
      setError(
        err.response?.data?.message ||
        "Unable to load parking slots. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const loadDashboardStats = async () => {
    try {
      const response = await api.get("/admin/dashboard");
      setDashboardStats(response.data.statistics);
      setStatsError("");
    } catch (err) {
      setStatsError(
        err.response?.data?.message ||
        "Unable to load dashboard statistics."
      );
    }
  };

  useEffect(() => {
    if (!localStorage.getItem("token")) {
      navigate("/");
      return;
    }

    loadSlots();

    if (isAdmin) {
      loadDashboardStats();
    }
  }, []);

  const availableSlots = slots.filter((slot) => slot.isAvailable);
  const occupiedSlots = slots.filter((slot) => !slot.isAvailable);

  const handleBooking = async (e) => {
    e.preventDefault();
    setBookingMessage("");

    if (!selectedSlot) return;

    setBookingLoading(true);

    try {
      const response = await api.put(
        `/parking/${selectedSlot._id}/book`,
        {
          vehicleNumber,
          vehicleType
        }
      );

      setBookingMessage(
        response.data.message || "Parking slot booked successfully."
      );

      setSelectedSlot(null);
      setVehicleNumber("");
      await loadSlots();

      if (isAdmin) {
        await loadDashboardStats();
      }
    } catch (err) {
      setBookingMessage(
        err.response?.data?.message || "Unable to book this slot."
      );
    } finally {
      setBookingLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/");
  };

  return (
    <div className="dashboard-layout">
      <aside className="dashboard-sidebar">
        <div className="dashboard-brand">
          <span>P</span>
          ParkEase
        </div>

        <p className="sidebar-heading">MENU</p>

        <button
          className="sidebar-active"
          onClick={() => navigate("/dashboard")}
        >
          <span>▦</span> Dashboard
        </button>

        {isCustomer && (
          <>
            <p className="sidebar-heading">PARKING</p>

            <button
              className="sidebar-nav-link"
              onClick={() => navigate("/customer/booking")}
            >
              <span>▤</span> Book Parking
            </button>

            <button
              className="sidebar-nav-link"
              onClick={() => navigate("/customer/bookings")}
            >
              <span>▤</span> My Bookings
            </button>

            <button
              className="sidebar-nav-link"
              onClick={() => navigate("/customer/payments")}
            >
              <span>₹</span> Payments & Billing
            </button>
          </>
        )}

        {(isOperator || isSecurity) && (
          <>
            <p className="sidebar-heading">PARKING OPERATIONS</p>

            <button
              className="sidebar-nav-link"
              onClick={() => navigate("/admin/vehicles")}
            >
              <span>↔</span> Vehicle Entry / Exit
            </button>
          </>
        )}

        {isAdmin && (
          <>
            <p className="sidebar-heading">MANAGEMENT</p>

            <button
              className="sidebar-nav-link"
              onClick={() => navigate("/admin/locations")}
            >
              <span>⌖</span> Parking Locations
            </button>

            <button
              className="sidebar-nav-link"
              onClick={() => navigate("/admin/slots")}
            >
              <span>▦</span> Slot Management
            </button>

            <button
              className="sidebar-nav-link"
              onClick={() => navigate("/admin/bookings")}
            >
              <span>▤</span> Booking Management
            </button>

            <button
              className="sidebar-nav-link"
              onClick={() => navigate("/admin/vehicles")}
            >
              <span>↔</span> Vehicle Entry / Exit
            </button>

            <button
              className="sidebar-nav-link"
              onClick={() => navigate("/admin/payments")}
            >
              <span>₹</span> Payments & Billing
            </button>

            <button
              className="sidebar-nav-link"
              onClick={() => navigate("/admin/reports")}
            >
              <span>▥</span> Reports & Analytics
            </button>

            <button
              className="sidebar-nav-link"
              onClick={() => navigate("/admin/users")}
            >
              <span>♙</span> User Management
            </button>
          </>
        )}

        <p className="sidebar-heading account-heading">ACCOUNT</p>

        <button className="sidebar-logout" onClick={handleLogout}>
          <span>↪</span> Logout
        </button>

        <div className="sidebar-footer">
          Your space. Your time. Your way.
        </div>
      </aside>

      <main className="dashboard-main">
        <header className="dashboard-header">
          <div>
            <p className="dashboard-breadcrumb">PARKEASE / DASHBOARD</p>
            <h1>Dashboard</h1>
          </div>

          <div className="dashboard-user">
            <div className="user-avatar">
              {(user.name || user.email || "U").charAt(0).toUpperCase()}
            </div>
            <div>
              <strong>{user.name || "User"}</strong>
              <span>{user.role || "User"}</span>
            </div>
          </div>
        </header>

        <section className="dashboard-welcome">
          <div>
            <p>WELCOME TO PARKEASE</p>
            <h2>Hello, {user.name || "there"}!</h2>
            <span>
              {isAdmin
                ? "Manage your parking operations from one place."
                : isOperator
                ? "Monitor parking availability and manage vehicle entry and exit."
                : isSecurity
                ? "Manage vehicle entry and exit at the parking facility."
                : "Find an available parking space for your next journey."}
            </span>
          </div>
          <div className="welcome-symbol">P</div>
        </section>

        {isAdmin && (
          <>
            <section className="dashboard-stats">
              <div className="stat-card">
                <div className="stat-icon total-icon">▦</div>
                <p>Total Slots</p>
                <h2>{dashboardStats?.totalSlots ?? "—"}</h2>
              </div>

              <div className="stat-card">
                <div className="stat-icon available-icon">✓</div>
                <p>Available Slots</p>
                <h2>{dashboardStats?.availableSlots ?? "—"}</h2>
              </div>

              <div className="stat-card">
                <div className="stat-icon occupied-icon">P</div>
                <p>Occupied Slots</p>
                <h2>{dashboardStats?.occupiedSlots ?? "—"}</h2>
              </div>

              <div className="stat-card">
                <div className="stat-icon total-icon">▤</div>
                <p>Total Bookings</p>
                <h2>{dashboardStats?.totalBookings ?? "—"}</h2>
              </div>

              <div className="stat-card">
                <div className="stat-icon available-icon">✓</div>
                <p>Completed Bookings</p>
                <h2>{dashboardStats?.completedBookings ?? "—"}</h2>
              </div>

              <div className="stat-card">
                <div className="stat-icon occupied-icon">₹</div>
                <p>Total Revenue</p>
                <h2>₹{dashboardStats?.totalRevenue ?? "—"}</h2>
              </div>
            </section>

            {statsError && (
              <p className="dashboard-error">{statsError}</p>
            )}
          </>
        )}

        {!isAdmin && (
          <section className="dashboard-stats">
            <div className="stat-card">
              <div className="stat-icon total-icon">▦</div>
              <p>Total Slots</p>
              <h2>{loading ? "—" : slots.length}</h2>
            </div>

            <div className="stat-card">
              <div className="stat-icon available-icon">✓</div>
              <p>Available Slots</p>
              <h2>{loading ? "—" : availableSlots.length}</h2>
            </div>

            <div className="stat-card">
              <div className="stat-icon occupied-icon">P</div>
              <p>Occupied Slots</p>
              <h2>{loading ? "—" : occupiedSlots.length}</h2>
            </div>
          </section>
        )}

        <section className="slots-section">
          <div className="slots-heading">
            <div>
              <h2>Parking Availability</h2>
              <p>
                {isOperator || isSecurity
                  ? "Monitor available and occupied parking spaces."
                  : "View available spaces and manage parking reservations."}
              </p>
            </div>

            <button
              className="refresh-button"
              onClick={() => {
                loadSlots();
                if (isAdmin) loadDashboardStats();
              }}
            >
              ↻ Refresh
            </button>
          </div>

          {bookingMessage && (
            <p className="dashboard-notice">{bookingMessage}</p>
          )}

          {error && <p className="dashboard-error">{error}</p>}

          {loading ? (
            <p className="empty-message">Loading parking slots...</p>
          ) : slots.length === 0 ? (
            <p className="empty-message">
              No parking slots have been added yet.
            </p>
          ) : (
            <div className="slots-table-wrapper">
              <table className="slots-table">
                <thead>
                  <tr>
                    <th>Slot Number</th>
                    <th>Status</th>
                    <th>Vehicle</th>
                    <th>Action</th>
                  </tr>
                </thead>

                <tbody>
                  {slots.map((slot) => (
                    <tr key={slot._id}>
                      <td><strong>{slot.slotNumber}</strong></td>
                      <td>
                        <span
                          className={
                            slot.isAvailable
                              ? "slot-status available"
                              : "slot-status occupied"
                          }
                        >
                          {slot.isAvailable ? "Available" : "Occupied"}
                        </span>
                      </td>
                      <td>{slot.vehicleType || "—"}</td>
                      <td>
                        {isOperator || isSecurity ? (
                          <button
                            className="reserve-button"
                            onClick={() => navigate("/admin/vehicles")}
                          >
                            Entry / Exit
                          </button>
                        ) : slot.isAvailable ? (
                          <button
                            className="reserve-button"
                            onClick={() => {
                              setSelectedSlot(slot);
                              setBookingMessage("");
                            }}
                          >
                            Reserve
                          </button>
                        ) : (
                          <span className="unavailable-text">
                            Unavailable
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {selectedSlot && (
          <div className="booking-overlay">
            <form className="booking-modal" onSubmit={handleBooking}>
              <button
                type="button"
                className="modal-close"
                onClick={() => setSelectedSlot(null)}
              >
                ×
              </button>

              <p className="modal-label">NEW RESERVATION</p>
              <h2>Reserve {selectedSlot.slotNumber}</h2>
              <p>Enter your vehicle details to reserve this space.</p>

              <label>Vehicle Number</label>
              <input
                type="text"
                placeholder="Example: TS09AB1234"
                value={vehicleNumber}
                onChange={(e) =>
                  setVehicleNumber(e.target.value.toUpperCase())
                }
                required
              />

              <label>Vehicle Type</label>
              <select
                value={vehicleType}
                onChange={(e) => setVehicleType(e.target.value)}
              >
                <option value="Car">Car</option>
                <option value="Bike">Bike</option>
                <option value="Other">Other</option>
              </select>

              <button
                type="submit"
                className="confirm-booking"
                disabled={bookingLoading}
              >
                {bookingLoading ? "Reserving..." : "Confirm Reservation"}
              </button>
            </form>
          </div>
        )}
      </main>
    </div>
  );
}

export default Dashboard;
