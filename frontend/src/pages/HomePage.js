import React from "react";
import { Link, Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { FaReceipt, FaChartPie, FaWallet, FaLock } from "react-icons/fa";

const HomePage = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div style={{ padding: "40px" }}>Loading...</div>;
  }

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div style={styles.page}>
      <div style={styles.hero}>
        <div style={styles.left}>
          <div style={styles.badge}>Smart Personal Finance Tracker</div>
          <h1 style={styles.title}>
            OCR Powered Budgeting System for Smarter Expense Tracking
          </h1>
          <p style={styles.subtitle}>
            Upload receipts, extract expense details, manage monthly budgets,
            and monitor your spending through a clean, modern dashboard.
          </p>

          <div style={styles.buttonRow}>
            <Link to="/signup" style={{ textDecoration: "none" }}>
              <button style={styles.primaryBtn}>Get Started</button>
            </Link>
            <Link to="/login" style={{ textDecoration: "none" }}>
              <button style={styles.secondaryBtn}>Login</button>
            </Link>
          </div>
        </div>

        <div style={styles.right}>
          <div style={styles.cardGrid}>
            <div style={styles.featureCard}>
              <FaReceipt size={28} color="#2563eb" />
              <h3>Receipt OCR</h3>
              <p>Extract title, amount, and date from uploaded receipts.</p>
            </div>

            <div style={styles.featureCard}>
              <FaChartPie size={28} color="#7c3aed" />
              <h3>Analytics</h3>
              <p>Track totals, categories, and monthly budget usage.</p>
            </div>

            <div style={styles.featureCard}>
              <FaWallet size={28} color="#059669" />
              <h3>Budgets</h3>
              <p>Set category-wise budgets and monitor actual spending.</p>
            </div>

            <div style={styles.featureCard}>
              <FaLock size={28} color="#ea580c" />
              <h3>User Accounts</h3>
              <p>Your data stays linked to your own secure account.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const styles = {
  page: {
    minHeight: "100vh",
    background: "linear-gradient(135deg, #0f172a, #1e293b, #334155)",
    color: "white",
    padding: "40px",
  },
  hero: {
    maxWidth: "1300px",
    margin: "0 auto",
    display: "grid",
    gridTemplateColumns: "1.1fr 1fr",
    gap: "28px",
    alignItems: "center",
  },
  left: {
    padding: "20px 10px",
  },
  badge: {
    display: "inline-block",
    background: "rgba(255,255,255,0.12)",
    padding: "8px 14px",
    borderRadius: "999px",
    marginBottom: "18px",
    fontSize: "13px",
    fontWeight: 700,
    backdropFilter: "blur(8px)",
  },
  title: {
    fontSize: "48px",
    lineHeight: 1.15,
    marginBottom: "18px",
  },
  subtitle: {
    fontSize: "17px",
    lineHeight: 1.7,
    color: "#dbeafe",
    maxWidth: "650px",
  },
  buttonRow: {
    display: "flex",
    gap: "14px",
    marginTop: "28px",
    flexWrap: "wrap",
  },
  primaryBtn: {
    background: "linear-gradient(135deg, #2563eb, #7c3aed)",
    color: "white",
    border: "none",
    padding: "14px 22px",
    borderRadius: "14px",
    fontWeight: 700,
    cursor: "pointer",
    boxShadow: "0 14px 30px rgba(37,99,235,0.35)",
  },
  secondaryBtn: {
    background: "rgba(255,255,255,0.12)",
    color: "white",
    border: "1px solid rgba(255,255,255,0.18)",
    padding: "14px 22px",
    borderRadius: "14px",
    fontWeight: 700,
    cursor: "pointer",
    backdropFilter: "blur(8px)",
  },
  right: {
    display: "flex",
    justifyContent: "center",
  },
  cardGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "16px",
    width: "100%",
  },
  featureCard: {
    background: "rgba(255,255,255,0.10)",
    border: "1px solid rgba(255,255,255,0.14)",
    borderRadius: "22px",
    padding: "24px",
    backdropFilter: "blur(14px)",
    boxShadow: "0 14px 40px rgba(0,0,0,0.22)",
    transition: "transform 0.25s ease",
  },
};

export default HomePage;