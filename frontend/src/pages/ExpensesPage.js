import React, { useEffect, useState } from "react";
import API from "../api";
import { getCategoryColor } from "../categoryUtils";
import { formatCurrency } from "../utils/formatters";
import { FaEdit, FaSave, FaTrashAlt, FaSearch, FaFileCsv } from "react-icons/fa";

const ExpensesPage = () => {
  const [expenses, setExpenses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [form, setForm] = useState({
    title: "",
    amount: "",
    transaction_date: "",
    category_id: "",
  });

  const fetchExpenses = async () => {
    try {
      setLoading(true);
      const res = await API.get("/expenses");
      setExpenses(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await API.get("/categories");
      setCategories(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchExpenses();
    fetchCategories();
  }, []);

  const getCategoryName = (categoryId) => {
    const category = categories.find((c) => c.id === categoryId);
    return category ? category.name : "-";
  };

  const startEdit = (expense) => {
    setEditingId(expense.id);
    setForm({
      title: expense.title,
      amount: expense.amount,
      transaction_date: expense.transaction_date || "",
      category_id: expense.category_id || "",
    });
  };

  const saveEdit = async (expenseId) => {
    try {
      await API.put(`/expenses/${expenseId}`, {
        title: form.title,
        amount: Number(form.amount),
        transaction_date: form.transaction_date || null,
        category_id: form.category_id ? Number(form.category_id) : null,
      });

      setEditingId(null);
      fetchExpenses();
    } catch (err) {
      console.error(err);
      alert("Failed to update expense.");
    }
  };

  const deleteExpense = async (expenseId) => {
    const ok = window.confirm("Are you sure you want to delete this expense?");
    if (!ok) return;

    try {
      await API.delete(`/expenses/${expenseId}`);
      fetchExpenses();
    } catch (err) {
      console.error(err);
      alert("Failed to delete expense.");
    }
  };

  const exportCsv = async () => {
    try {
      const response = await API.get("/expenses/export/csv", {
        responseType: "blob",
      });

      const blob = new Blob([response.data], { type: "text/csv" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "expenses.csv");
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
      alert("Failed to export CSV.");
    }
  };

  const filteredExpenses = expenses.filter((expense) => {
    const q = query.toLowerCase();
    return (
      expense.title?.toLowerCase().includes(q) ||
      String(expense.amount || "").includes(q) ||
      String(expense.transaction_date || "").toLowerCase().includes(q) ||
      getCategoryName(expense.category_id).toLowerCase().includes(q)
    );
  });

  return (
    <div style={styles.page}>
      <div style={styles.heroCard}>
        <h1 style={styles.title}>Expenses Management</h1>
        <p style={styles.subtitle}>
          Review, update, search, export, and categorize all expense records from your uploaded receipts.
        </p>
      </div>

      <div style={styles.toolbar}>
        <div style={styles.searchBar}>
          <FaSearch color="#64748b" />
          <input
            type="text"
            placeholder="Search by title, amount, date, or category"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            style={styles.searchInput}
          />
        </div>

        <button style={styles.exportBtn} onClick={exportCsv}>
          <FaFileCsv /> Export CSV
        </button>
      </div>

      <div style={styles.tableCard}>
        <div style={styles.tableHeader}>
          <span>ID</span>
          <span>Title</span>
          <span>Amount</span>
          <span>Date</span>
          <span>Category</span>
          <span>Action</span>
        </div>

        {loading ? (
          <div style={{ padding: "20px 0" }}>Loading expenses...</div>
        ) : filteredExpenses.length === 0 ? (
          <div style={{ padding: "14px 0" }}>
            <h3 style={{ marginTop: 0 }}>No expenses found</h3>
            <p style={{ color: "#64748b", marginBottom: 0 }}>
              Try a different search or upload more receipts to populate this page.
            </p>
          </div>
        ) : (
          filteredExpenses.map((expense) => (
            <div key={expense.id} style={styles.row}>
              <div>{expense.id}</div>

              <div>
                {editingId === expense.id ? (
                  <input
                    style={styles.input}
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                  />
                ) : (
                  expense.title
                )}
              </div>

              <div>
                {editingId === expense.id ? (
                  <input
                    style={styles.input}
                    type="number"
                    value={form.amount}
                    onChange={(e) => setForm({ ...form, amount: e.target.value })}
                  />
                ) : (
                  formatCurrency(expense.amount)
                )}
              </div>

              <div>
                {editingId === expense.id ? (
                  <input
                    style={styles.input}
                    value={form.transaction_date}
                    onChange={(e) => setForm({ ...form, transaction_date: e.target.value })}
                  />
                ) : (
                  expense.transaction_date || "-"
                )}
              </div>

              <div>
                {editingId === expense.id ? (
                  <select
                    style={styles.input}
                    value={form.category_id}
                    onChange={(e) => setForm({ ...form, category_id: e.target.value })}
                  >
                    <option value="">Select category</option>
                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                ) : (
                  (() => {
                    const name = getCategoryName(expense.category_id);
                    const tone = getCategoryColor(name);
                    return (
                      <span
                        style={{
                          background: tone.bg,
                          color: tone.text,
                          padding: "6px 10px",
                          borderRadius: "999px",
                          fontWeight: 700,
                          fontSize: "12px",
                          display: "inline-block",
                        }}
                      >
                        {name}
                      </span>
                    );
                  })()
                )}
              </div>

              <div style={{ display: "flex", gap: "8px" }}>
                {editingId === expense.id ? (
                  <button style={styles.saveBtn} onClick={() => saveEdit(expense.id)}>
                    <FaSave /> Save
                  </button>
                ) : (
                  <>
                    <button style={styles.editBtn} onClick={() => startEdit(expense)}>
                      <FaEdit /> Edit
                    </button>
                    <button style={styles.deleteBtn} onClick={() => deleteExpense(expense.id)}>
                      <FaTrashAlt />
                    </button>
                  </>
                )}
              </div>
            </div>
          ))
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
    maxWidth: "1250px",
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
  toolbar: {
    maxWidth: "1250px",
    margin: "0 auto 18px auto",
    display: "flex",
    gap: "14px",
    alignItems: "center",
    justifyContent: "space-between",
    flexWrap: "wrap",
  },
  searchBar: {
    flex: 1,
    minWidth: "280px",
    background: "white",
    border: "1px solid #e2e8f0",
    borderRadius: "16px",
    padding: "12px 14px",
    display: "flex",
    alignItems: "center",
    gap: "10px",
    boxShadow: "0 10px 24px rgba(15,23,42,0.06)",
  },
  searchInput: {
    width: "100%",
    border: "none",
    outline: "none",
    background: "transparent",
    fontSize: "15px",
  },
  exportBtn: {
    background: "linear-gradient(135deg, #059669, #10b981)",
    color: "white",
    border: "none",
    borderRadius: "12px",
    padding: "12px 16px",
    cursor: "pointer",
    fontWeight: 700,
    display: "flex",
    alignItems: "center",
    gap: "8px",
  },
  tableCard: {
    maxWidth: "1250px",
    margin: "0 auto",
    background: "white",
    borderRadius: "22px",
    padding: "20px",
    boxShadow: "0 12px 28px rgba(15,23,42,0.08)",
    overflowX: "auto",
  },
  tableHeader: {
    display: "grid",
    gridTemplateColumns: "70px 1.7fr 1fr 1fr 1.2fr 160px",
    gap: "14px",
    background: "#1e3a8a",
    color: "white",
    padding: "14px",
    borderRadius: "14px",
    fontWeight: 700,
    marginBottom: "12px",
    minWidth: "900px",
  },
  row: {
    display: "grid",
    gridTemplateColumns: "70px 1.7fr 1fr 1fr 1.2fr 160px",
    gap: "14px",
    padding: "14px",
    borderBottom: "1px solid #e5e7eb",
    alignItems: "center",
    minWidth: "900px",
  },
  input: {
    width: "100%",
    padding: "10px 12px",
    borderRadius: "10px",
    border: "1px solid #cbd5e1",
    boxSizing: "border-box",
  },
  editBtn: {
    background: "#eff6ff",
    color: "#2563eb",
    border: "none",
    borderRadius: "10px",
    padding: "10px 12px",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    gap: "6px",
  },
  saveBtn: {
    background: "#dcfce7",
    color: "#059669",
    border: "none",
    borderRadius: "10px",
    padding: "10px 12px",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    gap: "6px",
  },
  deleteBtn: {
    background: "#fee2e2",
    color: "#dc2626",
    border: "none",
    borderRadius: "10px",
    padding: "10px 12px",
    cursor: "pointer",
  },
};

export default ExpensesPage;
