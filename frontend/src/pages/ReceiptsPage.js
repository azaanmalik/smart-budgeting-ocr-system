import React, { useEffect, useState } from "react";
import API from "../api";
import { FaTrashAlt, FaReceipt, FaSearch } from "react-icons/fa";
import { formatCurrency } from "../utils/formatters";

const ReceiptsPage = () => {
  const [imageUrls, setImageUrls] = useState({});
  const [receipts, setReceipts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");

  const fetchReceipts = async () => {
    try {
      setLoading(true);
      const res = await API.get("/receipts");
      setReceipts(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReceipts();
  }, []);

  useEffect(() => {
    let canceled = false;
    const created = [];
    const loadThumbnails = async () => {
      const entries = await Promise.all(receipts.map(async (receipt) => {
        if (!receipt.file_url) return null;
        try {
          const response = await API.get(receipt.file_url, { responseType: "blob" });
          const url = URL.createObjectURL(response.data);
          created.push(url);
          return [receipt.id, url];
        } catch (err) {
          return null;
        }
      }));
      if (!canceled) setImageUrls(Object.fromEntries(entries.filter(Boolean)));
    };
    loadThumbnails();
    return () => {
      canceled = true;
      created.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [receipts]);

  const handleDelete = async (receiptId) => {
    const ok = window.confirm("Are you sure you want to delete this receipt?");
    if (!ok) return;

    try {
      await API.delete(`/receipts/${receiptId}`);
      fetchReceipts();
    } catch (err) {
      console.error(err);
      alert("Failed to delete receipt.");
    }
  };

  const filteredReceipts = receipts.filter((receipt) => {
    const q = query.toLowerCase();
    return (
      receipt.filename?.toLowerCase().includes(q) ||
      receipt.detected_title?.toLowerCase().includes(q) ||
      String(receipt.detected_amount || "").includes(q) ||
      String(receipt.detected_date || "").includes(q)
    );
  });

  return (
    <div style={styles.page}>
      <div style={styles.heroCard}>
        <h1 style={styles.title}>Receipts History</h1>
        <p style={styles.subtitle}>
          Review all uploaded receipts, extracted values, preview thumbnails, and remove any records you no longer need.
        </p>
      </div>

      <div style={styles.searchBar}>
        <FaSearch color="#64748b" />
        <input
          type="text"
          placeholder="Search receipts by file, title, amount, or date"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          style={styles.searchInput}
        />
      </div>

      <div style={styles.grid}>
        {loading ? (
          [1, 2, 3].map((item) => (
            <div key={item} style={styles.loadingCard}>
              <div style={styles.loadingImage}></div>
              <div style={styles.loadingLine}></div>
              <div style={styles.loadingLineShort}></div>
            </div>
          ))
        ) : filteredReceipts.length === 0 ? (
          <div style={styles.emptyCard}>
            <h3 style={{ marginTop: 0 }}>No receipts found</h3>
            <p style={{ color: "#64748b", marginBottom: 0 }}>
              Try a different search or upload a new receipt to populate this page.
            </p>
          </div>
        ) : (
          filteredReceipts.map((receipt) => (
            <div
              key={receipt.id}
              style={styles.card}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-4px)";
                e.currentTarget.style.boxShadow = "0 18px 34px rgba(15,23,42,0.14)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "0 12px 28px rgba(15,23,42,0.08)";
              }}
            >
              <div style={styles.thumbWrap}>
                {imageUrls[receipt.id] ? (
                  <img src={imageUrls[receipt.id]} alt={receipt.filename} style={styles.thumb} />
                ) : (
                  <div style={styles.thumbPlaceholder}>
                    <FaReceipt size={28} color="#2563eb" />
                  </div>
                )}
              </div>

              <div style={styles.content}>
                <div style={styles.topRow}>
                  <h3 style={styles.cardTitle}>{receipt.detected_title || "Untitled Receipt"}</h3>
                  <button style={styles.deleteBtn} onClick={() => handleDelete(receipt.id)}>
                    <FaTrashAlt />
                  </button>
                </div>

                <p style={styles.fileName}>{receipt.filename}</p>

                <div style={styles.infoGrid}>
                  <div style={styles.infoBox}>
                    <span style={styles.label}>Amount</span>
                    <strong>{formatCurrency(receipt.detected_amount)}</strong>
                  </div>
                  <div style={styles.infoBox}>
                    <span style={styles.label}>Date</span>
                    <strong>{receipt.detected_date || "-"}</strong>
                  </div>
                </div>

                <div style={styles.rawTextBox}>
                  <div style={styles.rawTitle}>Extracted OCR Text</div>
                  <div style={styles.rawText}>{receipt.extracted_text || "No OCR text"}</div>
                </div>
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
  searchBar: {
    maxWidth: "1200px",
    margin: "0 auto 20px auto",
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
  grid: {
    maxWidth: "1200px",
    margin: "0 auto",
    display: "grid",
    gap: "20px",
  },
  emptyCard: {
    background: "white",
    padding: "24px",
    borderRadius: "22px",
    boxShadow: "0 12px 28px rgba(15,23,42,0.08)",
  },
  loadingCard: {
    background: "white",
    padding: "22px",
    borderRadius: "22px",
    boxShadow: "0 12px 28px rgba(15,23,42,0.08)",
  },
  loadingImage: {
    width: "100%",
    maxWidth: "140px",
    height: "90px",
    borderRadius: "14px",
    background: "#e2e8f0",
    marginBottom: "16px",
  },
  loadingLine: {
    width: "70%",
    height: "16px",
    borderRadius: "8px",
    background: "#e2e8f0",
    marginBottom: "10px",
  },
  loadingLineShort: {
    width: "45%",
    height: "14px",
    borderRadius: "8px",
    background: "#cbd5e1",
  },
  card: {
    background: "white",
    borderRadius: "22px",
    padding: "22px",
    boxShadow: "0 12px 28px rgba(15,23,42,0.08)",
    display: "grid",
    gridTemplateColumns: "160px 1fr",
    gap: "18px",
    transition: "transform 0.2s ease, box-shadow 0.2s ease",
  },
  thumbWrap: {
    width: "160px",
  },
  thumb: {
    width: "100%",
    height: "120px",
    objectFit: "cover",
    borderRadius: "16px",
    border: "1px solid #e2e8f0",
  },
  thumbPlaceholder: {
    width: "100%",
    height: "120px",
    borderRadius: "16px",
    background: "#eff6ff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    border: "1px solid #dbeafe",
  },
  content: {
    flex: 1,
  },
  topRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "12px",
  },
  cardTitle: {
    margin: 0,
    fontSize: "22px",
  },
  deleteBtn: {
    background: "#fee2e2",
    color: "#dc2626",
    border: "none",
    borderRadius: "12px",
    padding: "10px 12px",
    cursor: "pointer",
  },
  fileName: {
    color: "#64748b",
    marginTop: "6px",
    marginBottom: "18px",
  },
  infoGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "14px",
    marginBottom: "18px",
  },
  infoBox: {
    background: "#f8fafc",
    border: "1px solid #e2e8f0",
    borderRadius: "16px",
    padding: "14px",
  },
  label: {
    display: "block",
    color: "#64748b",
    fontSize: "13px",
    marginBottom: "6px",
  },
  rawTextBox: {
    background: "#f8fafc",
    border: "1px solid #e2e8f0",
    borderRadius: "16px",
    padding: "14px",
  },
  rawTitle: {
    fontWeight: 700,
    marginBottom: "10px",
  },
  rawText: {
    whiteSpace: "pre-wrap",
    maxHeight: "160px",
    overflowY: "auto",
    color: "#334155",
    fontSize: "13px",
  },
};

export default ReceiptsPage;