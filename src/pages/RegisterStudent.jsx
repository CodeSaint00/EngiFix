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

          <button type="submit" className="auth-btn">
            Register
          </button>
        </form>

        <p className="auth-links">
          Already have an account? <Link to="/login">Log in</Link>
        </p>
      </div>
    </div>
  );
}
