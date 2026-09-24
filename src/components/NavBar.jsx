export default function NavBar({
  user,
  onHome,
  onReport,
  onEquipment,
  onTechnicians,
  onLogout,
}) {
  return (
    <nav className="app-nav">
      <div className="app-nav-inner">
        <button className="nav-item" onClick={onHome} aria-label="Home">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
          >
            <path
              d="M3 11L12 4l9 7"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M5 10v9a1 1 0 0 0 1 1h4v-6h4v6h4a1 1 0 0 0 1-1v-9"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <span>Home</span>
        </button>

        {user?.role === "STUDENT" && (
          <button
            className="nav-item"
            onClick={onReport}
            aria-label="Report a fault"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
            >
              <path d="M12 5v14M5 12h14" strokeLinecap="round" />
            </svg>
            <span>Report</span>
          </button>
        )}

        {["ADMIN", "STUDENT"].includes(user?.role) && (
          <button
            className="nav-item"
            onClick={onEquipment}
            aria-label="Add equipment"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
            >
              <path
                d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <span>Equip</span>
          </button>
        )}

        {user?.role === "ADMIN" && (
          <button
            className="nav-item"
            onClick={onTechnicians}
            aria-label="Manage technicians"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
            >
              <circle cx="9" cy="8" r="3" />
              <path d="M2 20c0-3.3 3.1-6 7-6s7 2.7 7 6" strokeLinecap="round" />
              <circle cx="17" cy="8" r="2.4" />
              <path d="M16 14.3c2.9.6 5 2.7 5 5.7" strokeLinecap="round" />
            </svg>
            <span>Techs</span>
          </button>
        )}

        <button className="nav-item" onClick={onLogout} aria-label="Log out">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
          >
            <path
              d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M16 17l5-5-5-5M21 12H9"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <span>Logout</span>
        </button>
      </div>
    </nav>
  );
}
