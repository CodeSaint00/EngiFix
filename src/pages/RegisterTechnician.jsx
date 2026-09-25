import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../api/axios";
import LoadingButton from "../components/LoadingButton";

export default function RegisterTechnician() {
  const [form, setForm] = useState({
    username: "",
    password: "",
    email: "",
    first_name: "",
    address: "",
    phone: "",
  });
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    setLoading(true);
    try {
      await api.post("register/technician/", form);
      alert(
        "Registration successful! Your account is pending admin verification.",
      );
      navigate("/login");
    } catch (err) {
      setErrors(err.response?.data || { detail: "Registration failed." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-page-bg"></div>
      <button
        className="auth-back-btn"
        onClick={() => navigate(-1)}
        aria-label="Go back"
      >
        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path
            d="M16 4L8 12L16 20"
            stroke="#2FA8FF"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>
      <div className="auth-card">
        <h1 className="auth-brand">EngiFix</h1>
        <p className="auth-subtitle">Technician Registration</p>

        <form onSubmit={handleSubmit}>
          <div className="auth-field">
            <label>Full Name</label>
            <input
              className="auth-input"
              name="first_name"
              onChange={handleChange}
              required
            />
          </div>
          <div className="auth-field">
            <label>Username</label>
            <input
              className="auth-input"
              name="username"
              onChange={handleChange}
              required
            />
          </div>
          <div className="auth-field">
            <label>Email</label>
            <input
              className="auth-input"
              name="email"
              type="email"
              onChange={handleChange}
              required
            />
          </div>
          <div className="auth-field">
            <label>Phone Number</label>
            <input
              className="auth-input"
              name="phone"
              onChange={handleChange}
            />
          </div>
          <div className="auth-field">
            <label>Home/Office Address</label>
            <input
              className="auth-input"
              name="address"
              onChange={handleChange}
            />
          </div>
          <div className="auth-field">
            <label>Password</label>
            <input
              className="auth-input"
              name="password"
              type="password"
              onChange={handleChange}
              required
            />
          </div>

          {Object.entries(errors).map(([field, msgs]) => (
            <p key={field} className="auth-error">
              {field}: {Array.isArray(msgs) ? msgs.join(", ") : msgs}
            </p>
          ))}

          <LoadingButton
            type="submit"
            loading={loading}
            loadingText="Registering..."
          >
            Register
          </LoadingButton>
        </form>

        <p className="auth-links">
          Already have an account? <Link to="/login">Log in</Link>
        </p>
      </div>
    </div>
  );
}
