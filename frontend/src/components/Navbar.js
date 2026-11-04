import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { FaChartLine, FaFileUpload, FaReceipt, FaWallet, FaBell, FaUserCircle, FaSignOutAlt } from "react-icons/fa";

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  return (
    <nav style={styles.nav}>
      <div style={styles.brand}>Budgeting System</div>

      <div style={styles.links}>
        {!user ? (
          <>
            <Link to="/" style={styles.link}>Home</Link>
            <Link to="/login" style={styles.link}>Login</Link>
            <Link to="/signup" style={styles.link}>Sign Up</Link>
          </>
        ) : (
          <>
            <Link to="/dashboard" style={styles.link}><FaChartLine /> Dashboard</Link>
            <Link to="/upload" style={styles.link}><FaFileUpload /> Upload</Link>
            <Link to="/receipts" style={styles.link}><FaReceipt /> Receipts</Link>
            <Link to="/expenses" style={styles.link}><FaReceipt /> Expenses</Link>
            <Link to="/budgets" style={styles.link}><FaWallet /> Budgets</Link>
            <Link to="/alerts" style={styles.link}><FaBell /> Alerts</Link>
            <Link to="/profile" style={styles.link}><FaUserCircle /> Profile</Link>
            <button onClick={handleLogout} style={styles.logoutBtn}>
              <FaSignOutAlt /> Logout
            </button>
          </>
        )}
      </div>
    </nav>
  );
};

const styles = {
  nav: {
    position: "sticky",
    top: 0,
    zIndex: 1000,
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "16px 28px",
    background: "rgba(15,23,42,0.92)",
    backdropFilter: "blur(16px)",
    borderBottom: "1px solid rgba(255,255,255,0.08)",
    color: "white",
    flexWrap: "wrap",
    gap: "12px",
  },
  brand: {
    fontSize: "22px",
    fontWeight: 800,
    letterSpacing: "0.3px",
  },
  links: {
    display: "flex",
    gap: "14px",
    alignItems: "center",
    flexWrap: "wrap",
  },
  link: {
    color: "white",
    textDecoration: "none",
    fontWeight: 600,
    display: "flex",
    alignItems: "center",
    gap: "8px",
    padding: "10px 14px",
    borderRadius: "12px",
    background: "rgba(255,255,255,0.06)",
    transition: "all 0.2s ease",
  },
  logoutBtn: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    background: "linear-gradient(135deg, #ef4444, #dc2626)",
    color: "white",
    border: "none",
    padding: "10px 16px",
    borderRadius: "12px",
    cursor: "pointer",
    fontWeight: 700,
  },
};

export default Navbar;