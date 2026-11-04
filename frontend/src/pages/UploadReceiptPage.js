import { formatCurrency } from "../utils/formatters";
import React, { useState, useEffect } from "react";
import API from "../api";
import { FaUpload, FaSave, FaImage, FaFileAlt } from "react-icons/fa";

function UploadReceiptPage() {
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [receipts, setReceipts] = useState([]);
  const [categories, setCategories] = useState([]);

  const [editTitle, setEditTitle] = useState("");
  const [editAmount, setEditAmount] = useState("");
  const [editDate, setEditDate] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [saveMessage, setSaveMessage] = useState("");

  const fetchReceipts = async () => {
    try {
      const response = await API.get("/receipts");
      setReceipts(response.data);
    } catch (error) {
      console.error("Failed to fetch receipts", error);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await API.get("/categories");
      setCategories(response.data);
    } catch (error) {
      console.error("Failed to fetch categories", error);
    }
  };

  useEffect(() => {
    fetchReceipts();
    fetchCategories();
  }, []);

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    setFile(selectedFile);
    setResult(null);
    setSaveMessage("");

    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }

    if (selectedFile) {
      setPreviewUrl(URL.createObjectURL(selectedFile));
    } else {
      setPreviewUrl(null);
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    setLoading(true);
    setSaveMessage("");

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await API.post("/receipts/ocr-receipt", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      const data = response.data;
      setResult(data);
      setEditTitle(data.title || "");
      setEditAmount(data.amount ?? "");
      setEditDate(data.date || "");
      fetchReceipts();
    } catch (error) {
      console.error("Upload failed", error);
      setSaveMessage("Upload failed.");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveCorrection = async () => {
    if (!result?.receipt_id) return;

    try {
      const response = await API.put(`/receipts/${result.receipt_id}`, {
        detected_title: editTitle,
        detected_amount: Number(editAmount),
        detected_date: editDate || null,
        category_id: categoryId ? Number(categoryId) : null,
      });

      const data = response.data;
      if (data.error) {
        setSaveMessage("Failed to update receipt.");
      } else {
        setSaveMessage("Receipt updated successfully.");
        fetchReceipts();
      }
    } catch (error) {
      console.error("Update failed", error);
      setSaveMessage("Update failed.");
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.headerCard}>
        <h1 style={styles.pageTitle}>Upload and Process Receipt</h1>
        <p style={styles.pageSubtitle}>
          Upload a receipt image, review OCR results, choose a category, and save it as a tracked expense.
        </p>
      </div>

      <div style={styles.container}>
        <div style={styles.leftCard}>
          <div style={styles.sectionHead}>
            <FaUpload />
            <span>Receipt Upload</span>
          </div>

          <div style={styles.uploadBox}>
            <input type="file" accept="image/*" onChange={handleFileChange} style={styles.fileInput} />
            <button style={styles.button} onClick={handleUpload}>
              {loading ? "Processing..." : "Upload Receipt"}
            </button>
          </div>

          {previewUrl && (
            <div style={styles.previewSection}>
              <h3 style={styles.sectionTitle}><FaImage /> Receipt Preview</h3>
              <img src={previewUrl} alt="Receipt Preview" style={styles.previewImage} />
            </div>
          )}

          {result && (
            <div style={styles.resultCard}>
              <h3 style={styles.sectionTitle}><FaFileAlt /> Extracted Information</h3>

              <label style={styles.label}>Title</label>
              <input
                style={styles.input}
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
              />

              <label style={styles.label}>Amount</label>
              <input
                style={styles.input}
                value={editAmount}
                onChange={(e) => setEditAmount(e.target.value)}
              />

              <label style={styles.label}>Date</label>
              <input
                style={styles.input}
                value={editDate}
                onChange={(e) => setEditDate(e.target.value)}
              />

              <label style={styles.label}>Category</label>
              <select
                style={styles.input}
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
              >
                <option value="">Select Category</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>

              <button style={styles.saveButton} onClick={handleSaveCorrection}>
                <FaSave /> Save Corrected Receipt
              </button>

              {saveMessage && <p style={styles.successText}>{saveMessage}</p>}

              <h4 style={styles.sectionTitle}>Raw OCR Text</h4>
              <div style={styles.ocrBox}>{result.extracted_text}</div>
            </div>
          )}
        </div>

        <div style={styles.rightCard}>
          <h2 style={styles.historyTitle}>Recent Receipts</h2>

          {receipts.length === 0 ? (
            <p style={styles.emptyText}>No receipts uploaded yet.</p>
          ) : (
            receipts.map((receipt) => (
              <div key={receipt.id} style={styles.historyItem}>
                <div style={styles.historyRow}>
                  <span style={styles.historyLabel}>File</span>
                  <span>{receipt.filename}</span>
                </div>
                <div style={styles.historyRow}>
                  <span style={styles.historyLabel}>Title</span>
                  <span>{receipt.detected_title}</span>
                </div>
                <div style={styles.historyRow}>
                  <span style={styles.historyLabel}>Amount</span>
                  <span>{formatCurrency(receipt.detected_amount)}</span>
                </div>
                <div style={styles.historyRow}>
                  <span style={styles.historyLabel}>Date</span>
                  <span>{receipt.detected_date || "-"}</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    background: "linear-gradient(135deg, #f8fafc, #e2e8f0)",
    padding: "30px",
  },
  headerCard: {
    maxWidth: "1300px",
    margin: "0 auto 24px auto",
    background: "linear-gradient(135deg, #0f172a, #1d4ed8, #7c3aed)",
    color: "white",
    borderRadius: "24px",
    padding: "26px",
    boxShadow: "0 18px 40px rgba(0,0,0,0.18)",
  },
  pageTitle: {
    margin: 0,
    fontSize: "32px",
  },
  pageSubtitle: {
    marginTop: "10px",
    color: "#dbeafe",
  },
  container: {
    maxWidth: "1300px",
    margin: "0 auto",
    display: "grid",
    gridTemplateColumns: "1.35fr 0.95fr",
    gap: "24px",
    alignItems: "start",
  },
  leftCard: {
    background: "white",
    borderRadius: "22px",
    padding: "28px",
    boxShadow: "0 12px 28px rgba(15,23,42,0.08)",
  },
  rightCard: {
    background: "white",
    borderRadius: "22px",
    padding: "24px",
    boxShadow: "0 12px 28px rgba(15,23,42,0.08)",
    maxHeight: "82vh",
    overflowY: "auto",
  },
  sectionHead: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    fontWeight: 800,
    fontSize: "18px",
    marginBottom: "18px",
  },
  uploadBox: {
    display: "flex",
    gap: "12px",
    flexWrap: "wrap",
    marginBottom: "20px",
  },
  fileInput: {
    padding: "12px",
    background: "#f8fafc",
    borderRadius: "12px",
    border: "1px solid #cbd5e1",
    flex: 1,
  },
  button: {
    padding: "12px 20px",
    border: "none",
    borderRadius: "12px",
    background: "linear-gradient(135deg, #2563eb, #7c3aed)",
    color: "white",
    fontSize: "15px",
    fontWeight: 700,
    cursor: "pointer",
    boxShadow: "0 12px 24px rgba(37,99,235,0.25)",
  },
  saveButton: {
    marginTop: "18px",
    padding: "12px 18px",
    border: "none",
    borderRadius: "12px",
    background: "linear-gradient(135deg, #059669, #10b981)",
    color: "white",
    fontSize: "15px",
    fontWeight: 700,
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    gap: "8px",
    boxShadow: "0 12px 24px rgba(16,185,129,0.22)",
  },
  previewSection: {
    marginTop: "18px",
    marginBottom: "24px",
  },
  previewImage: {
    width: "100%",
    maxWidth: "380px",
    borderRadius: "16px",
    border: "1px solid #e2e8f0",
    boxShadow: "0 10px 24px rgba(15,23,42,0.10)",
  },
  resultCard: {
    marginTop: "18px",
    padding: "22px",
    borderRadius: "18px",
    background: "#f8fafc",
    border: "1px solid #e2e8f0",
  },
  sectionTitle: {
    marginTop: 0,
    marginBottom: "14px",
    display: "flex",
    alignItems: "center",
    gap: "8px",
  },
  label: {
    display: "block",
    marginBottom: "6px",
    marginTop: "12px",
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
    background: "white",
  },
  ocrBox: {
    marginTop: "10px",
    background: "white",
    padding: "14px",
    borderRadius: "12px",
    border: "1px solid #e2e8f0",
    whiteSpace: "pre-wrap",
    maxHeight: "220px",
    overflowY: "auto",
    fontSize: "13px",
    color: "#334155",
  },
  successText: {
    marginTop: "12px",
    color: "#059669",
    fontWeight: 700,
  },
  historyTitle: {
    marginTop: 0,
    marginBottom: "18px",
  },
  emptyText: {
    color: "#64748b",
  },
  historyItem: {
    padding: "16px",
    borderRadius: "16px",
    background: "#f8fafc",
    border: "1px solid #e2e8f0",
    marginBottom: "14px",
  },
  historyRow: {
    display: "flex",
    justifyContent: "space-between",
    gap: "10px",
    marginBottom: "10px",
    fontSize: "14px",
  },
  historyLabel: {
    fontWeight: 800,
    color: "#334155",
  },
};

export default UploadReceiptPage;
