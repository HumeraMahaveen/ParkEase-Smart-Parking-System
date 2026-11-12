
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import AdminSection from "./pages/AdminSection";
import SlotManagement from "./pages/SlotManagement";
import BookingManagement from "./pages/BookingManagement";
import VehicleEntryExit from "./pages/VehicleEntryExit";
import CustomerBooking from "./pages/CustomerBooking";
import MyBookings from "./pages/MyBookings";
import PaymentsBilling from "./pages/PaymentsBilling";
import AdminPayments from "./pages/AdminPayments";
import AdminReports from "./pages/AdminReports";
import AdminLocations from "./pages/AdminLocations";
import AdminUsers from "./pages/AdminUsers";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={<Dashboard />} />

        <Route path="/admin/locations" element={<AdminLocations />} />
        <Route path="/admin/slots" element={<SlotManagement />} />
        <Route path="/admin/bookings" element={<BookingManagement />} />
        <Route path="/admin/vehicles" element={<VehicleEntryExit />} />
        <Route path="/admin/payments" element={<AdminPayments />} />
        <Route path="/admin/reports" element={<AdminReports />} />
        <Route path="/admin/users" element={<AdminUsers />} />

        <Route path="/customer/booking" element={<CustomerBooking />} />
        <Route path="/customer/payments" element={<PaymentsBilling />} />
        <Route path="/customer/bookings" element={<MyBookings />} />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
