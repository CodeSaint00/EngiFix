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

  const [showPassword, setShowPassword] = useState(false);

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
            <div className="auth-password-wrap">
              <input
                className="auth-input"
                name="password"
                type={showPassword ? "text" : "password"}
                onChange={handleChange}
                required
              />
              <button
                type="button"
                className="auth-eye-btn"
                onClick={() => setShowPassword((s) => !s)}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? (
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                    <line x1="1" y1="1" x2="23" y2="23" />
                  </svg>
                ) : (
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                )}
              </button>
            </div>
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
