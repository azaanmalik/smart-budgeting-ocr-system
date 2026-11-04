import React, { useEffect, useState } from "react";
import API from "../api";
import { FaBell, FaCheckCircle } from "react-icons/fa";

const AlertsPage = () => {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchAlerts = async () => {
    try {
      setLoading(true);
      const res = await API.get("/alerts");
      setAlerts(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlerts();
  }, []);

  const markRead = async (alertId) => {
    try {
      await API.put(`/alerts/${alertId}/read`);
      fetchAlerts();
    } catch (err) {
      console.error(err);
    }
  };

  const markAllRead = async () => {
    try {
      await API.put("/alerts/read-all");
      fetchAlerts();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.heroCard}>
        <h1 style={styles.title}>Budget Alerts</h1>
        <p style={styles.subtitle}>
          Review category warnings and mark alerts as read once acknowledged.
        </p>
      </div>

      <div style={styles.card}>
        <div style={styles.topBar}>
          <h2 style={{ margin: 0 }}>All Alerts</h2>
          <button style={styles.markAllBtn} onClick={markAllRead}>
            <FaCheckCircle /> Mark All Read
          </button>
        </div>

        {loading ? (
          <p>Loading alerts...</p>
        ) : alerts.length === 0 ? (
          <div style={{ padding: "10px 0" }}>
            <h3 style={{ marginTop: 0 }}>No alerts yet</h3>
            <p style={{ color: "#64748b", marginBottom: 0 }}>
              You'll see warning and exceeded notifications here when spending reaches budget limits.
            </p>
          </div>
        ) : (
          alerts.map((alert) => {
            const tone = alert.alert_type === "Exceeded"
              ? { bg: "#fee2e2", text: "#b91c1c" }
              : { bg: "#fef3c7", text: "#b45309" };

            return (
              <div key={alert.id} style={styles.alertItem}>
                <div style={{ ...styles.iconWrap, background: tone.bg }}>
                  <FaBell color={tone.text} />
                </div>

                <div style={{ flex: 1 }}>
                  <div style={styles.alertTop}>
                    <span style={{ ...styles.badge, background: tone.bg, color: tone.text }}>
                      {alert.alert_type}
                    </span>
                    {alert.is_read && (
                      <span style={{ ...styles.badge, background: "#dcfce7", color: "#166534" }}>
                        Read
                      </span>
                    )}
                  </div>

                  <p style={styles.alertText}>{alert.message}</p>
                </div>

                {!alert.is_read && (
                  <button style={styles.readBtn} onClick={() => markRead(alert.id)}>
                    <FaCheckCircle /> Mark Read
                  </button>
                )}
              </div>
            );
          })
        )}
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
    background: "linear-gradient(135deg, #0f172a, #ea580c, #f97316)",
    color: "white",
    borderRadius: "24px",
    padding: "26px",
    boxShadow: "0 18px 40px rgba(0,0,0,0.18)",
  },
  title: {
    margin: 0,
    fontSize: "32px",
  },
  subtitle: {
    marginTop: "10px",
    color: "#ffedd5",
  },
  card: {
    maxWidth: "1100px",
    margin: "0 auto",
    background: "white",
    borderRadius: "22px",
    padding: "24px",
    boxShadow: "0 12px 28px rgba(15,23,42,0.08)",
  },
  topBar: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "12px",
    marginBottom: "18px",
    flexWrap: "wrap",
  },
  markAllBtn: {
    background: "#dbeafe",
    color: "#1d4ed8",
    border: "none",
    borderRadius: "10px",
    padding: "10px 12px",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    gap: "6px",
    fontWeight: 700,
  },
  alertItem: {
    display: "flex",
    gap: "14px",
    alignItems: "flex-start",
    padding: "16px",
    borderRadius: "16px",
    background: "#f8fafc",
    border: "1px solid #e2e8f0",
    marginBottom: "14px",
  },
  iconWrap: {
    width: "42px",
    height: "42px",
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  alertTop: {
    display: "flex",
    gap: "8px",
    marginBottom: "8px",
    flexWrap: "wrap",
  },
  badge: {
    padding: "6px 10px",
    borderRadius: "999px",
    fontSize: "12px",
    fontWeight: 700,
  },
  alertText: {
    margin: 0,
  },
  readBtn: {
    background: "#dcfce7",
    color: "#166534",
    border: "none",
    borderRadius: "10px",
    padding: "10px 12px",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    gap: "6px",
    fontWeight: 700,
  },
};

export default AlertsPage;
