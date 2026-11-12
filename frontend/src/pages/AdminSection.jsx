
import { useNavigate, useLocation } from "react-router-dom";
import "./AdminSection.css";

function AdminSection() {
  const navigate = useNavigate();
  const location = useLocation();

  const titles = {
    "/admin/locations": "Parking Locations",
    "/admin/slots": "Slot Management",
    "/admin/bookings": "Booking Management",
    "/admin/vehicles": "Vehicle Entry / Exit",
    "/admin/payments": "Payments & Billing",
    "/admin/reports": "Reports & Analytics",
    "/admin/users": "User Management"
  };

  const title = titles[location.pathname] || "Admin";

  const user = JSON.parse(localStorage.getItem("user") || "{}");

  if (user.role?.toLowerCase() !== "admin") {
    return (
      <div className="admin-section">
        <h2>Access Denied</h2>
        <button onClick={() => navigate("/dashboard")}>
          Back to Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="admin-section">
      <h1>{title}</h1>
      <p>Manage your ParkEase {title.toLowerCase()} here.</p>

      <button onClick={() => navigate("/dashboard")}>
        Back to Dashboard
      </button>
    </div>
  );
}

export default AdminSection;
