
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";
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

      const [occupancy, bookings, revenue, vehicles] =
        await Promise.all([
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

  const safeFileDate = () =>
    new Date().toISOString().slice(0, 10);

  // Generate PDF report with summaries, analysis and detailed tables
  const downloadPDF = () => {
    const doc = new jsPDF();
    const occupancy = reports.occupancy || {};
    const bookings = reports.bookings || {};
    const revenue = reports.revenue || {};
    const vehicles = reports.vehicles || {};

    const totalSlots = Number(occupancy.totalSlots || 0);
    const occupiedSlots = Number(occupancy.occupiedSlots || 0);
    const availableSlots = Number(occupancy.availableSlots || 0);
    const occupancyRate = totalSlots
      ? ((occupiedSlots / totalSlots) * 100).toFixed(2)
      : 0;

    doc.setFontSize(20);
    doc.text("PARKEASE", 14, 20);

    doc.setFontSize(15);
    doc.text("Parking Management - Reports & Analytics", 14, 30);

    doc.setFontSize(10);
    doc.text(`Generated: ${new Date().toLocaleString("en-IN")}`, 14, 38);
    doc.text("Student Project Report - ParkEase", 14, 44);

    let y = 55;

    const addSection = (title, head, body) => {
      if (y > 250) {
        doc.addPage();
        y = 20;
      }

      doc.setFontSize(13);
      doc.text(title, 14, y);
      y += 5;

      autoTable(doc, {
        startY: y,
        head: [head],
        body,
        theme: "grid",
        styles: { fontSize: 8, cellPadding: 2 },
        headStyles: { fillColor: [40, 70, 110] },
        margin: { left: 14, right: 14 }
      });

      y = doc.lastAutoTable.finalY + 12;
    };

    addSection(
      "1. Slot Occupancy Summary",
      ["Metric", "Value"],
      [
        ["Total Slots", totalSlots],
        ["Available Slots", availableSlots],
        ["Occupied Slots", occupiedSlots],
        ["Occupancy Percentage", `${occupancyRate}%`]
      ]
    );

    doc.setFontSize(10);
    doc.text(
      `Analysis: ${occupiedSlots} out of ${totalSlots} slots are occupied. ` +
      `${availableSlots} slots are available. Occupancy is ${occupancyRate}%.`,
      14,
      y
    );
    y += 12;

    addSection(
      "2. Booking Summary",
      ["Metric", "Value"],
      [
        ["Total Bookings", bookings.totalBookings || 0],
        ["Booked", bookings.bookedBookings || 0],
        ["Active", bookings.activeBookings || 0],
        ["Completed", bookings.completedBookings || 0],
        ["Cancelled", bookings.cancelledBookings || 0]
      ]
    );

    doc.setFontSize(10);
    doc.text(
      `Analysis: The system has recorded ${bookings.totalBookings || 0} bookings, ` +
      `including ${bookings.completedBookings || 0} completed bookings.`,
      14,
      y
    );
    y += 12;

    addSection(
      "3. Revenue Summary",
      ["Metric", "Value"],
      [
        ["Total Transactions", revenue.totalPayments || 0],
        ["Paid Transactions", revenue.paidPayments || 0],
        ["Pending Transactions", revenue.pendingPayments || 0],
        ["Total Recorded Revenue", `Rs. ${revenue.totalRevenue || 0}`]
      ]
    );

    doc.setFontSize(10);
    doc.text(
      `Analysis: Recorded revenue is Rs. ${revenue.totalRevenue || 0}. ` +
      `There are ${revenue.paidPayments || 0} paid transactions.`,
      14,
      y
    );
    y += 12;

    addSection(
      "4. Vehicle Entry / Exit Summary",
      ["Metric", "Value"],
      [
        ["Total Vehicles", vehicles.totalVehicles || 0],
        ["Vehicles Entered", vehicles.vehiclesEntered || 0],
        ["Vehicles Exited", vehicles.vehiclesExited || 0],
        ["Currently Parked", vehicles.currentlyParked || 0]
      ]
    );

    // Detailed occupancy table
    addSection(
      "5. Parking Slot Details",
      ["Slot", "Status", "Vehicle Number", "Vehicle Type"],
      (occupancy.slots || []).map((slot) => [
        slot.slotNumber || "—",
        slot.isAvailable ? "Available" : "Occupied",
        slot.vehicleNumber || "—",
        slot.vehicleType || "—"
      ])
    );

    // Detailed booking table
    addSection(
      "6. Booking Details",
      ["Customer", "Slot", "Vehicle", "Date", "Duration", "Amount", "Status"],
      (bookings.bookings || []).map((booking) => [
        booking.user?.name || "—",
        booking.parkingSlot?.slotNumber || "—",
        booking.vehicleNumber || "—",
        formatDate(booking.bookingDate || booking.createdAt),
        `${booking.duration || 0} min`,
        `Rs. ${booking.amount || 0}`,
        booking.status || "—"
      ])
    );

    // Detailed payment table
    addSection(
      "7. Payment Details",
      ["Customer", "Vehicle", "Amount", "Method", "Date", "Status"],
      (revenue.payments || []).map((payment) => [
        payment.user?.name || "—",
        payment.booking?.vehicleNumber || "—",
        `Rs. ${payment.amount || 0}`,
        payment.paymentMethod || "—",
        formatDate(payment.createdAt),
        payment.paymentStatus || "—"
      ])
    );

    // Detailed vehicle movement table
    addSection(
      "8. Vehicle Movement Details",
      ["Customer", "Vehicle", "Slot", "Entry", "Exit", "Duration", "Status"],
      (vehicles.vehicles || []).map((booking) => [
        booking.user?.name || "—",
        booking.vehicleNumber || "—",
        booking.parkingSlot?.slotNumber || "—",
        formatDate(booking.entryTime),
        formatDate(booking.exitTime),
        `${booking.duration || 0} min`,
        booking.status || "—"
      ])
    );

    // Add page numbers
    const pageCount = doc.internal.getNumberOfPages();

    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.text(
        `ParkEase | Page ${i} of ${pageCount}`,
        105,
        290,
        { align: "center" }
      );
    }

    doc.save(`ParkEase_Report_${safeFileDate()}.pdf`);
  };

  // Export all four reports into one Excel workbook
  const downloadExcel = () => {
    const occupancy = reports.occupancy || {};
    const bookings = reports.bookings || {};
    const revenue = reports.revenue || {};
    const vehicles = reports.vehicles || {};

    const workbook = XLSX.utils.book_new();

    const addSheet = (name, rows) => {
      const worksheet = XLSX.utils.aoa_to_sheet(rows);
      worksheet["!cols"] = rows[0].map(() => ({ wch: 20 }));
      XLSX.utils.book_append_sheet(workbook, worksheet, name);
    };

    addSheet("Occupancy", [
      ["Slot Number", "Status", "Vehicle Number", "Vehicle Type"],
      ...(occupancy.slots || []).map((slot) => [
        slot.slotNumber || "—",
        slot.isAvailable ? "Available" : "Occupied",
        slot.vehicleNumber || "—",
        slot.vehicleType || "—"
      ])
    ]);

    addSheet("Bookings", [
      ["Customer", "Slot", "Vehicle", "Booking Date", "Duration (min)", "Amount", "Status"],
      ...(bookings.bookings || []).map((booking) => [
        booking.user?.name || "—",
        booking.parkingSlot?.slotNumber || "—",
        booking.vehicleNumber || "—",
        formatDate(booking.bookingDate || booking.createdAt),
        booking.duration || 0,
        booking.amount || 0,
        booking.status || "—"
      ])
    ]);

    addSheet("Revenue", [
      ["Customer", "Vehicle", "Amount", "Payment Method", "Date", "Status"],
      ...(revenue.payments || []).map((payment) => [
        payment.user?.name || "—",
        payment.booking?.vehicleNumber || "—",
        payment.amount || 0,
        payment.paymentMethod || "—",
        formatDate(payment.createdAt),
        payment.paymentStatus || "—"
      ])
    ]);

    addSheet("Vehicle Entry Exit", [
      ["Customer", "Vehicle Number", "Slot", "Entry Time", "Exit Time", "Duration (min)", "Status"],
      ...(vehicles.vehicles || []).map((booking) => [
        booking.user?.name || "—",
        booking.vehicleNumber || "—",
        booking.parkingSlot?.slotNumber || "—",
        formatDate(booking.entryTime),
        formatDate(booking.exitTime),
        booking.duration || 0,
        booking.status || "—"
      ])
    ]);

    addSheet("Analysis Summary", [
      ["ParkEase - Reports and Analytics"],
      ["Generated On", new Date().toLocaleString("en-IN")],
      [],
      ["Occupancy Analysis", "Value"],
      ["Total Slots", occupancy.totalSlots || 0],
      ["Available Slots", occupancy.availableSlots || 0],
      ["Occupied Slots", occupancy.occupiedSlots || 0],
      ["Occupancy Percentage", occupancy.occupancyPercentage || 0],
      [],
      ["Booking Analysis", "Value"],
      ["Total Bookings", bookings.totalBookings || 0],
      ["Booked", bookings.bookedBookings || 0],
      ["Active", bookings.activeBookings || 0],
      ["Completed", bookings.completedBookings || 0],
      ["Cancelled", bookings.cancelledBookings || 0],
      [],
      ["Revenue Analysis", "Value"],
      ["Total Transactions", revenue.totalPayments || 0],
      ["Paid Transactions", revenue.paidPayments || 0],
      ["Pending Transactions", revenue.pendingPayments || 0],
      ["Total Revenue", revenue.totalRevenue || 0],
      [],
      ["Vehicle Analysis", "Value"],
      ["Total Vehicles", vehicles.totalVehicles || 0],
      ["Vehicles Entered", vehicles.vehiclesEntered || 0],
      ["Vehicles Exited", vehicles.vehiclesExited || 0],
      ["Currently Parked", vehicles.currentlyParked || 0]
    ]);

    XLSX.writeFile(
      workbook,
      `ParkEase_Report_${safeFileDate()}.xlsx`
    );
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
          <button onClick={downloadPDF}>Download PDF</button>
          <button onClick={downloadExcel}>Export Excel</button>
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
          <div className="report-card"><p>Total Bookings</p><h3>{reports.bookings?.totalBookings || 0}</h3></div>
          <div className="report-card"><p>Booked</p><h3>{reports.bookings?.bookedBookings || 0}</h3></div>
          <div className="report-card"><p>Active</p><h3>{reports.bookings?.activeBookings || 0}</h3></div>
          <div className="report-card"><p>Completed</p><h3>{reports.bookings?.completedBookings || 0}</h3></div>
          <div className="report-card"><p>Cancelled</p><h3>{reports.bookings?.cancelledBookings || 0}</h3></div>
        </div>

        <div className="report-table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Customer</th><th>Slot</th><th>Vehicle</th><th>Booking Date</th><th>Duration</th><th>Amount</th><th>Status</th>
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
          <div className="report-card"><p>Total Transactions</p><h3>{reports.revenue?.totalPayments || 0}</h3></div>
          <div className="report-card"><p>Paid Transactions</p><h3>{reports.revenue?.paidPayments || 0}</h3></div>
          <div className="report-card"><p>Pending Transactions</p><h3>{reports.revenue?.pendingPayments || 0}</h3></div>
          <div className="report-card"><p>Total Revenue</p><h3>₹{reports.revenue?.totalRevenue || 0}</h3></div>
        </div>

        <div className="report-table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Customer</th><th>Vehicle</th><th>Amount</th><th>Method</th><th>Date</th><th>Status</th>
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
          <div className="report-card"><p>Total Vehicles</p><h3>{reports.vehicles?.totalVehicles || 0}</h3></div>
          <div className="report-card"><p>Vehicles Entered</p><h3>{reports.vehicles?.vehiclesEntered || 0}</h3></div>
          <div className="report-card"><p>Vehicles Exited</p><h3>{reports.vehicles?.vehiclesExited || 0}</h3></div>
          <div className="report-card"><p>Currently Parked</p><h3>{reports.vehicles?.currentlyParked || 0}</h3></div>
        </div>

        <div className="report-table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Customer</th><th>Vehicle Number</th><th>Slot</th><th>Entry Time</th><th>Exit Time</th><th>Duration</th><th>Status</th>
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
