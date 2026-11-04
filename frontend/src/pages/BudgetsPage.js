import React, { useEffect, useState } from "react";
import API from "../api";
import { FaWallet, FaSave } from "react-icons/fa";
import { formatCurrency } from "../utils/formatters";

const BudgetsPage = () => {
  const [categories, setCategories] = useState([]);
  const [budgets, setBudgets] = useState([]);
  const [categoryId, setCategoryId] = useState("");
  const [budgetLimit, setBudgetLimit] = useState("");
  const [message, setMessage] = useState("");

  const now = new Date();
  const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;

  const fetchCategories = async () => {
    try {
      const res = await API.get("/categories");
      setCategories(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchBudgets = async () => {
    try {
      const res = await API.get("/budgets");
      setBudgets(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchCategories();
    fetchBudgets();
  }, []);

  const handleSaveBudget = async (e) => {
    e.preventDefault();

    try {
      await API.post("/budgets", {
        category_id: Number(categoryId),
        month: currentMonth,
        budget_limit: Number(budgetLimit),
      });

      setMessage("Budget saved successfully.");
      setCategoryId("");
      setBudgetLimit("");
      fetchBudgets();
    } catch (err) {
      console.error(err);
      setMessage("Failed to save budget.");
    }
  };

  const getCategoryName = (id) => {
    const match = categories.find((c) => c.id === id);
    return match ? match.name : "Unknown";
  };

  return (
    <div style={styles.page}>
      <div style={styles.heroCard}>
        <h1 style={styles.title}>Manage Budgets</h1>
        <p style={styles.subtitle}>
          Set monthly budgets by category and monitor your spending limits.
        </p>
      </div>

      <div style={styles.grid}>
        <div style={styles.card}>
          <div style={styles.headingRow}>
            <FaWallet size={24} color="#2563eb" />
            <h2>Set Monthly Budget</h2>
          </div>

          <form onSubmit={handleSaveBudget}>
            <label style={styles.label}>Category</label>
            <select
              style={styles.input}
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              required
            >
              <option value="">Select category</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>

            <label style={styles.label}>Budget Limit</label>
            <input
              style={styles.input}
              type="number"
              value={budgetLimit}
              onChange={(e) => setBudgetLimit(e.target.value)}
              placeholder="Enter budget amount"
              required
            />

            <button type="submit" style={styles.button}>
              <FaSave /> Save Budget
            </button>
          </form>

          {message && <p style={styles.message}>{message}</p>}
        </div>

        <div style={styles.card}>
          <h2>Current Month Budgets</h2>

          {budgets.length === 0 ? (
            <p>No budgets set yet.</p>
          ) : (
            budgets.map((budget) => (
              <div key={budget.id} style={styles.budgetItem}>
                <div>
                  <strong>{getCategoryName(budget.category_id)}</strong>
                  <div style={styles.muted}>Month: {budget.month}</div>
                </div>
                <div style={styles.amount}>{formatCurrency(budget.budget_limit)}</div>
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
    maxWidth: "1200px",
    margin: "0 auto 24px auto",
    background: "linear-gradient(135deg, #0f172a, #1d4ed8, #7c3aed)",
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
    color: "#dbeafe",
  },
  grid: {
    maxWidth: "1200px",
    margin: "0 auto",
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "24px",
  },
  card: {
    background: "white",
    borderRadius: "22px",
    padding: "24px",
    boxShadow: "0 12px 28px rgba(15,23,42,0.08)",
  },
  headingRow: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    marginBottom: "18px",
  },
  label: {
    display: "block",
    marginTop: "12px",
    marginBottom: "6px",
    fontWeight: 700,
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
  button: {
    marginTop: "18px",
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
  budgetItem: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "14px 0",
    borderBottom: "1px solid #e5e7eb",
  },
  muted: {
    color: "#64748b",
    fontSize: "13px",
    marginTop: "4px",
  },
  amount: {
    fontWeight: 800,
  },
};

export default BudgetsPage;
