
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import "./PaymentsBilling.css";

function AdminPayments() {
  const navigate = useNavigate();

  const [payments, setPayments] = useState([]);
  const [report, setReport] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadPayments = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/admin/payments");

      setPayments(response.data.report?.payments || []);
      setReport(response.data.report || {});
    } catch (err) {
      setError(
        err.response?.data?.message || "Unable to load all payments."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPayments();
  }, []);

  const formatDate = (date) => {
    if (!date) return "—";
    return new Date(date).toLocaleString("en-IN");
  };

  return (
    <div className="payments-page">
      <header className="payments-header">
        <div>
          <p>PARKEASE / ADMIN / PAYMENTS</p>
          <h1>Payment Management</h1>
          <span>Monitor customer transactions and parking revenue.</span>
        </div>

        <button onClick={() => navigate("/dashboard")}>
          Back to Dashboard
        </button>
      </header>

      <section className="payment-summary">
        <div className="payment-summary-card">
          <p>Total Transactions</p>
          <h2>{report.totalTransactions || 0}</h2>
        </div>

        <div className="payment-summary-card">
          <p>Successful Payments</p>
          <h2>{report.paidTransactions || 0}</h2>
        </div>

        <div className="payment-summary-card">
          <p>Total Revenue</p>
          <h2>₹{report.totalRevenue || 0}</h2>
        </div>
      </section>

      <section className="payments-card">
        <div className="payments-heading">
          <div>
            <h2>All Customer Transactions</h2>
            <p>View payment details from every customer.</p>
          </div>

          <button onClick={loadPayments}>Refresh</button>
        </div>

        {loading ? (
          <p>Loading transactions...</p>
        ) : error ? (
          <p className="payments-error">{error}</p>
        ) : payments.length === 0 ? (
          <p>No payment records found.</p>
        ) : (
          <div className="payments-table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Customer</th>
                  <th>Email</th>
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
                    <td>{payment.user?.name || "—"}</td>
                    <td>{payment.user?.email || "—"}</td>
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

export default AdminPayments;
