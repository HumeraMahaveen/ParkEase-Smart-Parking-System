
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../services/api";
import "./Login.css";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setMessage("");
    setLoading(true);

    try {
      const response = await api.post("/auth/login", {
        email,
        password
      });

      localStorage.setItem("token", response.data.token);
      localStorage.setItem("user", JSON.stringify(response.data.user));

      setMessage("Login successful!");
      navigate("/dashboard");
    } catch (error) {
      setMessage(
        error.response?.data?.message || "Unable to login. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-left">
        <div className="brand">
          <span className="brand-icon">P</span>
          <span>ParkEase</span>
        </div>

        <div className="welcome-content">
          <p className="welcome-tag">YOUR JOURNEY STARTS HERE </p>
          <h1>A better way<br />to park.</h1>
          <p>
            Find your space,reserve with ease, and enjoy a seamless parking experience with ParkEase.
          </p>
          <div className="welcome-feature">
            <span>✓</span> Easy parking
          </div>
          <div className="welcome-feature">
            <span>✓</span> Convenient booking and reservations
          </div>
          <div className="welcome-feature">
            <span>✓</span> Simple and secure payments
          </div>
        </div>

        <p className="left-footer">Your space.Your time.Your way.</p>
      </div>

      <div className="login-right">
        <form className="login-card" onSubmit={handleLogin}>
          <div className="mobile-brand">PARK EASE</div>
          <p className="login-label">WELCOME BACK</p>
          <h2>Sign in to your account</h2>
          <p className="login-description">
            Enter your details to access your dashboard.
          </p>

          <label>Email Address</label>
          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <label>Password</label>
          <input
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          {message && <p className="login-message">{message}</p>}

          <button type="submit" disabled={loading}>
            {loading ? "Signing in..." : "Sign In"}
          </button>

          <p className="login-bottom">
            Don't have an account? <Link to="/register">Create Account</Link>
            </p>
        </form>
      </div>
    </div>
  );
}

export default Login;
