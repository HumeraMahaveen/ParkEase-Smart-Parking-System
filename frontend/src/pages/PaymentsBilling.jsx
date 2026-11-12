
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import "./PaymentsBilling.css";

function PaymentsBilling() {
  const navigate = useNavigate();

  const [payments, setPayments] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [paymentMethods, setPaymentMethods] = useState({});
  const [loading, setLoading] = useState(true);
  const [payingId, setPayingId] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const loadPayments = async () => {
    try {
      setLoading(true);
      setError("");

      const [paymentResponse, bookingResponse] = await Promise.all([
        api.get("/payments/my-payments"),
        api.get("/parking/my-bookings")
      ]);

      const paymentData = paymentResponse.data.payments || [];
      const bookingData = bookingResponse.data.bookings ||
        bookingResponse.data.myBookings ||
        (Array.isArray(bookingResponse.data) ? bookingResponse.data : []);

      setPayments(paymentData);
      setBookings(bookingData);
    } catch (err) {
      setError(
        err.response?.data?.message || "Unable to load payment information."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPayments();
  }, []);

  const paidBookingIds = payments
    .filter((payment) => payment.paymentStatus === "Paid")
    .map((payment) =>
      typeof payment.booking === "object"
        ? payment.booking?._id
        : payment.booking
    );

  const unpaidBookings = bookings.filter(
    (booking) =>
      booking.status === "Completed" &&
      !paidBookingIds.includes(booking._id)
  );

  const handlePayment = async (bookingId) => {
    try {
      setPayingId(bookingId);
      setError("");
      setSuccess("");

      const paymentMethod = paymentMethods[bookingId] || "UPI";

      const response = await api.post("/payments", {
        bookingId,
        paymentMethod
      });

      setSuccess(response.data.message || "Payment recorded successfully.");

      await loadPayments();
    } catch (err) {
      setError(
        err.response?.data?.message || "Unable to record payment."
      );
    } finally {
      setPayingId("");
    }
  };

  const totalPaid = payments
    .filter((payment) => payment.paymentStatus === "Paid")
    .reduce((total, payment) => total + Number(payment.amount || 0), 0);

  const formatDate = (date) => {
    if (!date) return "—";
    return new Date(date).toLocaleString("en-IN");
  };

  return (
    <div className="payments-page">
      <header className="payments-header">
        <div>
          <p>PARKEASE / PAYMENTS</p>
          <h1>Payments & Billing</h1>
          <span>Track your parking payments and transaction history.</span>
        </div>

        <button onClick={() => navigate("/dashboard")}>
          Back to Dashboard
        </button>
      </header>

      <section className="payment-summary">
        <div className="payment-summary-card">
          <p>Total Transactions</p>
          <h2>{payments.length}</h2>
        </div>

        <div className="payment-summary-card">
          <p>Total Amount Paid</p>
          <h2>₹{totalPaid}</h2>
        </div>
      </section>

      {error && <p className="payments-error">{error}</p>}
      {success && <p className="payments-success">{success}</p>}

      <section className="payments-card">
        <div className="payments-heading">
          <div>
            <h2>Pending Payments</h2>
            <p>Pay for your completed parking bookings.</p>
          </div>

          <button onClick={loadPayments}>Refresh</button>
        </div>

        {loading ? (
          <p>Loading bookings...</p>
        ) : unpaidBookings.length === 0 ? (
          <p>No completed unpaid bookings found.</p>
        ) : (
          <div className="payments-table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Vehicle Number</th>
                  <th>Vehicle Type</th>
                  <th>Parking Slot</th>
                  <th>Amount</th>
                  <th>Payment Method</th>
                  <th>Action</th>
                </tr>
              </thead>

              <tbody>
                {unpaidBookings.map((booking) => (
                  <tr key={booking._id}>
                    <td>{booking.vehicleNumber}</td>
                    <td>{booking.vehicleType}</td>
                    <td>
                      {booking.parkingSlot?.slotNumber || "—"}
                    </td>
                    <td>₹{booking.amount ?? 0}</td>
                    <td>
                      <select
                        value={paymentMethods[booking._id] || "UPI"}
                        onChange={(e) =>
                          setPaymentMethods({
                            ...paymentMethods,
                            [booking._id]: e.target.value
                          })
                        }
                      >
                        <option value="UPI">UPI</option>
                        <option value="Cash">Cash</option>
                        <option value="Card">Card</option>
                      </select>
                    </td>
                    <td>
                      <button
                        onClick={() => handlePayment(booking._id)}
                        disabled={payingId === booking._id}
                      >
                        {payingId === booking._id ? "Processing..." : "Pay Now"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="payments-card">
        <div className="payments-heading">
          <div>
            <h2>Payment History</h2>
            <p>Review your parking payment transactions.</p>
          </div>

          <button onClick={loadPayments}>Refresh</button>
        </div>

        {loading ? (
          <p>Loading payments...</p>
        ) : payments.length === 0 ? (
          <p>No payment records found.</p>
        ) : (
          <div className="payments-table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Vehicle Number</th>
                  <th>Vehicle Type</th>
                  <th>Amount</th>
                  <th>Payment Method</th>
                  <th>Payment Date</th>
                  <th>Status</th>
                </tr>
              </thead>

              <tbody>
                {payments.map((payment) => (
                  <tr key={payment._id}>
                    <td>{payment.booking?.vehicleNumber || "—"}</td>
                    <td>{payment.booking?.vehicleType || "—"}</td>
                    <td>₹{payment.amount ?? 0}</td>
                    <td>{payment.paymentMethod || "—"}</td>
                    <td>{formatDate(payment.createdAt)}</td>
                    <td>
                      <span
                        className={`payment-status ${payment.paymentStatus?.toLowerCase()}`}
                      >
                        {payment.paymentStatus || "Unknown"}
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

export default PaymentsBilling;
