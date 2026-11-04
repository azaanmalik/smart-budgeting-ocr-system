import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { FaUser, FaEnvelope, FaLock, FaArrowRight, FaShieldAlt, FaChartLine, FaWallet } from "react-icons/fa";

const SignupPage = () => {
  const { signup } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    full_name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (form.password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      setSubmitting(true);
      setError("");
      await signup(form.full_name, form.email, form.password);
      navigate("/dashboard", { replace: true });
    } catch (err) {
      console.error("Signup error:", err);
      setError(
        err?.response?.data?.detail ||
        JSON.stringify(err?.response?.data) ||
        "Signup failed"
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.shell}>
        <div style={styles.leftPanel}>
          <div style={styles.brandBadge}>Create Your Account</div>
          <h1 style={styles.heroTitle}>Start tracking expenses with a modern budgeting platform</h1>
          <p style={styles.heroText}>
            Build your personal finance workflow with receipt OCR, smart categorization, budget monitoring, and dashboard analytics.
          </p>

          <div style={styles.benefitList}>
            <div style={styles.benefitCard}>
              <FaShieldAlt size={20} color="#60a5fa" />
              <span>Secure user account based access</span>
            </div>
            <div style={styles.benefitCard}>
              <FaWallet size={20} color="#34d399" />
              <span>Monthly category budget controls</span>
            </div>
            <div style={styles.benefitCard}>
              <FaChartLine size={20} color="#c084fc" />
              <span>Clear analytics and spending visibility</span>
            </div>
          </div>
        </div>

        <div style={styles.rightPanel}>
          <div style={styles.formCard}>
            <div style={styles.formTop}>
              <h2 style={styles.formTitle}>Sign Up</h2>
              <p style={styles.formSubtitle}>Create a professional budgeting workspace in seconds.</p>
            </div>

            <form onSubmit={handleSubmit}>
              <label style={styles.label}>Full Name</label>
              <div style={styles.inputWrap}>
                <FaUser color="#64748b" />
                <input
                  type="text"
                  placeholder="Enter your full name"
                  value={form.full_name}
                  onChange={(e) => setForm({ ...form, full_name: e.target.value })}
                  style={styles.input}
                  required
                />
              </div>

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
                  placeholder="Create a password"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  style={styles.input}
                  required
                />
              </div>

              <label style={styles.label}>Confirm Password</label>
              <div style={styles.inputWrap}>
                <FaLock color="#64748b" />
                <input
                  type="password"
                  placeholder="Re-enter password"
                  value={form.confirmPassword}
                  onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                  style={styles.input}
                  required
                />
              </div>

              {error && <div style={styles.errorBox}>{error}</div>}

              <button type="submit" style={styles.primaryBtn} disabled={submitting}>
                {submitting ? "Creating account..." : "Create Account"}
                <FaArrowRight />
              </button>
            </form>

            <div style={styles.footerText}>
              Already have an account? <Link to="/login" style={styles.link}>Login</Link>
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
    fontSize: "48px",
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
  benefitList: {
    display: "grid",
    gap: "16px",
    marginTop: "10px",
  },
  benefitCard: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    background: "rgba(255,255,255,0.08)",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: "18px",
    padding: "16px 18px",
    fontWeight: 600,
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

export default SignupPage;
