import React, { useEffect, useState } from "react";
import API from "../api";
import { useAuth } from "../context/AuthContext";
import { FaWallet, FaChartPie, FaBell, FaReceipt } from "react-icons/fa";
import { FaArrowTrendUp } from "react-icons/fa6";
import { formatCurrency } from "../utils/formatters";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";

const chartColors = ["#2563eb", "#7c3aed", "#059669", "#ea580c", "#dc2626", "#0891b2", "#9333ea"];

const DashboardPage = () => {
  const { user } = useAuth();
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    API.get("/dashboard/summary")
      .then((res) => setSummary(res.data))
      .catch((err) => console.error("Dashboard summary failed:", err))
      .finally(() => setLoading(false));
  }, []);

  const categoryData = summary?.spending_by_category || [];
  const budgetData = [
    { name: "Spent", value: summary?.total_spending || 0 },
    { name: "Budget", value: summary?.total_budget || 0 },
  ];

  const handleCardMouseEnter = (e) => {
    e.currentTarget.style.transform = "translateY(-4px)";
    e.currentTarget.style.boxShadow = "0 18px 34px rgba(15,23,42,0.14)";
  };

  const handleCardMouseLeave = (e) => {
    e.currentTarget.style.transform = "translateY(0)";
    e.currentTarget.style.boxShadow = "0 12px 28px rgba(15,23,42,0.08)";
  };

  if (loading) {
    return (
      <div style={styles.page}>
        <div style={styles.heroCard}>
          <h1 style={styles.title}>Loading dashboard...</h1>
          <p style={styles.subtitle}>Fetching your latest financial summary.</p>
        </div>

        <div style={styles.statsGrid}>
          {[1, 2, 3, 4].map((item) => (
            <div key={item} style={styles.statCard}>
              <div style={styles.skeletonTitle}></div>
              <div style={styles.skeletonValue}></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div style={styles.page}>
      <div style={styles.heroCard}>
        <div>
          <h1 style={styles.title}>Welcome back, {user?.full_name}</h1>
          <p style={styles.subtitle}>
            A complete overview of your spending, budgets, receipt records, and financial activity.
          </p>
        </div>
      </div>

      <div style={styles.statsGrid}>
        <div
          style={styles.statCard}
          onMouseEnter={handleCardMouseEnter}
          onMouseLeave={handleCardMouseLeave}
        >
          <FaWallet size={28} color="#2563eb" />
          <h3>Total Spending</h3>
          <p style={styles.statValue}>{formatCurrency(summary?.total_spending ?? 0)}</p>
        </div>

        <div
          style={styles.statCard}
          onMouseEnter={handleCardMouseEnter}
          onMouseLeave={handleCardMouseLeave}
        >
          <FaChartPie size={28} color="#7c3aed" />
          <h3>Monthly Budget</h3>
          <p style={styles.statValue}>{formatCurrency(summary?.total_budget ?? 0)}</p>
        </div>

        <div
          style={styles.statCard}
          onMouseEnter={handleCardMouseEnter}
          onMouseLeave={handleCardMouseLeave}
        >
          <FaReceipt size={28} color="#059669" />
          <h3>Total Receipts</h3>
          <p style={styles.statValue}>{summary?.total_receipts ?? 0}</p>
        </div>

        <div
          style={styles.statCard}
          onMouseEnter={handleCardMouseEnter}
          onMouseLeave={handleCardMouseLeave}
        >
          <FaBell size={28} color="#ea580c" />
          <h3>Unread Alerts</h3>
          <p style={styles.statValue}>{summary?.unread_alerts ?? 0}</p>
        </div>
      </div>

      <div style={styles.grid}>
        <div style={styles.panel}>
          <h2>Recent Expenses</h2>
          {!summary?.recent_expenses?.length ? (
            <div style={styles.emptyState}>
              <h3 style={styles.emptyTitle}>No expenses yet</h3>
              <p style={styles.emptyText}>
                Your recent expenses will appear here after receipt uploads or manual updates.
              </p>
            </div>
          ) : (
            summary.recent_expenses.map((expense) => (
              <div key={expense.id} style={styles.listItem}>
                <div>
                  <strong>{expense.title}</strong>
                  <div style={styles.muted}>{expense.transaction_date || "No date"}</div>
                </div>
                <div style={styles.amount}>{formatCurrency(expense.amount)}</div>
              </div>
            ))
          )}
        </div>

        <div style={styles.panel}>
          <h2>Budget Usage Snapshot</h2>
          <div style={{ width: "100%", height: 260 }}>
            <ResponsiveContainer>
              <BarChart data={budgetData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip formatter={(value) => formatCurrency(value)} />
                <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                  <Cell fill="#2563eb" />
                  <Cell fill="#7c3aed" />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div style={styles.grid}>
        <div style={styles.panel}>
          <div style={styles.trendHeader}>
            <FaArrowTrendUp size={20} color="#2563eb" />
            <h2 style={{ margin: 0 }}>Spending by Category</h2>
          </div>

          {!categoryData.length ? (
            <div style={styles.emptyState}>
              <h3 style={styles.emptyTitle}>No categorized expenses yet</h3>
              <p style={styles.emptyText}>
                Assign categories to expenses so that category analytics can appear here.
              </p>
            </div>
          ) : (
            <div style={{ width: "100%", height: 320 }}>
              <ResponsiveContainer>
                <PieChart>
                  <Pie
                    data={categoryData}
                    dataKey="total"
                    nameKey="category"
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    label
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={chartColors[index % chartColors.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => formatCurrency(value)} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        <div style={styles.panel}>
          <h2>Category Breakdown</h2>
          {!categoryData.length ? (
            <div style={styles.emptyState}>
              <h3 style={styles.emptyTitle}>No category breakdown yet</h3>
              <p style={styles.emptyText}>
                Once expenses are categorized, their relative spending share will appear here.
              </p>
            </div>
          ) : (
            categoryData.map((item, index) => (
              <div key={index} style={{ marginBottom: "18px" }}>
                <div style={styles.rowBetween}>
                  <span style={{ fontWeight: 700 }}>{item.category}</span>
                  <strong>{formatCurrency(item.total)}</strong>
                </div>
                <div style={styles.progressTrack}>
                  <div
                    style={{
                      ...styles.progressBar,
                      width: `${Math.min((item.total / Math.max(summary.total_spending || 1, 1)) * 100, 100)}%`,
                      background: chartColors[index % chartColors.length],
                    }}
                  />
                </div>
              </div>
            ))
          )}
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
    background: "linear-gradient(135deg, #0f172a, #1d4ed8, #7c3aed)",
    color: "white",
    borderRadius: "24px",
    padding: "28px",
    boxShadow: "0 18px 40px rgba(0,0,0,0.18)",
    marginBottom: "24px",
  },
  title: {
    margin: 0,
    fontSize: "34px",
  },
  subtitle: {
    marginTop: "10px",
    fontSize: "15px",
    color: "#dbeafe",
  },
  statsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
    gap: "18px",
    marginBottom: "24px",
  },
  statCard: {
    background: "white",
    borderRadius: "20px",
    padding: "22px",
    boxShadow: "0 12px 28px rgba(15,23,42,0.08)",
    transition: "transform 0.25s ease, box-shadow 0.25s ease",
    cursor: "pointer",
  },
  statValue: {
    fontSize: "24px",
    fontWeight: 800,
    marginTop: "10px",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
    gap: "20px",
    marginBottom: "24px",
  },
  panel: {
    background: "white",
    borderRadius: "22px",
    padding: "24px",
    boxShadow: "0 12px 28px rgba(15,23,42,0.08)",
  },
  listItem: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "14px 0",
    borderBottom: "1px solid #e5e7eb",
  },
  amount: {
    fontWeight: 800,
    color: "#0f172a",
  },
  muted: {
    color: "#64748b",
    fontSize: "13px",
    marginTop: "4px",
  },
  rowBetween: {
    display: "flex",
    justifyContent: "space-between",
    marginBottom: "8px",
    gap: "10px",
  },
  progressTrack: {
    width: "100%",
    height: "12px",
    background: "#e2e8f0",
    borderRadius: "999px",
    overflow: "hidden",
  },
  progressBar: {
    height: "100%",
    borderRadius: "999px",
  },
  trendHeader: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    marginBottom: "18px",
  },
  emptyState: {
    padding: "12px 0",
  },
  emptyTitle: {
    marginTop: 0,
    marginBottom: "8px",
  },
  emptyText: {
    color: "#64748b",
    marginBottom: 0,
    lineHeight: 1.6,
  },
  skeletonTitle: {
    width: "60%",
    height: "18px",
    borderRadius: "8px",
    background: "#e2e8f0",
    marginBottom: "16px",
  },
  skeletonValue: {
    width: "40%",
    height: "28px",
    borderRadius: "8px",
    background: "#cbd5e1",
  },
};

export default DashboardPage;