import { useState, useEffect, useRef } from "react";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";
import AddEquipmentPanel from "../components/AddEquipmentPanel";
import NavBar from "../components/NavBar";
import LoadingButton from "../components/LoadingButton";

const STATUS_FILTERS_ALL = [
  "ALL",
  "NEW",
  "ASSIGNED",
  "IN_PROGRESS",
  "RESOLVED",
];
const STATUS_FILTERS_TECHNICIAN = ["ASSIGNED", "IN_PROGRESS", "RESOLVED"];

function statusDotClass(status) {
  if (status === "NEW" || status === "ACKNOWLEDGED") return "dot-new";
  if (status === "ASSIGNED" || status === "IN_PROGRESS") return "dot-progress";
  if (status === "RESOLVED" || status === "CLOSED") return "dot-resolved";
  return "dot-default";
}

function badgeClass(priority) {
  return `badge-${priority?.toLowerCase()}`;
}

function formatTime(dateString) {
  if (!dateString) return null;
  const date = new Date(dateString);
  const diffMs = Date.now() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 1) return "just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default function Dashboard() {
  const { user, logout } = useAuth();

  const [faults, setFaults] = useState([]);
  const [equipmentList, setEquipmentList] = useState([]);
  const [technicians, setTechnicians] = useState([]);
  const [locations, setLocations] = useState([]);

  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState(
    user?.role === "TECHNICIAN" ? "ASSIGNED" : "ALL",
  );
  const [selectedFault, setSelectedFault] = useState(null);
  const [showReportForm, setShowReportForm] = useState(false);

  const [equipmentId, setEquipmentId] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState("MEDIUM");
  const [imageFile, setImageFile] = useState(null);

  const techniciansRef = useRef(null);
  const [showEquipmentModal, setShowEquipmentModal] = useState(false);
  const [showTechnicians, setShowTechnicians] = useState(false);
  const [loadingFaults, setLoadingFaults] = useState(true);
  const [submittingReport, setSubmittingReport] = useState(false);
  const [verifyingId, setVerifyingId] = useState(null);

  const loadFaults = async () => {
    setLoadingFaults(true);
    const response = await api.get("faults/");
    setFaults(response.data);
    setLoadingFaults(false);
  };
  const loadEquipment = async () =>
    setEquipmentList((await api.get("equipment/")).data);
  const loadTechnicians = async () =>
    setTechnicians((await api.get("technicians/")).data);
  const loadLocations = async () =>
    setLocations((await api.get("locations/")).data);

  useEffect(() => {
    loadFaults();
    loadEquipment();
    loadTechnicians();
    loadLocations();
  }, []);

  if (user?.role === "TECHNICIAN" && !user?.is_verified) {
    return (
      <div
        className="dash-page"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div className="dash-page-bg"></div>
        <div className="auth-card" style={{ textAlign: "center" }}>
          <h2 style={{ marginTop: 0 }}>Account Pending Verification</h2>
          <p style={{ color: "var(--text-muted)", marginBottom: 24 }}>
            Your technician account is awaiting admin approval. You'll be able
            to access job assignments once verified.
          </p>
          <button className="dash-logout" onClick={logout}>
            Log Out
          </button>
        </div>
      </div>
    );
  }

  const equipmentName = (id) =>
    equipmentList.find((e) => e.id === id)?.name || "Unknown";
  const technicianName = (id) =>
    technicians.find((t) => t.id === id)?.username || "—";

  const filteredFaults = faults.filter((f) => {
    const matchesRole =
      user?.role !== "TECHNICIAN" || f.assigned_to === user.id;
    const matchesFilter = activeFilter === "ALL" || f.status === activeFilter;
    const q = search.toLowerCase();
    const matchesSearch =
      equipmentName(f.equipment).toLowerCase().includes(q) ||
      f.description.toLowerCase().includes(q);
    return matchesRole && matchesFilter && matchesSearch;
  });

  const handleSubmitReport = async (e) => {
    e.preventDefault();
    setSubmittingReport(true);
    try {
      const formData = new FormData();
      formData.append("equipment", equipmentId);
      formData.append("description", description);
      formData.append("priority", priority);
      if (imageFile) formData.append("image", imageFile);

      await api.post("faults/", formData);
      setDescription("");
      setEquipmentId("");
      setImageFile(null);
      setShowReportForm(false);
      loadFaults();
    } catch (err) {
      alert("Couldn't submit report. Please try again.");
    } finally {
      setSubmittingReport(false);
    }
  };

  const handleAssign = async (faultId, technicianId) => {
    await api.patch(`faults/${faultId}/`, {
      assigned_to: technicianId,
      status: "ASSIGNED",
    });
    loadFaults();
    setSelectedFault(null);
  };

  const handleStatusChange = async (faultId, newStatus) => {
    await api.patch(`faults/${faultId}/`, { status: newStatus });
    loadFaults();
    setSelectedFault((prev) => (prev ? { ...prev, status: newStatus } : prev));
  };

  const handleVerify = async (technicianId) => {
    setVerifyingId(technicianId);
    try {
      await api.patch(`technicians/${technicianId}/verify/`);
      loadTechnicians();
    } finally {
      setVerifyingId(null);
    }
  };

  return (
    <div className="dash-page">
      <div className="dash-page-bg"></div>
      <div className="dash-header">
        <div>
          <p className="dash-greeting">Hi, {user?.username} 👋</p>
          <h1 className="dash-title">
            {user?.role === "TECHNICIAN" ? "My Assigned Jobs" : "Fault Reports"}
          </h1>
        </div>
      </div>

      <input
        className="dash-search"
        placeholder="Search reports..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      <div className="dash-chips">
        {(user?.role === "TECHNICIAN"
          ? STATUS_FILTERS_TECHNICIAN
          : STATUS_FILTERS_ALL
        ).map((s) => (
          <button
            key={s}
            className={`dash-chip ${activeFilter === s ? "active" : ""}`}
            onClick={() => setActiveFilter(s)}
          >
            {s.replace("_", " ")}
          </button>
        ))}
      </div>

      <div className="fault-grid">
        {loadingFaults ? (
          <div className="loading-state">
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
            <p>Loading reports...</p>
          </div>
        ) : filteredFaults.length === 0 ? (
          <div className="empty-state">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
            >
              <path d="M9 12h6M12 9v6" strokeLinecap="round" />
              <circle cx="12" cy="12" r="9" />
            </svg>
            <p>
              No{" "}
              {activeFilter === "ALL"
                ? ""
                : activeFilter.replace("_", " ").toLowerCase() + " "}
              reports found.
            </p>
          </div>
        ) : (
          filteredFaults.map((f, index) => (
            <div
              key={f.id}
              className="fault-card"
              style={{ animationDelay: `${index * 0.06}s` }}
              onClick={() => setSelectedFault(f)}
            >
              <div className="fault-card-img">
                {f.image ? (
                  <img src={f.image} alt="" />
                ) : (
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#fff"
                    strokeWidth="1.5"
                  >
                    <path
                      d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                )}
              </div>
              <div className="fault-card-body">
                <span className={`badge ${badgeClass(f.priority)}`}>
                  {f.priority}
                </span>
                <h3>{equipmentName(f.equipment)}</h3>
                <p>{f.description}</p>
                <div className="status-pill">
                  <span
                    className={`status-dot ${statusDotClass(f.status)}`}
                  ></span>
                  {f.status.replace("_", " ")}
                </div>
                <p
                  style={{
                    fontSize: 11,
                    color: "var(--text-muted)",
                    margin: "6px 0 0",
                  }}
                >
                  {formatTime(f.created_at)}
                </p>
              </div>
            </div>
          ))
        )}
      </div>

      {user?.role === "ADMIN" && showTechnicians && (
        <div ref={techniciansRef} style={{ marginTop: 32 }}>
          <h3 style={{ marginBottom: 12 }}>Manage Technicians</h3>
          <div style={{ display: "grid", gap: 10 }}>
            {technicians.map((t) => (
              <div
                key={t.id}
                className="fault-card"
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: 14,
                }}
              >
                <span>{t.username}</span>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span className="status-pill">
                    <span
                      className={`status-dot ${t.is_verified ? "dot-resolved" : "dot-progress"}`}
                    ></span>
                    {t.is_verified ? "Verified" : "Pending"}
                  </span>
                  {!t.is_verified && (
                    <LoadingButton
                      className="dash-logout"
                      loading={verifyingId === t.id}
                      loadingText="..."
                      onClick={() => handleVerify(t.id)}
                    >
                      Verify
                    </LoadingButton>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Report a Fault modal */}
      {showReportForm && (
        <div className="modal-overlay" onClick={() => setShowReportForm(false)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-body">
              <button
                className="modal-close-btn"
                onClick={() => setShowReportForm(false)}
              >
                ✕
              </button>
              <h2 style={{ marginTop: 0 }}>Report a Fault</h2>
              <form onSubmit={handleSubmitReport}>
                <div className="auth-field">
                  <label>Equipment</label>
                  <select
                    className="auth-input"
                    value={equipmentId}
                    onChange={(e) => setEquipmentId(e.target.value)}
                    required
                  >
                    <option value="">-- Select Equipment --</option>
                    {equipmentList.map((eq) => (
                      <option key={eq.id} value={eq.id}>
                        {eq.name} ({eq.serial_number})
                      </option>
                    ))}
                  </select>
                </div>
                <div className="auth-field">
                  <label>Description</label>
                  <textarea
                    className="auth-input"
                    rows="3"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    required
                  />
                </div>
                <div className="auth-field">
                  <label>Photo (optional)</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setImageFile(e.target.files[0])}
                  />
                </div>
                <div className="auth-field">
                  <label>Priority</label>
                  <select
                    className="auth-input"
                    value={priority}
                    onChange={(e) => setPriority(e.target.value)}
                  >
                    <option value="LOW">Low</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HIGH">High</option>
                    <option value="CRITICAL">Critical</option>
                  </select>
                </div>
                <LoadingButton
                  type="submit"
                  loading={submittingReport}
                  loadingText="Submitting..."
                >
                  Submit Report
                </LoadingButton>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Fault detail modal */}
      {selectedFault && (
        <div className="modal-overlay" onClick={() => setSelectedFault(null)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            {selectedFault.image ? (
              <div style={{ position: "relative" }}>
                <img className="modal-img" src={selectedFault.image} alt="" />
                <div className="modal-top-actions">
                  <button
                    className="modal-close-btn"
                    onClick={() => setSelectedFault(null)}
                  >
                    ←
                  </button>
                </div>
              </div>
            ) : (
              <div
                className="modal-top-actions"
                style={{ position: "static", padding: "16px 16px 0" }}
              >
                <button
                  className="modal-close-btn"
                  onClick={() => setSelectedFault(null)}
                >
                  ←
                </button>
              </div>
            )}

            <div className="modal-body">
              <span className={`badge ${badgeClass(selectedFault.priority)}`}>
                {selectedFault.priority}
              </span>
              <h2>{equipmentName(selectedFault.equipment)}</h2>
              <p className="modal-meta">
                Reported {formatTime(selectedFault.created_at)}
              </p>
              <p className="modal-desc">{selectedFault.description}</p>

              <hr className="modal-divider" />

              <div className="modal-field-label">Status</div>
              <div className="status-pill" style={{ marginBottom: 14 }}>
                <span
                  className={`status-dot ${statusDotClass(selectedFault.status)}`}
                ></span>
                {selectedFault.status.replace("_", " ")}
              </div>

              <div className="modal-field-label">Assigned To</div>
              <p style={{ marginTop: 0, marginBottom: 14 }}>
                {technicianName(selectedFault.assigned_to)}
              </p>

              {selectedFault.resolved_at && (
                <>
                  <div className="modal-field-label">Resolved</div>
                  <p style={{ marginTop: 0, marginBottom: 14 }}>
                    {formatTime(selectedFault.resolved_at)}
                  </p>
                </>
              )}

              {user?.role === "ADMIN" && !selectedFault.assigned_to && (
                <>
                  <div className="modal-field-label">Assign Technician</div>
                  <select
                    className="auth-input"
                    defaultValue=""
                    onChange={(e) =>
                      handleAssign(selectedFault.id, e.target.value)
                    }
                  >
                    <option value="" disabled>
                      Assign to...
                    </option>
                    {technicians.map((t) => (
                      <option key={t.id} value={t.id} disabled={!t.is_verified}>
                        {t.username}
                        {!t.is_verified ? " (unverified)" : ""}
                      </option>
                    ))}
                  </select>
                </>
              )}

              {user?.role === "TECHNICIAN" &&
                selectedFault.assigned_to === user.id &&
                selectedFault.status !== "RESOLVED" && (
                  <>
                    <div className="modal-field-label">Update Status</div>
                    <select
                      className="auth-input"
                      value={selectedFault.status}
                      onChange={(e) =>
                        handleStatusChange(selectedFault.id, e.target.value)
                      }
                    >
                      <option value="ASSIGNED">Assigned</option>
                      <option value="IN_PROGRESS">In Progress</option>
                      <option value="RESOLVED">Resolved</option>
                    </select>
                  </>
                )}
            </div>
          </div>
        </div>
      )}

      {showEquipmentModal && (
        <div
          className="modal-overlay"
          onClick={() => setShowEquipmentModal(false)}
        >
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-body">
              <button
                className="modal-close-btn"
                onClick={() => setShowEquipmentModal(false)}
              >
                ✕
              </button>
              <h2 style={{ marginTop: 0 }}>Add Equipment</h2>
              <AddEquipmentPanel
                locations={locations}
                onCreated={() => {
                  loadEquipment();
                  setShowEquipmentModal(false);
                }}
              />
            </div>
          </div>
        </div>
      )}
      <NavBar
        user={user}
        onHome={() => {
          setActiveFilter(user?.role === "TECHNICIAN" ? "ASSIGNED" : "ALL");
          setSearch("");
          setShowTechnicians(false);
        }}
        onReport={() => setShowReportForm(true)}
        onEquipment={() => setShowEquipmentModal(true)}
        onTechnicians={() => {
          setShowTechnicians((prev) => {
            const next = !prev;
            if (next) {
              setTimeout(() => {
                techniciansRef.current?.scrollIntoView({
                  behavior: "smooth",
                  block: "start",
                });
              }, 50);
            }
            return next;
          });
        }}
        onLogout={logout}
      />
    </div>
  );
}
