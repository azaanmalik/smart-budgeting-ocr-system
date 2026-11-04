import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { FaEnvelope, FaLock, FaArrowRight, FaChartLine, FaReceipt, FaWallet } from "react-icons/fa";

const LoginPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setSubmitting(true);
      setError("");
      await login(form.email, form.password);
      navigate("/dashboard", { replace: true });
    } catch (err) {
      console.error("Login error:", err);
      setError(
        err?.response?.data?.detail ||
        JSON.stringify(err?.response?.data) ||
        "Login failed"
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.shell}>
        <div style={styles.leftPanel}>
          <div style={styles.brandBadge}>Budgeting System</div>
          <h1 style={styles.heroTitle}>Welcome back to your smart budgeting workspace</h1>
          <p style={styles.heroText}>
            Sign in to manage receipts, monitor budgets, review alerts, and track expenses through your personalized dashboard.
          </p>

          <div style={styles.featureGrid}>
            <div style={styles.featureCard}>
              <FaReceipt size={22} color="#60a5fa" />
              <div>
                <strong>Receipt OCR</strong>
                <p style={styles.featureText}>Extract transaction details from uploaded receipts.</p>
              </div>
            </div>

            <div style={styles.featureCard}>
              <FaWallet size={22} color="#34d399" />
              <div>
                <strong>Budget Tracking</strong>
                <p style={styles.featureText}>Stay within monthly limits by category.</p>
              </div>
            </div>

            <div style={styles.featureCard}>
              <FaChartLine size={22} color="#c084fc" />
              <div>
                <strong>Analytics Dashboard</strong>
                <p style={styles.featureText}>See spending trends and category performance.</p>
              </div>
            </div>
          </div>
        </div>

        <div style={styles.rightPanel}>
          <div style={styles.formCard}>
            <div style={styles.formTop}>
              <h2 style={styles.formTitle}>Login</h2>
              <p style={styles.formSubtitle}>Access your account and continue tracking smarter.</p>
            </div>

            <form onSubmit={handleSubmit}>
              <label style={styles.label}>Email Address</label>
              <div style={styles.inputWrap}>
                <FaEnvelope color="#64748b" />
                <input
                  type="email"
                  placeholder="Enter your email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  style={styles.input}
                  required
                />
              </div>

              <label style={styles.label}>Password</label>
              <div style={styles.inputWrap}>
                <FaLock color="#64748b" />
                <input
                  type="password"
                  placeholder="Enter your password"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  style={styles.input}
                  required
                />
              </div>

              {error && <div style={styles.errorBox}>{error}</div>}

              <button type="submit" style={styles.primaryBtn} disabled={submitting}>
                {submitting ? "Signing in..." : "Login"}
                <FaArrowRight />
              </button>
            </form>

            <div style={styles.footerText}>
              Don't have an account? <Link to="/signup" style={styles.link}>Create one</Link>
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
    padding: "32px",
  },
  shell: {
    maxWidth: "1350px",
    margin: "0 auto",
    minHeight: "calc(100vh - 64px)",
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(360px, 1fr))",
    gap: "28px",
    alignItems: "stretch",
  },
  leftPanel: {
    background: "linear-gradient(135deg, rgba(37,99,235,0.24), rgba(124,58,237,0.22))",
    border: "1px solid rgba(255,255,255,0.10)",
    borderRadius: "30px",
    padding: "40px",
    color: "white",
    backdropFilter: "blur(14px)",
    boxShadow: "0 22px 50px rgba(0,0,0,0.24)",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
  },
  brandBadge: {
    display: "inline-block",
    alignSelf: "flex-start",
    padding: "8px 14px",
    borderRadius: "999px",
    background: "rgba(255,255,255,0.10)",
    border: "1px solid rgba(255,255,255,0.12)",
    fontWeight: 700,
    marginBottom: "20px",
  },
  heroTitle: {
    fontSize: "50px",
    lineHeight: 1.1,
    margin: 0,
    marginBottom: "18px",
  },
  heroText: {
    fontSize: "17px",
    color: "#dbeafe",
    lineHeight: 1.7,
    maxWidth: "650px",
    marginBottom: "28px",
  },
  featureGrid: {
    display: "grid",
    gap: "16px",
    marginTop: "12px",
  },
  featureCard: {
    display: "flex",
    gap: "14px",
    alignItems: "flex-start",
    background: "rgba(255,255,255,0.08)",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: "20px",
    padding: "18px",
  },
  featureText: {
    margin: "6px 0 0 0",
    color: "#cbd5e1",
    fontSize: "14px",
  },
  rightPanel: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  formCard: {
    width: "100%",
    maxWidth: "520px",
    background: "rgba(255,255,255,0.96)",
    borderRadius: "28px",
    padding: "34px",
    boxShadow: "0 22px 50px rgba(0,0,0,0.24)",
  },
  formTop: {
    marginBottom: "22px",
  },
  formTitle: {
    margin: 0,
    fontSize: "34px",
    color: "#0f172a",
  },
  formSubtitle: {
    marginTop: "10px",
    color: "#64748b",
    lineHeight: 1.6,
  },
  label: {
    display: "block",
    fontWeight: 700,
    color: "#334155",
    marginBottom: "8px",
    marginTop: "14px",
  },
  inputWrap: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    background: "#f8fafc",
    border: "1px solid #cbd5e1",
    borderRadius: "16px",
    padding: "0 14px",
    marginBottom: "6px",
  },
  input: {
    width: "100%",
    border: "none",
    outline: "none",
    background: "transparent",
    padding: "15px 0",
    fontSize: "15px",
  },
  errorBox: {
    marginTop: "14px",
    background: "#fee2e2",
    color: "#b91c1c",
    border: "1px solid #fecaca",
    borderRadius: "14px",
    padding: "12px 14px",
    fontWeight: 600,
  },
  primaryBtn: {
    width: "100%",
    marginTop: "20px",
    background: "linear-gradient(135deg, #2563eb, #7c3aed)",
    color: "white",
    border: "none",
    borderRadius: "16px",
    padding: "15px 18px",
    fontWeight: 800,
    fontSize: "15px",
    cursor: "pointer",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    gap: "10px",
    boxShadow: "0 16px 30px rgba(37,99,235,0.26)",
  },
  footerText: {
    marginTop: "18px",
    color: "#475569",
    textAlign: "center",
  },
  link: {
    color: "#2563eb",
    fontWeight: 700,
    textDecoration: "none",
  },
};

export default LoginPage;

