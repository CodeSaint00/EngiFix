import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../api/axios";

export default function RegisterStudent() {
  const [form, setForm] = useState({
    username: "",
    password: "",
    email: "",
    first_name: "",
    department: "",
    reg_number: "",
  });
  const [departments, setDepartments] = useState([]);
  const [departmentInput, setDepartmentInput] = useState("");
  const [departmentId, setDepartmentId] = useState("");
  const [showDeptDropdown, setShowDeptDropdown] = useState(false);
  const [addingDept, setAddingDept] = useState(false);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    api.get("departments/").then((res) => setDepartments(res.data));
  }, []);

  const filteredDepartments = departments.filter((d) =>
    d.name.toLowerCase().includes(departmentInput.toLowerCase()),
  );

  const selectDepartment = (dept) => {
    setDepartmentInput(dept.name);
    setDepartmentId(dept.id);
    setShowDeptDropdown(false);
  };

  const handleAddDepartment = async () => {
    setAddingDept(true);
    try {
      const res = await api.post("departments/", {
        name: departmentInput.trim(),
      });
      setDepartments((prev) => [...prev, res.data]);
      selectDepartment(res.data);
    } catch (err) {
      setErrors({ department: "Couldn't add that department. Try again." });
    } finally {
      setAddingDept(false);
    }
  };

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();

    setLoading(true);
    setErrors({});

    if (!departmentId) {
      setErrors({ department: "Please select or add a department." });
      return;
    }

    try {
      await api.post("register/student/", {
        ...form,
        department: departmentId,
      });
      alert("Registration successful! You can now log in.");
      navigate("/login");
    } catch (err) {
      setErrors(err.response?.data || { detail: "Registration failed." });
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
        <p className="auth-subtitle">Student Registration</p>

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
            <label>School Email</label>
            <input
              className="auth-input"
              name="email"
              type="email"
              onChange={handleChange}
              required
            />
          </div>
          <div className="auth-field dropdown-wrapper">
            <label>Faculty</label>
            <input
              className="auth-input"
              placeholder="Start typing your Faculty..."
              value={departmentInput}
              onChange={(e) => {
                setDepartmentInput(e.target.value);
                setDepartmentId("");
                setShowDeptDropdown(true);
              }}
              onFocus={() => setShowDeptDropdown(true)}
              onBlur={() => setTimeout(() => setShowDeptDropdown(false), 150)}
              required
            />
            {showDeptDropdown && departmentInput && (
              <div className="dropdown-list">
                {filteredDepartments.map((d) => (
                  <div
                    key={d.id}
                    className="dropdown-item"
                    onMouseDown={() => selectDepartment(d)}
                  >
                    {d.name}
                  </div>
                ))}
                {!filteredDepartments.some(
                  (d) => d.name.toLowerCase() === departmentInput.toLowerCase(),
                ) && (
                  <div
                    className="dropdown-add-item"
                    onMouseDown={handleAddDepartment}
                  >
                    {addingDept
                      ? "Adding..."
                      : `+ Add "${departmentInput}" as new department`}
                  </div>
                )}
              </div>
            )}
          </div>
          <div className="auth-field">
            <label>Registration Number</label>
            <input
              className="auth-input"
              name="reg_number"
              onChange={handleChange}
              required
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

          <button type="submit" className="auth-btn" disabled={loading}>
            {loading ? (
              <>
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                >
                  <path
                    d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                Registering...
              </>
            ) : (
              "Register"
            )}
          </button>
        </form>

        <p className="auth-links">
          Already have an account? <Link to="/login">Log in</Link>
        </p>
      </div>
    </div>
  );
}
