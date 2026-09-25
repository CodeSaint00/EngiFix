import { useState } from "react";
import api from "../api/axios";
import LoadingButton from "./LoadingButton";

const CATEGORY_OPTIONS = [
  "Electrical Fault",
  "Electronic Fault",
  "Plumbing",
  "HVAC/Mechanical",
  "Wood Work",
  "Other",
];

export default function AddEquipmentPanel({ locations, onCreated }) {
  const [form, setForm] = useState({
    name: "",
    category: "",
    condition: "OPERATIONAL",
    installed_date: "",
    location: "",
  });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    setSubmitting(true);
    try {
      await api.post("equipment/", {
        ...form,
        installed_date: form.installed_date || null,
      });
      setForm({
        name: "",
        category: "",
        condition: "OPERATIONAL",
        installed_date: "",
        location: "",
      });
      onCreated();
    } catch (err) {
      setErrors(err.response?.data || {});
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="auth-field">
        <label>Equipment Name</label>
        <input
          className="auth-input"
          name="name"
          value={form.name}
          onChange={handleChange}
          required
        />
      </div>

      <div className="auth-field">
        <label>Category</label>
        <input
          className="auth-input"
          name="category"
          list="category-options"
          value={form.category}
          onChange={handleChange}
          required
        />
        <datalist id="category-options">
          {CATEGORY_OPTIONS.map((c) => (
            <option key={c} value={c} />
          ))}
        </datalist>
      </div>

      <div className="auth-field">
        <label>Condition</label>
        <select
          className="auth-input"
          name="condition"
          value={form.condition}
          onChange={handleChange}
        >
          <option value="OPERATIONAL">Operational</option>
          <option value="UNDER_MAINTENANCE">Under Maintenance</option>
          <option value="FAULTY">Faulty</option>
          <option value="DECOMMISSIONED">Decommissioned</option>
        </select>
      </div>

      <div className="auth-field">
        <label>Date &amp; Time</label>
        <input
          className="auth-input"
          name="installed_date"
          type="datetime-local"
          value={form.installed_date}
          onChange={handleChange}
        />
      </div>

      <div className="auth-field">
        <label>Location</label>
        <input
          className="auth-input"
          name="location"
          list="location-options"
          placeholder="e.g. Engineering Block, Room 4"
          value={form.location}
          onChange={handleChange}
          required
        />
        <datalist id="location-options">
          {locations.map((loc) => (
            <option
              key={loc.id}
              value={`${loc.building}${loc.room ? " - " + loc.room : ""}`}
            />
          ))}
        </datalist>
      </div>

      {Object.entries(errors).map(([field, msgs]) => (
        <p key={field} className="auth-error">
          {field}: {Array.isArray(msgs) ? msgs.join(", ") : msgs}
        </p>
      ))}

      <LoadingButton type="submit" loading={submitting} loadingText="Saving...">
        Save Equipment
      </LoadingButton>
    </form>
  );
}
