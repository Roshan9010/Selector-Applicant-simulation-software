import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { MdOutlineInsertDriveFile, MdSend, MdBarChart } from "react-icons/md";

const MainMenu = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const username = localStorage.getItem("username");
  const role = localStorage.getItem("role");

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  const isActive = (path) =>
    location.pathname === path || location.pathname.startsWith(path + "/");

  return (
    <div style={{ padding: "2rem 0" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "3rem",
        }}
      >
        <div>
          <h1 style={{ fontSize: "2.5rem", marginBottom: "0.5rem" }}>
            Applicant Simulation Platform
          </h1>
          <p className="text-muted">
            Welcome back, {" "}
            <span style={{ color: "var(--text-main)", fontWeight: "600" }}>
              {username}
            </span>
            <span
              style={{
                fontSize: "0.8rem",
                background: "rgba(255,255,255,0.1)",
                padding: "2px 8px",
                borderRadius: "10px",
                marginLeft: "10px",
                verticalAlign: "middle",
                textTransform: "uppercase",
              }}
            >
              {role}
            </span>
          </p>
        </div>

        <button onClick={handleLogout} className="btn btn-secondary">
          Logout
        </button>
      </div>

      <div className="dashboard-bg">
        <div style={{ display: "flex", justifyContent: "center", paddingTop: 12 }}>
          <div
            style={{
              width: "100%",
              maxWidth: 920,
              display: "flex",
              gap: 24,
              alignItems: "flex-start",
              flexWrap: "wrap",
            }}
          >
            {role === "admin" && (
              <div style={{ flex: "0 0 320px" }}>
                <div className="glass-panel admin-card">
                  <h3>Admin</h3>
                  <p>Quick access to admin tools</p>

                  <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                    <button
                      onClick={() => navigate("/resume-screening")}
                      className={`admin-btn btn-gradient-purple ${isActive("/resume-screening") ? "active" : ""}`}
                      aria-label="Resume Screening"
                    >
                      <span className="btn-icon" style={{ color: "#7c3aed" }}>
                        <MdOutlineInsertDriveFile />
                      </span>
                      <span>Resume Screening</span>
                    </button>

                    <button
                      onClick={() => navigate("/admin/invitations")}
                      className={`admin-btn btn-gradient-cyan ${isActive("/admin/invitations") ? "active" : ""}`}
                      aria-label="Invitations"
                    >
                      <span className="btn-icon" style={{ color: "#6d28d9" }}>
                        <MdSend />
                      </span>
                      <span>Invitations</span>
                    </button>

                    <button
                      onClick={() => navigate("/invitation-status")}
                      className={`admin-btn btn-gradient-orange ${isActive("/invitation-status") ? "active" : ""}`}
                      aria-label="Invitation Status"
                    >
                      <span className="btn-icon" style={{ color: "#10b981" }}>
                        <MdBarChart />
                      </span>
                      <span>Invitation Status</span>
                    </button>
                  </div>
                </div>
              </div>
            )}

            <div style={{ flex: 1, minWidth: 280 }}>
              {/* Primary card area (keeps mock sessions for candidates) */}
              {role === "candidate" && (
                <div
                  className="glass-panel"
                  style={{ cursor: "pointer", textAlign: "center", padding: "3.5rem 2rem" }}
                  onClick={() => navigate("/mock-sessions")}
                >
                  <div style={{ fontSize: "4rem", marginBottom: "1.25rem" }}>🎥</div>
                  <h2 style={{ fontSize: "1.75rem", marginBottom: "1rem", color: "var(--text-main)" }}>
                    AI Mock Sessions
                  </h2>
                  <p className="text-muted">
                    Engage in video-proctored domain interviews analyzed dynamically by our Facial and Vocal ML engines.
                  </p>
                  <button className="btn btn-primary" style={{ marginTop: "1.75rem", width: "60%" }}>
                    Enter Mock Sessions
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MainMenu;
