import React, { useEffect, useState } from "react";
import API from "../api";
import { useAuth } from "../context/AuthContext";
import { FaUserCircle, FaSave, FaEnvelope, FaUser, FaLock } from "react-icons/fa";

const ProfilePage = () => {
  const { user, setUser } = useAuth();
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    full_name: "",
    email: "",
  });

  const [passwordForm, setPasswordForm] = useState({
    current_password: "",
    new_password: "",
  });

  const [message, setMessage] = useState("");
  const [passwordMessage, setPasswordMessage] = useState("");

  useEffect(() => {
    if (user) {
      setForm({
        full_name: user.full_name || "",
        email: user.email || "",
      });
    }
  }, [user]);

  const handleSaveProfile = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);
      const res = await API.put("/profile", {
        full_name: form.full_name,
        email: form.email,
      });

      setUser(res.data);
      setMessage("Profile updated successfully.");
    } catch (err) {
      console.error(err);
      setMessage(err?.response?.data?.detail || "Failed to update profile.");
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);
      const res = await API.put("/profile/change-password", {
        current_password: passwordForm.current_password,
        new_password: passwordForm.new_password,
      });

      setPasswordMessage(res.data.message || "Password changed successfully.");
      setPasswordForm({
        current_password: "",
        new_password: "",
      });
    } catch (err) {
      console.error(err);
      setPasswordMessage(err?.response?.data?.detail || "Failed to change password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.heroCard}>
        <div style={styles.profileTop}>
          <div style={styles.avatar}>
            <FaUserCircle size={90} color="white" />
          </div>
          <div>
            <h1 style={styles.title}>{user?.full_name}</h1>
            <p style={styles.subtitle}>{user?.email}</p>
          </div>
        </div>
      </div>

      <div style={styles.grid}>
        <div style={styles.card}>
          <h2 style={styles.sectionTitle}>Edit Profile</h2>

          <form onSubmit={handleSaveProfile}>
            <label style={styles.label}><FaUser /> Full Name</label>
            <input
              style={styles.input}
              value={form.full_name}
              onChange={(e) => setForm({ ...form, full_name: e.target.value })}
            />

            <label style={styles.label}><FaEnvelope /> Email Address</label>
            <input
              style={styles.input}
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />

            <button type="submit" style={styles.saveBtn} disabled={loading}>
              <FaSave /> {loading ? "Saving..." : "Save Changes"}
            </button>
          </form>

          {message && <p style={styles.message}>{message}</p>}
        </div>

        <div style={styles.card}>
          <h2 style={styles.sectionTitle}>Change Password</h2>

          <form onSubmit={handleChangePassword}>
            <label style={styles.label}><FaLock /> Current Password</label>
            <input
              type="password"
              style={styles.input}
              value={passwordForm.current_password}
              onChange={(e) =>
                setPasswordForm({ ...passwordForm, current_password: e.target.value })
              }
            />

            <label style={styles.label}><FaLock /> New Password</label>
            <input
              type="password"
              style={styles.input}
              value={passwordForm.new_password}
              onChange={(e) =>
                setPasswordForm({ ...passwordForm, new_password: e.target.value })
              }
            />

            <button type="submit" style={styles.saveBtn} disabled={loading}>
              <FaSave /> {loading ? "Updating..." : "Change Password"}
            </button>
          </form>

          {passwordMessage && <p style={styles.message}>{passwordMessage}</p>}
        </div>
      </div>
    </div>
  );
};

const styles = {
  page: {
    minHeight: "100vh",
    background: "linear-gradient(135deg, #f8fafc, #e2e8f0)",
    padding: "30px",
  },
  heroCard: {
    maxWidth: "1100px",
    margin: "0 auto 24px auto",
    background: "linear-gradient(135deg, #0f172a, #1d4ed8, #7c3aed)",
    color: "white",
    borderRadius: "24px",
    padding: "30px",
    boxShadow: "0 18px 40px rgba(0,0,0,0.18)",
  },
  profileTop: {
    display: "flex",
    alignItems: "center",
    gap: "18px",
    flexWrap: "wrap",
  },
  avatar: {
    width: "100px",
    height: "100px",
    borderRadius: "50%",
    background: "rgba(255,255,255,0.16)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    margin: 0,
    fontSize: "32px",
  },
  subtitle: {
    marginTop: "8px",
    color: "#dbeafe",
  },
  grid: {
    maxWidth: "1100px",
    margin: "0 auto",
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
    gap: "24px",
  },
  card: {
    background: "white",
    borderRadius: "22px",
    padding: "28px",
    boxShadow: "0 12px 28px rgba(15,23,42,0.08)",
  },
  sectionTitle: {
    marginTop: 0,
    marginBottom: "20px",
  },
  label: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    fontWeight: 700,
    marginBottom: "8px",
    marginTop: "14px",
    color: "#334155",
  },
  input: {
    width: "100%",
    padding: "12px 14px",
    borderRadius: "12px",
    border: "1px solid #cbd5e1",
    fontSize: "14px",
    boxSizing: "border-box",
  },
  saveBtn: {
    marginTop: "20px",
    padding: "12px 18px",
    border: "none",
    borderRadius: "12px",
    background: "linear-gradient(135deg, #2563eb, #7c3aed)",
    color: "white",
    fontWeight: 700,
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    gap: "8px",
  },
  message: {
    marginTop: "14px",
    color: "#059669",
    fontWeight: 700,
  },
};

export default ProfilePage;